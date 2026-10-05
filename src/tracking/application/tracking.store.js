import {defineStore} from "pinia";
import {ref} from "vue";
import {TrackingApi} from "../infrastructure/tracking-api.js";
import {ReportedPositionAssembler} from "../infrastructure/reported-position.assembler.js";
import {PlannedRoute} from "../domain/model/planned-route.entity.js";
import useIamStore from "../../iam/application/iam.store.js";
import useShipmentsStore from "../../shipments/application/shipments.store.js";

const trackingApi = new TrackingApi();

/**
 * Application service store for geographic information (US17, US18, US32).
 *
 * @returns {Object} Store state and actions.
 */
const useTrackingStore = defineStore('tracking', () => {
    const iamStore = useIamStore();

    /** @type {import('vue').Ref<Object<number, import('../domain/model/reported-position.entity.js').ReportedPosition[]>>} */
    const positionsByShipment = ref({});
    /** @type {import('vue').Ref<Error[]>} */
    const errors = ref([]);

    /**
     * Loads the reported positions of one or many shipments, oldest first.
     * @param {number[]} shipmentIds - Shipment identifiers.
     * @returns {Promise<void>}
     */
    async function fetchPositions(shipmentIds) {
        const ids = [...new Set(shipmentIds)];
        if (!ids.length) return;
        try {
            const response = await trackingApi.getPositions(ids);
            const positions = ReportedPositionAssembler.toEntitiesFromResponse(response);
            const grouped = Object.fromEntries(ids.map(id => [id, []]));
            positions.forEach(position => grouped[position.shipmentId]?.push(position));
            positionsByShipment.value = {...positionsByShipment.value, ...grouped};
        } catch (error) {
            errors.value.push(error);
        }
    }

    /**
     * @param {number} shipmentId - Shipment identifier.
     * @returns {?import('../domain/model/reported-position.entity.js').ReportedPosition} Last reported position or null.
     */
    function getLastPosition(shipmentId) {
        const positions = positionsByShipment.value[shipmentId] || [];
        return positions.length ? positions[positions.length - 1] : null;
    }

    /**
     * Builds the planned route of a shipment from its georeferenced origin and destination (US18).
     * @param {import('../../shipments/domain/model/shipment.entity.js').Shipment} shipment - Shipment.
     * @returns {PlannedRoute} Planned route (isAvailable is false when a point is missing).
     */
    function getPlannedRoute(shipment) {
        const shipmentsStore = useShipmentsStore();
        const toPoint = location => location ? {latitude: location.latitude, longitude: location.longitude, label: location.label} : null;
        return new PlannedRoute({
            origin: toPoint(shipmentsStore.getLocationById(shipment.originId)),
            destination: toPoint(shipmentsStore.getLocationById(shipment.destinationId))
        });
    }

    /**
     * Registers a received position on an in-transit shipment (US32, TS26).
     * @param {import('../../shipments/domain/model/shipment.entity.js').Shipment} shipment - Shipment.
     * @param {import('../domain/model/reported-position.entity.js').ReportedPosition} position - Position draft.
     * @returns {Promise<{ok: boolean, errorCode?: string}>} Result.
     */
    async function registerPosition(shipment, position) {
        const shipmentsStore = useShipmentsStore();
        if (!shipment.acceptsTravelEvents) return {ok: false, errorCode: 'not-in-transit'};
        const [firstError] = position.validate();
        if (firstError) return {ok: false, errorCode: firstError};
        try {
            position.shipmentId = shipment.id;
            position.recordedBy = iamStore.currentUserId;
            const response = await trackingApi.createPosition(ReportedPositionAssembler.toResourceFromEntity(position));
            const created = ReportedPositionAssembler.toEntityFromResource(response.data);
            const current = positionsByShipment.value[shipment.id] || [];
            const positions = [...current, created].sort((a, b) => new Date(a.reportedAt) - new Date(b.reportedAt));
            positionsByShipment.value = {...positionsByShipment.value, [shipment.id]: positions};
            await shipmentsStore.touchShipment(shipment.id);
            return {ok: true};
        } catch (error) {
            errors.value.push(error);
            return {ok: false, errorCode: 'network'};
        }
    }

    /** Clears cached data when the session is closed. */
    function reset() {
        positionsByShipment.value = {};
        errors.value = [];
    }

    return {positionsByShipment, errors, fetchPositions, getLastPosition, getPlannedRoute, registerPosition, reset};
});

export default useTrackingStore;
