import {Vehicle} from "../domain/model/vehicle.entity.js";
import {extractCollection} from "../../shared/infrastructure/response.util.js";

/**
 * Maps vehicle resources into domain entities and back.
 *
 * @class VehicleAssembler
 */
export class VehicleAssembler {
    /**
     * @param {Object} resource - Vehicle resource payload.
     * @returns {Vehicle} Vehicle entity.
     */
    static toEntityFromResource(resource) {
        return new Vehicle({...resource});
    }

    /**
     * @param {import('axios').AxiosResponse} response - HTTP response with vehicle resources.
     * @returns {Vehicle[]} Vehicle entities.
     */
    static toEntitiesFromResponse(response) {
        return extractCollection(response, 'vehicles').map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {Vehicle} vehicle - Vehicle entity.
     * @returns {Object} Resource payload.
     */
    static toResourceFromEntity(vehicle) {
        return {
            dispatcherId: vehicle.dispatcherId,
            plate: vehicle.plate,
            brand: vehicle.brand.trim(),
            model: vehicle.model.trim(),
            year: Number(vehicle.year),
            capacityTons: Number(vehicle.capacityTons),
            bodyType: vehicle.bodyType,
            status: vehicle.status,
            updatedAt: new Date().toISOString()
        };
    }
}
