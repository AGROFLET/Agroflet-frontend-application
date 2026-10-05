import {loadSession} from "./session.storage.js";

/**
 * Adds the IAM bearer token to outbound requests when a user is authenticated.
 * It reads the persisted session directly to avoid a circular dependency with the IAM store.
 *
 * @param {import('axios').InternalAxiosRequestConfig} config - Axios request configuration.
 * @returns {import('axios').InternalAxiosRequestConfig} Updated request configuration.
 */
export const iamInterceptor = (config) => {
    const session = loadSession();
    if (session) config.headers.Authorization = `Bearer ${session.accessToken}`;
    return config;
}
