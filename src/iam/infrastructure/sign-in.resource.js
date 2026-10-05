/**
 * Infrastructure resource that represents an authenticated session.
 * Mirrors the contract of TS02 (POST /api/v1/auth/login): accessToken, expiresIn and minimal profile.
 *
 * @class SignInResource
 */
export class SignInResource {
    /**
     * @param {Object} params - Resource payload.
     * @param {number} params.id - Authenticated user identifier.
     * @param {string} params.email - Authenticated email.
     * @param {string} params.userType - Role of the user.
     * @param {string} params.accessToken - Bearer token.
     * @param {number} params.expiresIn - Token lifetime in seconds.
     */
    constructor({id, email, userType, accessToken, expiresIn}) {
        this.id = id;
        this.email = email;
        this.userType = userType;
        this.accessToken = accessToken;
        this.expiresIn = expiresIn;
    }
}
