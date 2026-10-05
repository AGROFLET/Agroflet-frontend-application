/**
 * Immutable entry of the shipment status timeline (audit trail, TS20).
 *
 * @class StatusChange
 */
export class StatusChange {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?number} [params.id=null] - Identifier.
     * @param {number} params.shipmentId - Shipment identifier.
     * @param {?string} [params.previousStatus=null] - Previous status (null on creation).
     * @param {string} params.newStatus - New status.
     * @param {string} params.changedAt - Timestamp (ISO).
     * @param {number} params.changedBy - Author user identifier.
     * @param {?string} [params.reason=null] - Reason (cancellations).
     */
    constructor({id = null, shipmentId, previousStatus = null, newStatus, changedAt, changedBy, reason = null}) {
        this.id = id;
        this.shipmentId = shipmentId;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.changedAt = changedAt;
        this.changedBy = changedBy;
        this.reason = reason;
    }
}
