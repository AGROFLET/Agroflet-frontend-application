/** Incident types reported on the road (Ubiquitous Language: Incident). */
export const INCIDENT_TYPES = ['road_block', 'landslide', 'mechanical_failure', 'accident', 'heavy_traffic', 'weather', 'other'];

/**
 * Incident (route contingency) entity of the Incident, Alert & Audit Management bounded context.
 *
 * @class Incident
 */
export class Incident {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?number} [params.id=null] - Identifier.
     * @param {?number} [params.shipmentId=null] - Related shipment.
     * @param {string} [params.type='road_block'] - Incident type.
     * @param {string} [params.description=''] - Description.
     * @param {number} [params.estimatedDelayMinutes=0] - Estimated delay added to the ETA.
     * @param {?string} [params.occurredAt=null] - When it happened (ISO).
     * @param {?number} [params.reportedBy=null] - Author user identifier.
     * @param {string} [params.idempotencyKey=''] - Key that prevents duplicates on retries.
     * @param {?string} [params.createdAt=null] - Registration timestamp (ISO).
     */
    constructor({id = null, shipmentId = null, type = 'road_block', description = '', estimatedDelayMinutes = 0,
                    occurredAt = null, reportedBy = null, idempotencyKey = '', createdAt = null}) {
        this.id = id;
        this.shipmentId = shipmentId;
        this.type = type;
        this.description = description;
        this.estimatedDelayMinutes = Number(estimatedDelayMinutes);
        this.occurredAt = occurredAt;
        this.reportedBy = reportedBy;
        this.idempotencyKey = idempotencyKey;
        this.createdAt = createdAt;
    }

    /**
     * Validates the incident data (US13).
     * @returns {string[]} Error codes; empty when valid.
     */
    validate() {
        const errors = [];
        if (!INCIDENT_TYPES.includes(this.type)) errors.push('type-required');
        if (!this.description.trim()) errors.push('description-required');
        if (!Number.isInteger(this.estimatedDelayMinutes) || this.estimatedDelayMinutes < 0) errors.push('delay-non-negative');
        if (!this.occurredAt) errors.push('occurred-at-required');
        else if (new Date(this.occurredAt).getTime() > Date.now() + 60000) errors.push('occurred-at-future');
        return errors;
    }
}

/**
 * Creates a unique idempotency key for an incident form session.
 * @returns {string} Key.
 */
export function createIdempotencyKey() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
