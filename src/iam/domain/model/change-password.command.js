/**
 * Command to change the password of the signed-in user (US22).
 *
 * @class ChangePasswordCommand
 */
export class ChangePasswordCommand {
    /**
     * @param {Object} params - Command attributes.
     * @param {string} params.currentPassword - Current password.
     * @param {string} params.newPassword - New password.
     */
    constructor({currentPassword, newPassword}) {
        this.currentPassword = currentPassword;
        this.newPassword = newPassword;
    }
}
