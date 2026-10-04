/**
 * Operational status of a vehicle (Ubiquitous Language: Available, Reserved, In Route, Under Maintenance).
 * Only AVAILABLE and UNDER_MAINTENANCE can be changed manually; RESERVED and IN_ROUTE are managed by shipments.
 *
 * @readonly
 * @enum {string}
 */
export const VehicleStatus = Object.freeze({
    AVAILABLE: 'available',
    RESERVED: 'reserved',
    IN_ROUTE: 'in_route',
    UNDER_MAINTENANCE: 'under_maintenance'
});

/** Statuses a dispatcher can set manually (TS19). */
export const MANAGEABLE_VEHICLE_STATUSES = [VehicleStatus.AVAILABLE, VehicleStatus.UNDER_MAINTENANCE];

/** Body types supported by the fleet registry. */
export const VEHICLE_BODY_TYPES = ['refrigerated_van', 'dry_van', 'stake_bed', 'flatbed', 'tanker', 'other'];
