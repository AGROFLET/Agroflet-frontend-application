import {ACTIVE_SHIPMENT_STATUSES, ShipmentStatus, TERMINAL_SHIPMENT_STATUSES} from "./shipment-status.js";

/**
 * Error raised when a lifecycle transition is not allowed by the shipment state machine.
 */
export class ShipmentTransitionError extends Error {
    /**
     * @param {string} code - Stable error code.
     */
    constructor(code) {
        super(code);
        this.name = 'ShipmentTransitionError';
        this.code = code;
    }
}

/**
 * Shipment (transport operation) aggregate root of the Shipment & Dispatch Operations core domain.
 * It protects the lifecycle rules: planned → in_transit → delivered, cancelled from planned or in_transit.
 *
 * @class Shipment
 */
export class Shipment {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?number} [params.id=null] - Identifier.
     * @param {string} [params.code=''] - Human readable code (AGF-0001).
     * @param {?number} [params.dispatcherId=null] - Dispatcher that owns the operation.
     * @param {?number} [params.buyerId=null] - Buyer that receives the cargo.
     * @param {string} [params.cargoType='potato'] - Cargo type.
     * @param {string} [params.cargoDescription=''] - Free text description of the cargo.
     * @param {number} [params.weightTons=0] - Cargo weight in metric tons.
     * @param {?number} [params.originId=null] - Origin location.
     * @param {?number} [params.destinationId=null] - Destination location.
     * @param {?number} [params.vehicleId=null] - Reserved vehicle.
     * @param {?number} [params.driverId=null] - Reserved driver.
     * @param {string} [params.status='planned'] - Lifecycle status.
     * @param {?string} [params.plannedDepartureAt=null] - Planned departure (ISO).
     * @param {?string} [params.estimatedArrivalAt=null] - Estimated time of arrival (ISO).
     * @param {?string} [params.actualDepartureAt=null] - Effective departure (ISO).
     * @param {?string} [params.deliveredAt=null] - Delivery timestamp (ISO).
     * @param {?string} [params.cancelledAt=null] - Cancellation timestamp (ISO).
     * @param {?string} [params.cancellationReason=null] - Cancellation reason.
     * @param {?string} [params.createdAt=null] - Creation timestamp (ISO).
     * @param {?string} [params.updatedAt=null] - Last update timestamp (ISO).
     */
    constructor({id = null, code = '', dispatcherId = null, buyerId = null, cargoType = 'potato', cargoDescription = '',
                    weightTons = 0, originId = null, destinationId = null, vehicleId = null, driverId = null,
                    status = ShipmentStatus.PLANNED, plannedDepartureAt = null, estimatedArrivalAt = null,
                    actualDepartureAt = null, deliveredAt = null, cancelledAt = null, cancellationReason = null,
                    createdAt = null, updatedAt = null}) {
        this.id = id;
        this.code = code;
        this.dispatcherId = dispatcherId;
        this.buyerId = buyerId;
        this.cargoType = cargoType;
        this.cargoDescription = cargoDescription;
        this.weightTons = Number(weightTons);
        this.originId = originId;
        this.destinationId = destinationId;
        this.vehicleId = vehicleId;
        this.driverId = driverId;
        this.status = status;
        this.plannedDepartureAt = plannedDepartureAt;
        this.estimatedArrivalAt = estimatedArrivalAt;
        this.actualDepartureAt = actualDepartureAt;
        this.deliveredAt = deliveredAt;
        this.cancelledAt = cancelledAt;
        this.cancellationReason = cancellationReason;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    /** @returns {boolean} True for planned or in transit operations. */
    get isActive() {
        return ACTIVE_SHIPMENT_STATUSES.includes(this.status);
    }

    /** @returns {boolean} True for delivered or cancelled operations. */
    get isTerminal() {
        return TERMINAL_SHIPMENT_STATUSES.includes(this.status);
    }

    /** @returns {boolean} True when the effective departure can be registered (US31). */
    get canStartTransit() {
        return this.status === ShipmentStatus.PLANNED;
    }

    /** @returns {boolean} True when the delivery can be registered (US12). */
    get canBeDelivered() {
        return this.status === ShipmentStatus.IN_TRANSIT;
    }

    /** @returns {boolean} True when the operation can be cancelled (US12). */
    get canBeCancelled() {
        return this.isActive;
    }

    /** @returns {boolean} True when incidents and positions can be registered (US13, US32). */
    get acceptsTravelEvents() {
        return this.status === ShipmentStatus.IN_TRANSIT;
    }

    /**
     * Validates the data of a new operation against the selected vehicle capacity (US09).
     * @param {?{capacityTons: number}} vehicle - Selected vehicle.
     * @returns {string[]} Error codes; empty when valid.
     */
    validateForCreation(vehicle) {
        const errors = [];
        if (!this.buyerId) errors.push('buyer-required');
        if (!this.originId) errors.push('origin-required');
        if (!this.destinationId) errors.push('destination-required');
        if (this.originId && this.originId === this.destinationId) errors.push('same-origin-destination');
        if (!(this.weightTons > 0)) errors.push('weight-positive');
        if (vehicle && this.weightTons > vehicle.capacityTons) errors.push('weight-exceeds-capacity');
        if (!this.vehicleId) errors.push('vehicle-required');
        if (!this.driverId) errors.push('driver-required');
        if (!this.plannedDepartureAt) errors.push('departure-required');
        if (!this.estimatedArrivalAt) errors.push('arrival-required');
        if (this.plannedDepartureAt && this.estimatedArrivalAt
            && new Date(this.estimatedArrivalAt) <= new Date(this.plannedDepartureAt)) {
            errors.push('arrival-before-departure');
        }
        return errors;
    }

    /**
     * Registers the effective departure (US31).
     * @param {Date} [at=new Date()] - Departure moment.
     */
    startTransit(at = new Date()) {
        if (!this.canStartTransit) throw new ShipmentTransitionError('invalid-transition');
        this.status = ShipmentStatus.IN_TRANSIT;
        this.actualDepartureAt = at.toISOString();
        this.updatedAt = at.toISOString();
    }

    /**
     * Registers the delivery (US12, scenario 1).
     * @param {Date} [at=new Date()] - Delivery moment.
     */
    markAsDelivered(at = new Date()) {
        if (!this.canBeDelivered) throw new ShipmentTransitionError('invalid-transition');
        this.status = ShipmentStatus.DELIVERED;
        this.deliveredAt = at.toISOString();
        this.updatedAt = at.toISOString();
    }

    /**
     * Cancels the operation with a mandatory reason (US12, scenario 2).
     * @param {string} reason - Cancellation reason.
     * @param {Date} [at=new Date()] - Cancellation moment.
     */
    cancel(reason, at = new Date()) {
        if (!this.canBeCancelled) throw new ShipmentTransitionError('invalid-transition');
        if (!reason || !reason.trim()) throw new ShipmentTransitionError('reason-required');
        this.status = ShipmentStatus.CANCELLED;
        this.cancellationReason = reason.trim();
        this.cancelledAt = at.toISOString();
        this.updatedAt = at.toISOString();
    }

    /**
     * Adds an estimated delay to the ETA (ETA recalculation policy triggered by an incident, US13).
     * @param {number} minutes - Non-negative delay in minutes.
     * @param {Date} [at=new Date()] - Recalculation moment.
     */
    applyDelay(minutes, at = new Date()) {
        if (!this.acceptsTravelEvents) throw new ShipmentTransitionError('not-in-transit');
        const delay = Math.max(0, Number(minutes) || 0);
        const base = new Date(this.estimatedArrivalAt || at);
        this.estimatedArrivalAt = new Date(base.getTime() + delay * 60000).toISOString();
        this.updatedAt = at.toISOString();
    }
}
