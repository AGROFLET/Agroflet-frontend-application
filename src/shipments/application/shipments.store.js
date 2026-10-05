import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {ShipmentsApi} from "../infrastructure/shipments-api.js";
import {ShipmentAssembler} from "../infrastructure/shipment.assembler.js";
import {StatusChangeAssembler} from "../infrastructure/status-change.assembler.js";
import {LocationAssembler} from "../infrastructure/location.assembler.js";
import {Shipment} from "../domain/model/shipment.entity.js";
import {ShipmentStatus} from "../domain/model/shipment-status.js";
import {ShipmentFilter} from "../domain/model/shipment-filter.js";
import useIamStore from "../../iam/application/iam.store.js";
import useFleetStore from "../../fleet/application/fleet.store.js";
import useNotificationsStore from "../../incidents/application/notifications.store.js";
import {NotificationType} from "../../incidents/domain/model/notification.entity.js";

const shipmentsApi = new ShipmentsApi();

/**
 * Result of a shipment use case.
 * @typedef {{ok: boolean, errorCode?: string, shipment?: Shipment}} ShipmentResult
 */

/**
 * Application service store for the Shipment & Dispatch Operations bounded context (core domain).
 * It orchestrates the lifecycle use cases and integrates with Fleet (resource locking) and Alerts (notifications).
 *
 * @returns {Object} Store state and actions.
 */
