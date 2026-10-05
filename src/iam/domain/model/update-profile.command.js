/**
 * Command to update the editable profile data of the signed-in user.
 * Role and identifier are intentionally not part of this command (US21, scenario 2).
 *
 * @class UpdateProfileCommand
 */
export class UpdateProfileCommand {
    /**
     * @param {Object} params - Command attributes.
     * @param {string} params.firstName - First name.
     * @param {string} params.lastName - Last name.
     * @param {string} params.phone - Mobile phone.
     * @param {string} params.companyName - Company or cooperative.
     * @param {string} params.preferredLanguage - Preferred UI language (en | es).
     */
    constructor({firstName, lastName, phone, companyName, preferredLanguage}) {
        this.firstName = firstName.trim();
        this.lastName = lastName.trim();
        this.phone = phone.trim();
        this.companyName = companyName.trim();
        this.preferredLanguage = preferredLanguage;
    }
}
