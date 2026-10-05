/**
 * Browser persistence for the IAM session, so a page reload keeps the user signed in
 * until the token expires.
 */
const SESSION_KEY = 'agroflet.session';

/**
 * @param {{userId: number, accessToken: string, expiresAt: number}} session - Session to persist.
 */
export function saveSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/**
 * @returns {?{userId: number, accessToken: string, expiresAt: number}} Stored session when still valid.
 */
export function loadSession() {
    try {
        const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
        if (!session || !session.accessToken || session.expiresAt < Date.now()) return null;
        return session;
    } catch {
        return null;
    }
}

/** Removes the stored session (US03). */
export function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}
