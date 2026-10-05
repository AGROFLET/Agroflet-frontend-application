import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";
import {SignInResource} from "./sign-in.resource.js";
import {UserAssembler} from "./user.assembler.js";
import {extractCollection} from "../../shared/infrastructure/response.util.js";

const usersEndpointPath = import.meta.env.VITE_USERS_ENDPOINT_PATH;
const passwordResetRequestsEndpointPath = import.meta.env.VITE_PASSWORD_RESET_REQUESTS_ENDPOINT_PATH;

/** Session lifetime used by the Fake API emulation (8 hours). */
const SESSION_LIFETIME_SECONDS = 8 * 60 * 60;
/** Password reset links expire after 30 minutes. */
const RESET_TOKEN_LIFETIME_MS = 30 * 60 * 1000;

/**
 * Error raised by the IAM gateway with a stable code that the presentation layer translates.
 */
export class IamError extends Error {
    /**
     * @param {string} code - Stable error code (e.g. invalid-credentials, email-taken).
     */
    constructor(code) {
        super(code);
        this.name = 'IamError';
        this.code = code;
    }
}

/**
 * Builds an opaque demo token. The Fake API does not sign tokens; the RESTful API (TS02) will.
 * @param {number} userId - User identifier.
 * @returns {string} Token value.
 */
function createDemoToken(userId) {
    const random = Math.random().toString(36).slice(2);
    return btoa(`agroflet:${userId}:${Date.now()}:${random}`);
}

/**
 * Infrastructure gateway for IAM bounded-context endpoints.
 * While the RESTful API is not deployed, authentication is emulated over the json-server users collection.
 *
 * @class IamApi
 * @extends BaseApi
 */
export class IamApi extends BaseApi {
    #usersEndpoint;
    #passwordResetRequestsEndpoint;

    /** Creates endpoint clients for users and password reset requests. */
    constructor() {
        super();
        this.#usersEndpoint = new BaseEndpoint(this, usersEndpointPath);
        this.#passwordResetRequestsEndpoint = new BaseEndpoint(this, passwordResetRequestsEndpointPath);
    }

    /**
     * @param {string} email - Email to look up.
     * @returns {Promise<Object[]>} Raw user resources with that email.
     */
    async #findUsersByEmail(email) {
        const response = await this.#usersEndpoint.getAll({email});
        return extractCollection(response, 'users');
    }

    /**
     * Authenticates a user (US02). Incorrect credentials always produce the same generic error.
     * @param {import('../domain/model/sign-in.command.js').SignInCommand} command - Sign-in command.
     * @returns {Promise<SignInResource>} Session resource.
     */
    async signIn(command) {
        const [resource] = await this.#findUsersByEmail(command.email);
        if (!resource || resource.password !== command.password) throw new IamError('invalid-credentials');
        return new SignInResource({
            id: resource.id,
            email: resource.email,
            userType: resource.userType,
            accessToken: createDemoToken(resource.id),
            expiresIn: SESSION_LIFETIME_SECONDS
        });
    }

    /**
     * Registers a new account (US01). Duplicated emails are rejected.
     * @param {import('../domain/model/sign-up.command.js').SignUpCommand} command - Sign-up command.
     * @returns {Promise<import('../domain/model/user.entity.js').User>} Created user.
     */
    async signUp(command) {
        const existing = await this.#findUsersByEmail(command.email);
        if (existing.length) throw new IamError('email-taken');
        const response = await this.#usersEndpoint.create(UserAssembler.toResourceFromSignUpCommand(command));
        return UserAssembler.toEntityFromResource(response.data);
    }

    /**
     * @param {number} id - User identifier.
     * @returns {Promise<import('../domain/model/user.entity.js').User>} User entity.
     */
    async getUserById(id) {
        const response = await this.#usersEndpoint.getById(id);
        return UserAssembler.toEntityFromResource(response.data);
    }

    /**
     * @param {string} userType - Role to filter by.
     * @returns {Promise<import('../domain/model/user.entity.js').User[]>} Users with that role.
     */
    async getUsersByType(userType) {
        const response = await this.#usersEndpoint.getAll({userType});
        return UserAssembler.toEntitiesFromResponse(response);
    }

    /**
     * Updates editable profile fields only (US21).
     * @param {number} id - User identifier.
     * @param {import('../domain/model/update-profile.command.js').UpdateProfileCommand} command - Profile changes.
     * @returns {Promise<import('../domain/model/user.entity.js').User>} Updated user.
     */
    async updateProfile(id, command) {
        const response = await this.#usersEndpoint.patch(id, {...command});
        return UserAssembler.toEntityFromResource(response.data);
    }

    /**
     * Changes the password when the current one is correct (US22).
     * @param {number} id - User identifier.
     * @param {import('../domain/model/change-password.command.js').ChangePasswordCommand} command - Passwords.
     * @returns {Promise<void>}
     */
    async changePassword(id, command) {
        const response = await this.#usersEndpoint.getById(id);
        if (response.data.password !== command.currentPassword) throw new IamError('wrong-current-password');
        await this.#usersEndpoint.patch(id, {password: command.newPassword});
    }

    /**
     * Requests a password reset (US04). The answer is generic whether the account exists or not.
     * A one-time token is generated only when the account exists.
     * @param {string} email - Account email.
     * @returns {Promise<?string>} Token (only returned to support the demo without an email service).
     */
    async requestPasswordReset(email) {
        const [resource] = await this.#findUsersByEmail(email.trim().toLowerCase());
        if (!resource) return null;
        const token = createDemoToken(resource.id).replace(/=/g, '');
        await this.#passwordResetRequestsEndpoint.create({
            userId: resource.id,
            token,
            requestedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + RESET_TOKEN_LIFETIME_MS).toISOString(),
            used: false
        });
        return token;
    }

    /**
     * Resets the password with a valid, unexpired and unused token (US04, scenario 2).
     * @param {string} token - One-time token.
     * @param {string} newPassword - New password.
     * @returns {Promise<void>}
     */
    async resetPassword(token, newPassword) {
        const response = await this.#passwordResetRequestsEndpoint.getAll({token});
        const [request] = extractCollection(response, 'passwordResetRequests');
        if (!request || request.used || new Date(request.expiresAt).getTime() < Date.now()) {
            throw new IamError('invalid-reset-token');
        }
        await this.#usersEndpoint.patch(request.userId, {password: newPassword});
        await this.#passwordResetRequestsEndpoint.patch(request.id, {used: true, usedAt: new Date().toISOString()});
    }
}
