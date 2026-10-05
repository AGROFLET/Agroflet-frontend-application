import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";

const positionsEndpointPath = import.meta.env.VITE_POSITIONS_ENDPOINT_PATH;

/**
 * Infrastructure gateway for Real-Time Tracking & Route Telemetry endpoints (TS14, TS26).
 *
 * @class TrackingApi
 * @extends BaseApi
 */
export class TrackingApi extends BaseApi {
    #positionsEndpoint;

    /** Creates the endpoint client for reported positions. */
    constructor() {
        super();
        this.#positionsEndpoint = new BaseEndpoint(this, positionsEndpointPath);
    }

    /**
     * @param {number|number[]} shipmentId - One or many shipment identifiers.
     * @returns {Promise<import('axios').AxiosResponse>} Positions response sorted by reportedAt asc.
     */
    getPositions(shipmentId) {
        return this.#positionsEndpoint.getAll({shipmentId, _sort: 'reportedAt', _order: 'asc'});
    }

    /**
     * @param {Object} resource - Position resource.
     * @returns {Promise<import('axios').AxiosResponse>} Created position response.
     */
    createPosition(resource) {
        return this.#positionsEndpoint.create(resource);
    }
}
