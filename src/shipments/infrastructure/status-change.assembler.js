import {StatusChange} from "../domain/model/status-change.entity.js";
import {extractCollection} from "../../shared/infrastructure/response.util.js";

/**
 * Maps status change resources into domain entities.
 *
 * @class StatusChangeAssembler
 */
export class StatusChangeAssembler {
    /**
     * @param {Object} resource - Status change resource.
     * @returns {StatusChange} Entity.
     */
    static toEntityFromResource(resource) {
        return new StatusChange({...resource});
    }

    /**
     * @param {import('axios').AxiosResponse} response - HTTP response.
     * @returns {StatusChange[]} Entities.
     */
    static toEntitiesFromResponse(response) {
        return extractCollection(response, 'statusChanges').map(resource => this.toEntityFromResource(resource));
    }
}
