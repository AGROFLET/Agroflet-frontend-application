/**
 * Roles supported by the IAM bounded context.
 * A dispatcher coordinates operations and fleet; a buyer follows the shipments addressed to them.
 *
 * @readonly
 * @enum {string}
 */
export const UserType = Object.freeze({
    DISPATCHER: 'dispatcher',
    BUYER: 'buyer'
});

/** @type {string[]} Supported user types. */
export const USER_TYPES = Object.values(UserType);
