import {MANAGEABLE_VEHICLE_STATUSES, VehicleStatus} from "./vehicle-status.js";

/** Peruvian plate format used by AgroFlet: three alphanumeric characters, hyphen, three digits (e.g. ABC-123). */
export const PLATE_PATTERN = /^[A-Z0-9]{3}-\d{3}$/;

/**
 * Vehicle (fleet unit) entity within the Fleet & Resource Management bounded context.
 *
 * @class Vehicle
 */
export class Vehicle {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?number} [params.id=null] - Vehicle identifier.
     * @param {?number} [params.dispatcherId=null] - Owner dispatcher (management scope).
     * @param {string} [params.plate=''] - License plate.
     * @param {string} [params.brand=''] - Brand.
     * @param {string} [params.model=''] - Model.
     * @param {?number} [params.year=null] - Manufacturing year.
     * @param {number} [params.capacityTons=0] - Payload capacity in metric tons.
     * @param {string} [params.bodyType='dry_van'] - Body type.
     * @param {string} [params.status='available'] - Operational status.
     * @param {?string} [params.updatedAt=null] - Last update timestamp.
     */
    constructor({id = null, dispatcherId = null, plate = '', brand = '', model = '', year = null, capacityTons = 0,
                    bodyType = 'dry_van', status = VehicleStatus.AVAILABLE, updatedAt = null}) {
        this.id = id;
        this.dispatcherId = dispatcherId;
        this.plate = plate.toUpperCase().trim();
        this.brand = brand;
        this.model = model;
        this.year = year;
        this.capacityTons = Number(capacityTons);
        this.bodyType = bodyType;
        this.status = status;
        this.updatedAt = updatedAt;
    }

    /** @returns {boolean} True when it can be selected for a new shipment. */
    get isAvailable() {
        return this.status === VehicleStatus.AVAILABLE;
    }

    /** @returns {boolean} True when a shipment holds the vehicle (reserved or in route). */
    get isLockedByShipment() {
        return this.status === VehicleStatus.RESERVED || this.status === VehicleStatus.IN_ROUTE;
    }

    /** @returns {string} Readable label for selectors. */
    get label() {
        return `${this.plate} · ${this.brand} ${this.model} · ${this.capacityTons} t`;
    }

    /**
     * @param {string} newStatus - Desired status.
     * @returns {boolean} True when the dispatcher may set it manually (US06, scenario 2).
     */
    canChangeStatusTo(newStatus) {
        return !this.isLockedByShipment && MANAGEABLE_VEHICLE_STATUSES.includes(newStatus);
    }

    /**
     * Validates the invariants of the registry form (US05).
     * @returns {string[]} Error codes; empty when valid.
     */
    validate() {
        const errors = [];
        if (!PLATE_PATTERN.test(this.plate)) errors.push('plate-format');
        if (!this.brand.trim()) errors.push('brand-required');
        if (!this.model.trim()) errors.push('model-required');
        const currentYear = new Date().getFullYear() + 1;
        if (!this.year || this.year < 1980 || this.year > currentYear) errors.push('year-range');
        if (!(this.capacityTons > 0)) errors.push('capacity-positive');
        return errors;
    }
}
