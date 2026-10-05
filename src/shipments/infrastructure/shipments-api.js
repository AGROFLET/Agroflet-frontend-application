import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";

const shipmentsEndpointPath = import.meta.env.VITE_SHIPMENTS_ENDPOINT_PATH;
const statusChangesEndpointPath = import.meta.env.VITE_STATUS_CHANGES_ENDPOINT_PATH;
const locationsEndpointPath = import.meta.env.VITE_LOCATIONS_ENDPOINT_PATH;

/**
 * Infrastructure gateway for Shipment & Dispatch Operations endpoints (TS03–TS06, TS13, TS20).
 *
 * @class ShipmentsApi
 * @extends BaseApi
 */
export class ShipmentsApi extends BaseApi {
    #shipmentsEndpoint;
    #statusChangesEndpoint;
    #locationsEndpoint;

    /** Creates endpoint clients for shipments, status changes and locations. */
    constructor() {
        super();
        this.#shipmentsEndpoint = new BaseEndpoint(this, shipmentsEndpointPath);
        this.#statusChangesEndpoint = new BaseEndpoint(this, statusChangesEndpointPath);
        this.#locationsEndpoint = new BaseEndpoint(this, locationsEndpointPath);
    }

    /**
     * @param {Object} [params={}] - Filters (dispatcherId, buyerId, status, _sort, _order).
     * @returns {Promise<import('axios').AxiosResponse>} Shipments response.
     */
    getShipments(params = {}) {
        return this.#shipmentsEndpoint.getAll(params);
    }

    /**
     * @param {number} id - Shipment identifier.
     * @returns {Promise<import('axios').AxiosResponse>} Shipment response.
     */
    getShipmentById(id) {
        return this.#shipmentsEndpoint.getById(id);
    }

    /**
     * @param {Object} resource - Shipment resource.
     * @returns {Promise<import('axios').AxiosResponse>} Created shipment response.
     */
    createShipment(resource) {
        return this.#shipmentsEndpoint.create(resource);
    }

    /**
     * @param {number} id - Shipment identifier.
     * @param {Object} changes - Partial resource.
     * @returns {Promise<import('axios').AxiosResponse>} Updated shipment response.
     */
    patchShipment(id, changes) {
        return this.#shipmentsEndpoint.patch(id, changes);
    }

    /**
     * @param {number} id - Shipment identifier.
     * @returns {Promise<import('axios').AxiosResponse>} Delete response (used to roll back partial creations).
     */
    deleteShipment(id) {
        return this.#shipmentsEndpoint.delete(id);
    }

    /**
     * @param {number} shipmentId - Shipment identifier.
     * @returns {Promise<import('axios').AxiosResponse>} Status timeline response.
     */
    getStatusChanges(shipmentId) {
        return this.#statusChangesEndpoint.getAll({shipmentId, _sort: 'changedAt', _order: 'asc'});
    }

    /**
     * @param {Object} resource - Status change resource.
     * @returns {Promise<import('axios').AxiosResponse>} Created status change response.
     */
    createStatusChange(resource) {
        return this.#statusChangesEndpoint.create(resource);
    }

    /**
     * @returns {Promise<import('axios').AxiosResponse>} Locations catalog response.
     */
    getLocations() {
        return this.#locationsEndpoint.getAll();
    }
}
