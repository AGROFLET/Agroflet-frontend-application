import {defineStore} from "pinia";
import {ref} from "vue";
import {IncidentsApi} from "../infrastructure/incidents-api.js";
import {IncidentAssembler} from "../infrastructure/incident.assembler.js";
import {NotificationType} from "../domain/model/notification.entity.js";
import useIamStore from "../../iam/application/iam.store.js";
import useShipmentsStore from "../../shipments/application/shipments.store.js";
import useNotificationsStore from "./notifications.store.js";

const incidentsApi = new IncidentsApi();

/**
 * Result of an incident use case.
 * @typedef {{ok: boolean, errorCode?: string, incident?: import('../domain/model/incident.entity.js').Incident,
 *            duplicated?: boolean}} IncidentResult
 */

/**
 * Application service store for route incidents (US13, US14).
 * Registering an incident triggers the ETA recalculation policy and the incident alerts (US19).
 *
 * @returns {Object} Store state and actions.
 */
const useIncidentsStore = defineStore('incidents', () => {
    const iamStore = useIamStore();

    /** @type {import('vue').Ref<Object<number, import('../domain/model/incident.entity.js').Incident[]>>} */
    const incidentsByShipment = ref({});
    /** @type {import('vue').Ref<Error[]>} */
    const errors = ref([]);

    /**
     * Loads the incidents of a shipment ordered by date, newest first (US14, TS08).
     * @param {number} shipmentId - Shipment identifier.
     * @returns {Promise<import('../domain/model/incident.entity.js').Incident[]>} Incidents (empty when none).
     */
    async function fetchIncidents(shipmentId) {
        try {
            const response = await incidentsApi.getIncidents({shipmentId});
            const incidents = IncidentAssembler.toEntitiesFromResponse(response);
            incidentsByShipment.value = {...incidentsByShipment.value, [shipmentId]: incidents};
            return incidents;
        } catch (error) {
            errors.value.push(error);
            return [];
        }
    }

    /**
     * Registers an incident on an in-transit shipment (US13, TS07).
     * A retry with the same idempotency key returns the existing incident without adding the delay again.
     * @param {import('../../shipments/domain/model/shipment.entity.js').Shipment} shipment - Shipment.
     * @param {import('../domain/model/incident.entity.js').Incident} incident - Incident draft.
     * @returns {Promise<IncidentResult>} Result.
     */
    async function registerIncident(shipment, incident) {
        const shipmentsStore = useShipmentsStore();
        const notificationsStore = useNotificationsStore();
        if (!shipment.acceptsTravelEvents) return {ok: false, errorCode: 'not-in-transit'};
        const [firstError] = incident.validate();
        if (firstError) return {ok: false, errorCode: firstError};
        try {
            const existingResponse = await incidentsApi.getIncidents({idempotencyKey: incident.idempotencyKey});
            const [existing] = IncidentAssembler.toEntitiesFromResponse(existingResponse);
            if (existing) return {ok: true, incident: existing, duplicated: true};
            incident.shipmentId = shipment.id;
            incident.reportedBy = iamStore.currentUserId;
            const response = await incidentsApi.createIncident(IncidentAssembler.toResourceFromEntity(incident));
            const created = IncidentAssembler.toEntityFromResource(response.data);
            await shipmentsStore.applyIncidentDelay(shipment.id, created.estimatedDelayMinutes);
            await notificationsStore.publish({
                type: NotificationType.INCIDENT,
                eventKey: `incident-${created.id}`,
                recipientIds: [shipment.buyerId, shipment.dispatcherId],
                shipmentId: shipment.id,
                shipmentCode: shipment.code,
                payload: {incidentType: created.type, estimatedDelayMinutes: created.estimatedDelayMinutes}
            });
            const current = incidentsByShipment.value[shipment.id] || [];
            incidentsByShipment.value = {...incidentsByShipment.value, [shipment.id]: [created, ...current]};
            return {ok: true, incident: created, duplicated: false};
        } catch (error) {
            errors.value.push(error);
            return {ok: false, errorCode: 'network'};
        }
    }

    /** Clears cached data when the session is closed. */
    function reset() {
        incidentsByShipment.value = {};
        errors.value = [];
    }

    return {incidentsByShipment, errors, fetchIncidents, registerIncident, reset};
});

export default useIncidentsStore;
