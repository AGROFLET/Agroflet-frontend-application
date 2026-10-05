import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";

const incidentsEndpointPath = import.meta.env.VITE_INCIDENTS_ENDPOINT_PATH;
const notificationsEndpointPath = import.meta.env.VITE_NOTIFICATIONS_ENDPOINT_PATH;

/**
 * Infrastructure gateway for Incident, Alert & Audit Management endpoints (TS07, TS08, TS15, TS16).
 *
 * @class IncidentsApi
 * @extends BaseApi
 */
export class IncidentsApi extends BaseApi {
    #incidentsEndpoint;
    #notificationsEndpoint;

    /** Creates endpoint clients for incidents and notifications. */
    constructor() {
        super();
        this.#incidentsEndpoint = new BaseEndpoint(this, incidentsEndpointPath);
        this.#notificationsEndpoint = new BaseEndpoint(this, notificationsEndpointPath);
    }

    /**
     * @param {Object} params - Filters (shipmentId, idempotencyKey).
     * @returns {Promise<import('axios').AxiosResponse>} Incidents response sorted by occurredAt desc.
     */
    getIncidents(params) {
        return this.#incidentsEndpoint.getAll({...params, _sort: 'occurredAt', _order: 'desc'});
    }

    /**
     * @param {Object} resource - Incident resource.
     * @returns {Promise<import('axios').AxiosResponse>} Created incident response.
     */
    createIncident(resource) {
        return this.#incidentsEndpoint.create(resource);
    }

    /**
     * @param {Object} params - Filters (recipientId, eventKey).
     * @returns {Promise<import('axios').AxiosResponse>} Notifications response sorted by createdAt desc.
     */
    getNotifications(params) {
        return this.#notificationsEndpoint.getAll({...params, _sort: 'createdAt', _order: 'desc'});
    }

    /**
     * @param {Object} resource - Notification resource.
     * @returns {Promise<import('axios').AxiosResponse>} Created notification response.
     */
    createNotification(resource) {
        return this.#notificationsEndpoint.create(resource);
    }

    /**
     * @param {number} id - Notification identifier.
     * @param {Object} changes - Partial resource.
     * @returns {Promise<import('axios').AxiosResponse>} Updated notification response.
     */
    patchNotification(id, changes) {
        return this.#notificationsEndpoint.patch(id, changes);
    }
}
