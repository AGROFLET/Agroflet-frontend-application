/**
 * Command used by the IAM application layer to register a new account.
 *
 * @class SignUpCommand
 */
export class SignUpCommand {
    /**
     * @param {Object} params - Command attributes.
     * @param {string} params.firstName - First name.
     * @param {string} params.lastName - Last name.
     * @param {string} params.email - Email used to sign in.
     * @param {string} params.password - Desired password.
     * @param {string} params.userType - Role: dispatcher or buyer.
     * @param {string} [params.phone=''] - Mobile phone.
     * @param {string} [params.companyName=''] - Company or cooperative.
     * @param {string} [params.preferredLanguage='en'] - Preferred UI language.
     */
    constructor({firstName, lastName, email, password, userType, phone = '', companyName = '', preferredLanguage = 'en'}) {
        this.firstName = firstName.trim();
        this.lastName = lastName.trim();
        this.email = email.trim().toLowerCase();
        this.password = password;
        this.userType = userType;
        this.phone = phone.trim();
        this.companyName = companyName.trim();
        this.preferredLanguage = preferredLanguage;
    }
}
