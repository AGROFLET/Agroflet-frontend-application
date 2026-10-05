import {Shipment} from "../domain/model/shipment.entity.js";
import {extractCollection} from "../../shared/infrastructure/response.util.js";

/**
 * Maps shipment resources into domain entities and back.
 *
 * @class ShipmentAssembler
 */
export class ShipmentAssembler {
    /**
     * @param {Object} resource - Shipment resource payload.
     * @returns {Shipment} Shipment entity.
     */
    static toEntityFromResource(resource) {
        return new Shipment({...resource});
    }

    /**
     * @param {import('axios').AxiosResponse} response - HTTP response with shipment resources.
     * @returns {Shipment[]} Shipment entities.
     */
    static toEntitiesFromResponse(response) {
        return extractCollection(response, 'shipments').map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {Shipment} shipment - Shipment entity.
     * @returns {Object} Resource payload.
     */
    static toResourceFromEntity(shipment) {
        return {
            code: shipment.code,
            dispatcherId: shipment.dispatcherId,
            buyerId: shipment.buyerId,
            cargoType: shipment.cargoType,
            cargoDescription: (shipment.cargoDescription || '').trim(),
            weightTons: Number(shipment.weightTons),
            originId: shipment.originId,
            destinationId: shipment.destinationId,
            vehicleId: shipment.vehicleId,
            driverId: shipment.driverId,
            status: shipment.status,
            plannedDepartureAt: shipment.plannedDepartureAt,
            estimatedArrivalAt: shipment.estimatedArrivalAt,
            actualDepartureAt: shipment.actualDepartureAt,
            deliveredAt: shipment.deliveredAt,
            cancelledAt: shipment.cancelledAt,
            cancellationReason: shipment.cancellationReason,
            createdAt: shipment.createdAt,
            updatedAt: shipment.updatedAt
        };
    }
}
