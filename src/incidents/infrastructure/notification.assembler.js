import {Notification} from "../domain/model/notification.entity.js";
import {extractCollection} from "../../shared/infrastructure/response.util.js";

/**
 * Maps notification resources into domain entities.
 *
 * @class NotificationAssembler
 */
export class NotificationAssembler {
    /**
     * @param {Object} resource - Notification resource.
     * @returns {Notification} Entity.
     */
    static toEntityFromResource(resource) {
        return new Notification({...resource});
    }

    /**
     * @param {import('axios').AxiosResponse} response - HTTP response.
     * @returns {Notification[]} Entities.
     */
    static toEntitiesFromResponse(response) {
        return extractCollection(response, 'notifications').map(resource => this.toEntityFromResource(resource));
    }
}
