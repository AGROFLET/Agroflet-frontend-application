import {Incident} from "../domain/model/incident.entity.js";
import {extractCollection} from "../../shared/infrastructure/response.util.js";

/**
 * Maps incident resources into domain entities and back.
 *
 * @class IncidentAssembler
 */
export class IncidentAssembler {
    /**
     * @param {Object} resource - Incident resource.
     * @returns {Incident} Entity.
     */
    static toEntityFromResource(resource) {
        return new Incident({...resource});
    }

    /**
     * @param {import('axios').AxiosResponse} response - HTTP response.
     * @returns {Incident[]} Entities.
     */
    static toEntitiesFromResponse(response) {
        return extractCollection(response, 'incidents').map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {Incident} incident - Entity.
     * @returns {Object} Resource payload.
     */
    static toResourceFromEntity(incident) {
        return {
            shipmentId: incident.shipmentId,
            type: incident.type,
            description: incident.description.trim(),
            estimatedDelayMinutes: incident.estimatedDelayMinutes,
            occurredAt: incident.occurredAt,
            reportedBy: incident.reportedBy,
            idempotencyKey: incident.idempotencyKey,
            createdAt: new Date().toISOString()
        };
    }
}
