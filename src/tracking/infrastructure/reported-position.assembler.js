import {ReportedPosition} from "../domain/model/reported-position.entity.js";
import {extractCollection} from "../../shared/infrastructure/response.util.js";

/**
 * Maps reported position resources into domain entities and back.
 *
 * @class ReportedPositionAssembler
 */
export class ReportedPositionAssembler {
    /**
     * @param {Object} resource - Position resource.
     * @returns {ReportedPosition} Entity.
     */
    static toEntityFromResource(resource) {
        return new ReportedPosition({...resource});
    }

    /**
     * @param {import('axios').AxiosResponse} response - HTTP response.
     * @returns {ReportedPosition[]} Entities.
     */
    static toEntitiesFromResponse(response) {
        return extractCollection(response, 'positions').map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {ReportedPosition} position - Entity.
     * @returns {Object} Resource payload.
     */
    static toResourceFromEntity(position) {
        return {
            shipmentId: position.shipmentId,
            latitude: position.latitude,
            longitude: position.longitude,
            reportedAt: position.reportedAt,
            recordedAt: new Date().toISOString(),
            source: position.source,
            recordedBy: position.recordedBy,
            isDemo: false,
            note: (position.note || '').trim()
        };
    }
}
