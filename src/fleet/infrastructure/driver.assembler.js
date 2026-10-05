import {Driver} from "../domain/model/driver.entity.js";
import {extractCollection} from "../../shared/infrastructure/response.util.js";

/**
 * Maps driver resources into domain entities and back.
 *
 * @class DriverAssembler
 */
export class DriverAssembler {
    /**
     * @param {Object} resource - Driver resource payload.
     * @returns {Driver} Driver entity.
     */
    static toEntityFromResource(resource) {
        return new Driver({...resource});
    }

    /**
     * @param {import('axios').AxiosResponse} response - HTTP response with driver resources.
     * @returns {Driver[]} Driver entities.
     */
    static toEntitiesFromResponse(response) {
        return extractCollection(response, 'drivers').map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {Driver} driver - Driver entity.
     * @returns {Object} Resource payload.
     */
    static toResourceFromEntity(driver) {
        return {
            dispatcherId: driver.dispatcherId,
            firstName: driver.firstName.trim(),
            lastName: driver.lastName.trim(),
            dni: driver.dni,
            licenseNumber: driver.licenseNumber,
            licenseCategory: driver.licenseCategory,
            phone: driver.phone,
            status: driver.status,
            updatedAt: new Date().toISOString()
        };
    }
}
