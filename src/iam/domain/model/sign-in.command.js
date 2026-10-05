/**
 * Command used by the IAM application layer to request authentication.
 *
 * @class SignInCommand
 */
export class SignInCommand {
    /**
     * @param {Object} params - Command attributes.
     * @param {string} params.email - Email credential.
     * @param {string} params.password - Password credential.
     */
    constructor({email, password}) {
        this.email = email.trim().toLowerCase();
        this.password = password;
    }
}
