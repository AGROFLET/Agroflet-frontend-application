/**
 * Operational status of a driver.
 * @readonly
 * @enum {string}
 */
export const DriverStatus = Object.freeze({
    AVAILABLE: 'available',
    ASSIGNED: 'assigned'
});

/** Peruvian driver license categories for cargo transport. */
export const LICENSE_CATEGORIES = ['A-IIa', 'A-IIb', 'A-IIIa', 'A-IIIb', 'A-IIIc'];

/**
 * Driver (carrier) entity within the Fleet & Resource Management bounded context.
 *
 * @class Driver
 */
export class Driver {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?number} [params.id=null] - Driver identifier.
     * @param {?number} [params.dispatcherId=null] - Owner dispatcher (management scope).
     * @param {string} [params.firstName=''] - First name.
     * @param {string} [params.lastName=''] - Last name.
     * @param {string} [params.dni=''] - National ID (8 digits).
     * @param {string} [params.licenseNumber=''] - License number.
     * @param {string} [params.licenseCategory='A-IIIb'] - License category.
     * @param {string} [params.phone=''] - Mobile phone (9 digits).
     * @param {string} [params.status='available'] - Operational status.
     * @param {?string} [params.updatedAt=null] - Last update timestamp.
     */
    constructor({id = null, dispatcherId = null, firstName = '', lastName = '', dni = '', licenseNumber = '',
                    licenseCategory = 'A-IIIb', phone = '', status = DriverStatus.AVAILABLE, updatedAt = null}) {
        this.id = id;
        this.dispatcherId = dispatcherId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.dni = dni.trim();
        this.licenseNumber = licenseNumber.toUpperCase().trim();
        this.licenseCategory = licenseCategory;
        this.phone = phone.trim();
        this.status = status;
        this.updatedAt = updatedAt;
    }

    /** @returns {string} Full name. */
    get fullName() {
        return `${this.firstName} ${this.lastName}`.trim();
    }

    /** @returns {boolean} True when it can be selected for a new shipment. */
    get isAvailable() {
        return this.status === DriverStatus.AVAILABLE;
    }

    /** @returns {string} Readable label for selectors. */
    get label() {
        return `${this.fullName} · ${this.licenseCategory}`;
    }

    /**
     * Validates identity, license and contact data (US07).
     * @returns {string[]} Error codes; empty when valid.
     */
    validate() {
        const errors = [];
        if (!this.firstName.trim()) errors.push('first-name-required');
        if (!this.lastName.trim()) errors.push('last-name-required');
        if (!/^\d{8}$/.test(this.dni)) errors.push('dni-format');
        if (!/^[A-Z]\d{8}$/.test(this.licenseNumber)) errors.push('license-format');
        if (!LICENSE_CATEGORIES.includes(this.licenseCategory)) errors.push('license-category');
        if (!/^9\d{8}$/.test(this.phone)) errors.push('phone-format');
        return errors;
    }
}