const useShipmentsStore = defineStore('shipments', () => {
    const iamStore = useIamStore();
    const fleetStore = useFleetStore();
    const notificationsStore = useNotificationsStore();

    /** @type {import('vue').Ref<Shipment[]>} Shipments the signed-in user is authorized to see. */
    const shipments = ref([]);
    /** @type {import('vue').Ref<import('../domain/model/location.entity.js').Location[]>} */
    const locations = ref([]);
    /** @type {import('vue').Ref<Object<number, string>>} Vehicle plates indexed by vehicle id. */
    const vehiclePlates = ref({});
    /** @type {import('vue').Ref<boolean>} */
    const shipmentsLoaded = ref(false);
    /** @type {import('vue').Ref<Error[]>} */
    const errors = ref([]);
    /** @type {import('vue').Ref<ShipmentFilter>} History filters, kept when returning from a detail view. */
    const filter = ref(new ShipmentFilter());

    /** @type {import('vue').ComputedRef<Shipment[]>} Planned and in-transit shipments (US10). */
    const activeShipments = computed(() => shipments.value.filter(shipment => shipment.isActive));
    /** @type {import('vue').ComputedRef<Shipment[]>} Shipments that satisfy the history filter (US15, US16). */
    const filteredShipments = computed(() =>
        filter.value.hasInvertedRange ? [] : shipments.value.filter(shipment =>
            filter.value.matches(shipment, vehiclePlates.value[shipment.vehicleId])));
    /** @type {import('vue').ComputedRef<Object<string, number>>} Count of shipments per status. */
    const countByStatus = computed(() => shipments.value.reduce((counts, shipment) => {
        counts[shipment.status] = (counts[shipment.status] || 0) + 1;
        return counts;
    }, {}));

    /**
     * @param {Shipment} shipment - Shipment.
     * @returns {boolean} True when the signed-in user participates in the shipment.
     */
    function isParticipant(shipment) {
        const userId = iamStore.currentUserId;
        return shipment.dispatcherId === userId || shipment.buyerId === userId;
    }

    /**
     * Loads the geographic catalog of origins and destinations.
     * @returns {Promise<void>}
     */
    async function fetchLocations() {
        if (locations.value.length) return;
        try {
            const response = await shipmentsApi.getLocations();
            locations.value = LocationAssembler.toEntitiesFromResponse(response);
        } catch (error) {
            errors.value.push(error);
        }
    }

    /**
     * @param {number} id - Location identifier.
     * @returns {import('../domain/model/location.entity.js').Location|undefined} Location.
     */
    function getLocationById(id) {
        return locations.value.find(location => location.id === id);
    }

    /**
     * Loads the shipments authorized for the signed-in user (US10, TS03): dispatchers see the ones they
     * created; buyers only the ones addressed to them.
     * @returns {Promise<void>}
     */
    async function fetchShipments() {
        try {
            const scope = iamStore.isBuyer ? {buyerId: iamStore.currentUserId} : {dispatcherId: iamStore.currentUserId};
            const response = await shipmentsApi.getShipments({...scope, _sort: 'plannedDepartureAt', _order: 'desc'});
            shipments.value = ShipmentAssembler.toEntitiesFromResponse(response);
            const vehicles = await fleetStore.fetchVehiclesByIds(shipments.value.map(shipment => shipment.vehicleId));
            vehiclePlates.value = Object.fromEntries(vehicles.map(vehicle => [vehicle.id, vehicle.plate]));
        } catch (error) {
            errors.value.push(error);
        } finally {
            shipmentsLoaded.value = true;
        }
    }

    /**
     * Retrieves one shipment only when the user participates in it (US11). A foreign or missing shipment
     * returns null without revealing whether it exists.
     * @param {number|string} id - Shipment identifier.
     * @returns {Promise<?Shipment>} Shipment or null.
     */
    async function fetchShipmentById(id) {
        try {
            const response = await shipmentsApi.getShipmentById(Number(id));
            const shipment = ShipmentAssembler.toEntityFromResource(response.data);
            if (!isParticipant(shipment)) return null;
            upsertLocal(shipment);
            return shipment;
        } catch {
            return null;
        }
    }

    /**
     * @param {Shipment} shipment - Shipment to insert or replace in local state.
     */
    function upsertLocal(shipment) {
        const index = shipments.value.findIndex(item => item.id === shipment.id);
        if (index === -1) shipments.value.unshift(shipment); else shipments.value[index] = shipment;
    }

    /**
     * @returns {Promise<string>} Next human-readable shipment code (AGF-0001).
     */
    async function generateCode() {
        const response = await shipmentsApi.getShipments({_sort: 'id', _order: 'desc', _limit: 1});
        const [last] = ShipmentAssembler.toEntitiesFromResponse(response);
        const next = (last?.id || 0) + 1;
        return `AGF-${String(next).padStart(4, '0')}`;
    }

    /**
     * Appends an entry to the status timeline and notifies the participants (US20).
     * @param {Shipment} shipment - Shipment after the change.
     * @param {?string} previousStatus - Previous status.
     * @param {?string} [reason=null] - Reason (cancellations).
     * @returns {Promise<void>}
     */
    async function recordStatusChange(shipment, previousStatus, reason = null) {
        const response = await shipmentsApi.createStatusChange({
            shipmentId: shipment.id,
            previousStatus,
            newStatus: shipment.status,
            changedAt: shipment.updatedAt,
            changedBy: iamStore.currentUserId,
            reason
        });
        await notificationsStore.publish({
            type: NotificationType.STATUS_CHANGE,
            eventKey: `status-change-${response.data.id}`,
            recipientIds: [shipment.buyerId, shipment.dispatcherId],
            shipmentId: shipment.id,
            shipmentCode: shipment.code,
            payload: {previousStatus, newStatus: shipment.status}
        });
    }

    /**
     * Registers a planned shipment and reserves vehicle and driver (US08, US09, TS04).
     * Availability is re-checked right before saving; if the reservation fails, the shipment is rolled back
     * so no partial records remain.
     * @param {Shipment} draft - Shipment draft built by the form.
     * @returns {Promise<ShipmentResult>} Result.
     */
    async function createShipment(draft) {
        const vehicle = fleetStore.getVehicleById(draft.vehicleId);
        const [firstError] = draft.validateForCreation(vehicle);
        if (firstError) return {ok: false, errorCode: firstError};
        let created = null;
        try {
            const availability = await fleetStore.checkAvailability(draft.vehicleId, draft.driverId);
            if (!availability.ok) return availability;
            const now = new Date().toISOString();
            const shipment = new Shipment({
                ...draft,
                code: await generateCode(),
                dispatcherId: iamStore.currentUserId,
                status: ShipmentStatus.PLANNED,
                createdAt: now,
                updatedAt: now
            });
            const response = await shipmentsApi.createShipment(ShipmentAssembler.toResourceFromEntity(shipment));
            created = ShipmentAssembler.toEntityFromResource(response.data);
            await fleetStore.reserveResources(created.vehicleId, created.driverId);
            await recordStatusChange(created, null);
            upsertLocal(created);
            vehiclePlates.value = {...vehiclePlates.value, [created.vehicleId]: vehicle?.plate};
            return {ok: true, shipment: created};
        } catch (error) {
            errors.value.push(error);
            if (created) await shipmentsApi.deleteShipment(created.id).catch(() => null);
            return {ok: false, errorCode: 'network'};
        }
    }

    /**
     * Applies a lifecycle transition, persists it, updates the resources and records the timeline.
     * @param {Shipment} shipment - Current shipment.
     * @param {function(Shipment): void} transition - Domain method to apply on a copy.
     * @param {function(Shipment): Promise<void>} updateResources - Fleet side effect.
     * @param {?string} [reason=null] - Reason for the timeline.
     * @returns {Promise<ShipmentResult>} Result.
     */
    async function applyTransition(shipment, transition, updateResources, reason = null) {
        const fresh = await fetchShipmentById(shipment.id);
        if (!fresh) return {ok: false, errorCode: 'not-found'};
        if (fresh.dispatcherId !== iamStore.currentUserId) return {ok: false, errorCode: 'forbidden'};
        const previousStatus = fresh.status;
        try {
            transition(fresh);
        } catch (error) {
            return {ok: false, errorCode: error.code || 'invalid-transition'};
        }
        try {
            const response = await shipmentsApi.patchShipment(fresh.id, ShipmentAssembler.toResourceFromEntity(fresh));
            const updated = ShipmentAssembler.toEntityFromResource(response.data);
            await updateResources(updated);
            await recordStatusChange(updated, previousStatus, reason);
            upsertLocal(updated);
            return {ok: true, shipment: updated};
        } catch (error) {
            errors.value.push(error);
            return {ok: false, errorCode: 'network'};
        }
    }

    /**
     * Registers the effective departure: planned → in_transit (US31, TS06).
     * @param {Shipment} shipment - Shipment.
     * @returns {Promise<ShipmentResult>} Result.
     */
    function startTransit(shipment) {
        return applyTransition(shipment, item => item.startTransit(),
            item => fleetStore.lockResourcesInRoute(item.vehicleId, item.driverId));
    }

    /**
     * Registers the delivery: in_transit → delivered, releasing resources (US12).
     * @param {Shipment} shipment - Shipment.
     * @returns {Promise<ShipmentResult>} Result.
     */
    function markAsDelivered(shipment) {
        return applyTransition(shipment, item => item.markAsDelivered(),
            item => fleetStore.releaseResources(item.vehicleId, item.driverId));
    }

    /**
     * Cancels a planned or in-transit shipment with a reason, releasing resources (US12).
     * @param {Shipment} shipment - Shipment.
     * @param {string} reason - Cancellation reason.
     * @returns {Promise<ShipmentResult>} Result.
     */
    function cancelShipment(shipment, reason) {
        return applyTransition(shipment, item => item.cancel(reason),
            item => fleetStore.releaseResources(item.vehicleId, item.driverId), reason);
    }

    /**
     * ETA recalculation policy: adds the incident delay once to the estimated arrival (US13).
     * @param {number} shipmentId - Shipment identifier.
     * @param {number} minutes - Delay in minutes.
     * @returns {Promise<ShipmentResult>} Result with the updated shipment.
     */
    async function applyIncidentDelay(shipmentId, minutes) {
        const fresh = await fetchShipmentById(shipmentId);
        if (!fresh) return {ok: false, errorCode: 'not-found'};
        try {
            fresh.applyDelay(minutes);
        } catch (error) {
            return {ok: false, errorCode: error.code};
        }
        const response = await shipmentsApi.patchShipment(fresh.id, {
            estimatedArrivalAt: fresh.estimatedArrivalAt,
            updatedAt: fresh.updatedAt
        });
        const updated = ShipmentAssembler.toEntityFromResource(response.data);
        upsertLocal(updated);
        return {ok: true, shipment: updated};
    }

    /**
     * Updates the last-update mark of a shipment (e.g. after a reported position).
     * @param {number} shipmentId - Shipment identifier.
     * @returns {Promise<void>}
     */
    async function touchShipment(shipmentId) {
        try {
            const response = await shipmentsApi.patchShipment(shipmentId, {updatedAt: new Date().toISOString()});
            upsertLocal(ShipmentAssembler.toEntityFromResource(response.data));
        } catch (error) {
            errors.value.push(error);
        }
    }

    /**
     * Loads the status timeline of a shipment (TS20).
     * @param {number} shipmentId - Shipment identifier.
     * @returns {Promise<import('../domain/model/status-change.entity.js').StatusChange[]>} Timeline.
     */
    async function fetchStatusChanges(shipmentId) {
        try {
            const response = await shipmentsApi.getStatusChanges(shipmentId);
            return StatusChangeAssembler.toEntitiesFromResponse(response);
        } catch (error) {
            errors.value.push(error);
            return [];
        }
    }

    /**
     * @param {Object} criteria - New filter criteria.
     */
    function setFilter(criteria) {
        filter.value = new ShipmentFilter(criteria);
    }

    /** Clears every filter and returns to the full authorized list. */
    function clearFilter() {
        filter.value = new ShipmentFilter();
    }

    /** Clears cached data (on sign-out). */
    function reset() {
        shipments.value = [];
        vehiclePlates.value = {};
        shipmentsLoaded.value = false;
        errors.value = [];
        filter.value = new ShipmentFilter();
    }

    return {
        shipments,
        locations,
        vehiclePlates,
        shipmentsLoaded,
        errors,
        filter,
        activeShipments,
        filteredShipments,
        countByStatus,
        fetchLocations,
        getLocationById,
        fetchShipments,
        fetchShipmentById,
        createShipment,
        startTransit,
        markAsDelivered,
        cancelShipment,
        applyIncidentDelay,
        touchShipment,
        fetchStatusChanges,
        setFilter,
        clearFilter,
        reset
    };
});

export default useShipmentsStore;
