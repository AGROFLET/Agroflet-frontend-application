import {UserType} from "./user-type.js";

/**
 * IAM user aggregate root representation used by the client domain model.
 * It never stores credentials.
 *
 * @class User
 */
export class User {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?number} [params.id=null] - Unique user identifier.
     * @param {string} [params.firstName=''] - First name.
     * @param {string} [params.lastName=''] - Last name.
     * @param {string} [params.email=''] - Email used to sign in.
     * @param {string} [params.userType='dispatcher'] - Role ({@link UserType}).
     * @param {string} [params.phone=''] - Peruvian mobile phone (9 digits).
     * @param {string} [params.companyName=''] - Company, cooperative or market stall.
     * @param {string} [params.preferredLanguage='en'] - Preferred UI language (en | es).
     */
    constructor({id = null, firstName = '', lastName = '', email = '', userType = UserType.DISPATCHER,
                    phone = '', companyName = '', preferredLanguage = 'en'}) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.userType = userType;
        this.phone = phone;
        this.companyName = companyName;
        this.preferredLanguage = preferredLanguage;
    }

    /** @returns {string} Full name to display. */
    get fullName() {
        return `${this.firstName} ${this.lastName}`.trim();
    }

    /** @returns {boolean} True when the user coordinates operations. */
    get isDispatcher() {
        return this.userType === UserType.DISPATCHER;
    }

    /** @returns {boolean} True when the user receives shipments. */
    get isBuyer() {
        return this.userType === UserType.BUYER;
    }
}
