/**
 * Domain rules for credentials and contact data shared by the IAM forms.
 */

/** Minimum password length accepted by AgroFlet. */
export const PASSWORD_MIN_LENGTH = 8;

/**
 * @param {string} email - Email to validate.
 * @returns {boolean} True when the email has a valid format.
 */
export function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((email || '').trim());
}

/**
 * A valid password has at least 8 characters, one letter and one digit.
 * @param {string} password - Password to validate.
 * @returns {boolean} True when the password satisfies the policy.
 */
export function isValidPassword(password) {
    const value = password || '';
    return value.length >= PASSWORD_MIN_LENGTH && /[A-Za-z]/.test(value) && /\d/.test(value);
}

/**
 * Peruvian mobile phone: 9 digits starting with 9. Empty is accepted (optional field).
 * @param {string} phone - Phone to validate.
 * @returns {boolean} True when the phone is empty or valid.
 */
export function isValidPhone(phone) {
    const value = (phone || '').trim();
    return value === '' || /^9\d{8}$/.test(value);
}
