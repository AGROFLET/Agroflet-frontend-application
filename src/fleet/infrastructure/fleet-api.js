import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";

const vehiclesEndpointPath = import.meta.env.VITE_VEHICLES_ENDPOINT_PATH;
const driversEndpointPath = import.meta.env.VITE_DRIVERS_ENDPOINT_PATH;

/**
 * Infrastructure gateway for Fleet & Resource Management endpoints (TS09–TS12, TS19, TS25).
 *
 * @class FleetApi
 * @extends BaseApi
 */
export class FleetApi extends BaseApi {
    #vehiclesEndpoint;
    #driversEndpoint;

    /** Creates endpoint clients for vehicles and drivers. */
    constructor() {
        super();
        this.#vehiclesEndpoint = new BaseEndpoint(this, vehiclesEndpointPath);
        this.#driversEndpoint = new BaseEndpoint(this, driversEndpointPath);
    }

    /**
     * @param {Object} [params={}] - Filters (dispatcherId, status, plate).
     * @returns {Promise<import('axios').AxiosResponse>} Vehicles response.
     */
    getVehicles(params = {}) {
        return this.#vehiclesEndpoint.getAll(params);
    }

    /**
     * @param {number} id - Vehicle identifier.
     * @returns {Promise<import('axios').AxiosResponse>} Vehicle response.
     */
    getVehicleById(id) {
        return this.#vehiclesEndpoint.getById(id);
    }

    /**
     * @param {Object} resource - Vehicle resource.
     * @returns {Promise<import('axios').AxiosResponse>} Created vehicle response.
     */
    createVehicle(resource) {
        return this.#vehiclesEndpoint.create(resource);
    }

    /**
     * @param {number} id - Vehicle identifier.
     * @param {Object} changes - Partial resource.
     * @returns {Promise<import('axios').AxiosResponse>} Updated vehicle response.
     */
    patchVehicle(id, changes) {
        return this.#vehiclesEndpoint.patch(id, changes);
    }

    /**
     * @param {Object} [params={}] - Filters (dispatcherId, status, dni).
     * @returns {Promise<import('axios').AxiosResponse>} Drivers response.
     */
    getDrivers(params = {}) {
        return this.#driversEndpoint.getAll(params);
    }

    /**
     * @param {number} id - Driver identifier.
     * @returns {Promise<import('axios').AxiosResponse>} Driver response.
     */
    getDriverById(id) {
        return this.#driversEndpoint.getById(id);
    }

    /**
     * @param {Object} resource - Driver resource.
     * @returns {Promise<import('axios').AxiosResponse>} Created driver response.
     */
    createDriver(resource) {
        return this.#driversEndpoint.create(resource);
    }

    /**
     * @param {number} id - Driver identifier.
     * @param {Object} changes - Partial resource.
     * @returns {Promise<import('axios').AxiosResponse>} Updated driver response.
     */
    patchDriver(id, changes) {
        return this.#driversEndpoint.patch(id, changes);
    }
}
