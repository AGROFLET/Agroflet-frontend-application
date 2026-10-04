/**
 * Lifecycle status of a shipment operation: planned → in_transit → delivered; cancelled from planned or in_transit.
 *
 * @readonly
 * @enum {string}
 */
export const ShipmentStatus = Object.freeze({
    PLANNED: 'planned',
    IN_TRANSIT: 'in_transit',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
});

/** @type {string[]} Every shipment status, in lifecycle order. */
export const SHIPMENT_STATUSES = Object.values(ShipmentStatus);

/** @type {string[]} Statuses considered active (they appear on the dashboard). */
export const ACTIVE_SHIPMENT_STATUSES = [ShipmentStatus.PLANNED, ShipmentStatus.IN_TRANSIT];

/** @type {string[]} Terminal statuses: they cannot be reopened. */
export const TERMINAL_SHIPMENT_STATUSES = [ShipmentStatus.DELIVERED, ShipmentStatus.CANCELLED];

/** Cargo types (perishable food) handled by AgroFlet. */
export const CARGO_TYPES = ['potato', 'carrot', 'onion', 'fresh_fruit', 'leafy_vegetables', 'grains', 'other'];
