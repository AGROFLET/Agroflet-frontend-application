import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {IamApi} from "../infrastructure/iam-api.js";
import {clearSession, loadSession, saveSession} from "../infrastructure/session.storage.js";
import {UserType} from "../domain/model/user-type.js";
import {setLocale} from "../../i18n.js";

const iamApi = new IamApi();

/**
 * Application service store for the IAM bounded context.
 * It coordinates authentication commands, the current session and the profile use cases.
 *
 * @returns {Object} Store state and actions.
 */
const useIamStore = defineStore('iam', () => {
    /** @type {import('vue').Ref<?import('../domain/model/user.entity.js').User>} Signed-in user. */
    const currentUser = ref(null);
    /** @type {import('vue').Ref<?string>} Current bearer token. */
    const accessToken = ref(null);
    /** @type {import('vue').Ref<Error[]>} Errors raised by IAM use cases. */
    const errors = ref([]);
    /** @type {import('vue').Ref<boolean>} Whether a persisted session was already evaluated. */
    const sessionRestored = ref(false);
    /** @type {import('vue').Ref<import('../domain/model/user.entity.js').User[]>} Buyers available to dispatchers. */
    const buyers = ref([]);

    /** @type {import('vue').ComputedRef<boolean>} */
    const isSignedIn = computed(() => !!currentUser.value && !!accessToken.value);
    /** @type {import('vue').ComputedRef<boolean>} */
    const isDispatcher = computed(() => currentUser.value?.userType === UserType.DISPATCHER);
    /** @type {import('vue').ComputedRef<boolean>} */
    const isBuyer = computed(() => currentUser.value?.userType === UserType.BUYER);
    /** @type {import('vue').ComputedRef<?number>} */
    const currentUserId = computed(() => currentUser.value?.id ?? null);

    /**
     * Restores a persisted session once per page load.
     * @returns {Promise<void>}
     */
    async function restoreSession() {
        if (sessionRestored.value) return;
        sessionRestored.value = true;
        const session = loadSession();
        if (!session) return;
        try {
            currentUser.value = await iamApi.getUserById(session.userId);
            accessToken.value = session.accessToken;
        } catch (error) {
            clearSession();
            errors.value.push(error);
        }
    }

    /**
     * Executes the sign-in use case (US02).
     * @param {import('../domain/model/sign-in.command.js').SignInCommand} command - Sign-in command.
     * @returns {Promise<boolean>} True when the session was created.
     */
    async function signIn(command) {
        errors.value = [];
        try {
            const resource = await iamApi.signIn(command);
            currentUser.value = await iamApi.getUserById(resource.id);
            accessToken.value = resource.accessToken;
            saveSession({
                userId: resource.id,
                accessToken: resource.accessToken,
                expiresAt: Date.now() + resource.expiresIn * 1000
            });
            if (currentUser.value.preferredLanguage) setLocale(currentUser.value.preferredLanguage);
            return true;
        } catch (error) {
            errors.value.push(error);
            return false;
        }
    }

    /**
     * Executes the sign-up use case (US01).
     * @param {import('../domain/model/sign-up.command.js').SignUpCommand} command - Sign-up command.
     * @returns {Promise<boolean>} True when the account was created.
     */
    async function signUp(command) {
        errors.value = [];
        try {
            await iamApi.signUp(command);
            return true;
        } catch (error) {
            errors.value.push(error);
            return false;
        }
    }

    /** Clears the active IAM session and local auth artifacts (US03). */
    function signOut() {
        currentUser.value = null;
        accessToken.value = null;
        buyers.value = [];
        errors.value = [];
        clearSession();
    }

    /**
     * Updates the editable profile data (US21) and applies the preferred language (US23).
     * @param {import('../domain/model/update-profile.command.js').UpdateProfileCommand} command - Profile changes.
     * @returns {Promise<boolean>} True when saved.
     */
    async function updateProfile(command) {
        errors.value = [];
        try {
            currentUser.value = await iamApi.updateProfile(currentUserId.value, command);
            setLocale(currentUser.value.preferredLanguage);
            return true;
        } catch (error) {
            errors.value.push(error);
            return false;
        }
    }

    /**
     * Persists only the preferred language, used by the language switcher when signed in.
     * @param {string} locale - Locale code.
     * @returns {Promise<void>}
     */
    async function savePreferredLanguage(locale) {
        if (!isSignedIn.value || currentUser.value.preferredLanguage === locale) return;
        try {
            currentUser.value = await iamApi.updateProfile(currentUserId.value, {preferredLanguage: locale});
        } catch (error) {
            errors.value.push(error);
        }
    }

    /**
     * Changes the password (US22). The session is closed afterwards, per the documented policy.
     * @param {import('../domain/model/change-password.command.js').ChangePasswordCommand} command - Passwords.
     * @returns {Promise<boolean>} True when changed.
     */
    async function changePassword(command) {
        errors.value = [];
        try {
            await iamApi.changePassword(currentUserId.value, command);
            return true;
        } catch (error) {
            errors.value.push(error);
            return false;
        }
    }

    /**
     * Requests password recovery instructions (US04).
     * @param {string} email - Account email.
     * @returns {Promise<?string>} Demo token when the account exists; the UI message is always generic.
     */
    async function requestPasswordReset(email) {
        errors.value = [];
        try {
            return await iamApi.requestPasswordReset(email);
        } catch (error) {
            errors.value.push(error);
            return null;
        }
    }

    /**
     * Resets the password with a one-time token (US04).
     * @param {string} token - Reset token.
     * @param {string} newPassword - New password.
     * @returns {Promise<boolean>} True when the password was reset.
     */
    async function resetPassword(token, newPassword) {
        errors.value = [];
        try {
            await iamApi.resetPassword(token, newPassword);
            return true;
        } catch (error) {
            errors.value.push(error);
            return false;
        }
    }

    /**
     * Loads the buyers a dispatcher can associate with a shipment.
     * @returns {Promise<void>}
     */
    async function fetchBuyers() {
        try {
            buyers.value = await iamApi.getUsersByType(UserType.BUYER);
        } catch (error) {
            errors.value.push(error);
        }
    }

    /**
     * @param {number} id - User identifier.
     * @returns {Promise<?import('../domain/model/user.entity.js').User>} User or null when unavailable.
     */
    async function findUserById(id) {
        try {
            return await iamApi.getUserById(id);
        } catch {
            return null;
        }
    }

    return {
        currentUser,
        accessToken,
        errors,
        buyers,
        sessionRestored,
        isSignedIn,
        isDispatcher,
        isBuyer,
        currentUserId,
        restoreSession,
        signIn,
        signUp,
        signOut,
        updateProfile,
        savePreferredLanguage,
        changePassword,
        requestPasswordReset,
        resetPassword,
        fetchBuyers,
        findUserById
    };
});

export default useIamStore;
