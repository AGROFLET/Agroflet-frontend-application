/**
 * Value object with the search and filter criteria of the shipment history (US15, US16).
 *
 * @class ShipmentFilter
 */
export class ShipmentFilter {
    /**
     * @param {Object} [params={}] - Criteria.
     * @param {string} [params.term=''] - Shipment code or vehicle plate.
     * @param {?string} [params.status=null] - Status.
     * @param {?string} [params.cargoType=null] - Cargo type.
     * @param {?number} [params.destinationId=null] - Destination.
     * @param {?Date} [params.startDate=null] - Planned departure from.
     * @param {?Date} [params.endDate=null] - Planned departure until.
     */
    constructor({term = '', status = null, cargoType = null, destinationId = null, startDate = null, endDate = null} = {}) {
        this.term = term;
        this.status = status;
        this.cargoType = cargoType;
        this.destinationId = destinationId;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    /** @returns {boolean} True when the date range is inverted (US15, scenario 2). */
    get hasInvertedRange() {
        return !!(this.startDate && this.endDate && this.startDate > this.endDate);
    }

    /** @returns {boolean} True when at least one criterion is active. */
    get isActive() {
        return !!(this.term.trim() || this.status || this.cargoType || this.destinationId || this.startDate || this.endDate);
    }

    /**
     * Evaluates every criterion at once: a shipment must satisfy all active filters.
     * @param {import('./shipment.entity.js').Shipment} shipment - Shipment to evaluate.
     * @param {?string} plate - Plate of the vehicle assigned to the shipment.
     * @returns {boolean} True when the shipment matches.
     */
    matches(shipment, plate) {
        const term = this.term.trim().toUpperCase();
        if (term && !shipment.code.toUpperCase().includes(term) && !(plate || '').toUpperCase().includes(term)) return false;
        if (this.status && shipment.status !== this.status) return false;
        if (this.cargoType && shipment.cargoType !== this.cargoType) return false;
        if (this.destinationId && shipment.destinationId !== this.destinationId) return false;
        const departure = shipment.plannedDepartureAt ? new Date(shipment.plannedDepartureAt) : null;
        if (this.startDate && departure) {
            const start = new Date(this.startDate);
            start.setHours(0, 0, 0, 0);
            if (departure < start) return false;
        }
        if (this.endDate && departure) {
            const end = new Date(this.endDate);
            end.setHours(23, 59, 59, 999);
            if (departure > end) return false;
        }
        return true;
    }
}
