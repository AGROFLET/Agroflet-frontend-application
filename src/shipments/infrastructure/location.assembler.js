import {Location} from "../domain/model/location.entity.js";
import {extractCollection} from "../../shared/infrastructure/response.util.js";

/**
 * Maps location resources into domain entities.
 *
 * @class LocationAssembler
 */
export class LocationAssembler {
    /**
     * @param {Object} resource - Location resource.
     * @returns {Location} Entity.
     */
    static toEntityFromResource(resource) {
        return new Location({...resource});
    }

    /**
     * @param {import('axios').AxiosResponse} response - HTTP response.
     * @returns {Location[]} Entities.
     */
    static toEntitiesFromResponse(response) {
        return extractCollection(response, 'locations').map(resource => this.toEntityFromResource(resource));
    }
}
