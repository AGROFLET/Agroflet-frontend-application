import useIamStore from "../application/iam.store.js";

/**
 * Navigation guard that protects private routes and role-restricted routes.
 * - Anonymous users are redirected to sign-in (US03, scenario 2).
 * - Signed-in users are redirected away from public-only pages (sign-in/sign-up).
 * - Routes with meta.roles only admit those roles (a buyer cannot manage the fleet).
 *
 * @param {import('vue-router').RouteLocationNormalized} to - Target route.
 * @returns {Promise<{name: string, query?: Object}|boolean>} True to allow navigation or a redirect.
 */
export const authenticationGuard = async (to) => {
    const store = useIamStore();
    await store.restoreSession();
    const isPublic = to.meta['public'] === true;
    const isGuestOnly = to.meta['guestOnly'] === true;
    if (!store.isSignedIn && !isPublic) return {name: 'iam-sign-in', query: {redirect: to.fullPath}};
    if (store.isSignedIn && isGuestOnly) return {name: 'dashboard'};
    const roles = to.meta['roles'];
    if (store.isSignedIn && Array.isArray(roles) && !roles.includes(store.currentUser?.userType)) {
        return {name: 'dashboard'};
    }
    return true;
}
