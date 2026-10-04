import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {FleetApi} from "../infrastructure/fleet-api.js";
import {VehicleAssembler} from "../infrastructure/vehicle.assembler.js";
import {DriverAssembler} from "../infrastructure/driver.assembler.js";
import {VehicleStatus} from "../domain/model/vehicle-status.js";
import {DriverStatus} from "../domain/model/driver.entity.js";
import useIamStore from "../../iam/application/iam.store.js";

const fleetApi = new FleetApi();

/**
 * Result of a fleet use case.
 * @typedef {{ok: boolean, errorCode?: string}} FleetResult
 */

/**
 * Application service store for the Fleet & Resource Management bounded context.
 * Vehicles and drivers are always scoped to the signed-in dispatcher.
 *
 * @returns {Object} Store state and actions.
 */
const useFleetStore = defineStore('fleet', () => {
    const iamStore = useIamStore();

    /** @type {import('vue').Ref<import('../domain/model/vehicle.entity.js').Vehicle[]>} */
    const vehicles = ref([]);
    /** @type {import('vue').Ref<import('../domain/model/driver.entity.js').Driver[]>} */
    const drivers = ref([]);
    /** @type {import('vue').Ref<boolean>} */
    const vehiclesLoaded = ref(false);
    /** @type {import('vue').Ref<boolean>} */
    const driversLoaded = ref(false);
    /** @type {import('vue').Ref<Error[]>} */
    const errors = ref([]);

    /** @type {import('vue').ComputedRef<import('../domain/model/vehicle.entity.js').Vehicle[]>} */
    const availableVehicles = computed(() => vehicles.value.filter(vehicle => vehicle.isAvailable));
    /** @type {import('vue').ComputedRef<import('../domain/model/driver.entity.js').Driver[]>} */
    const availableDrivers = computed(() => drivers.value.filter(driver => driver.isAvailable));

    /**
     * Loads the vehicles of the signed-in dispatcher (TS09).
     * @returns {Promise<void>}
     */
    async function fetchVehicles() {
        try {
            const response = await fleetApi.getVehicles({dispatcherId: iamStore.currentUserId});
            vehicles.value = VehicleAssembler.toEntitiesFromResponse(response);
            vehiclesLoaded.value = true;
        } catch (error) {
            errors.value.push(error);
            vehiclesLoaded.value = true;
        }
    }

    /**
     * Loads every vehicle referenced by shipments (needed by buyers to read plates in their shipments).
     * @param {number[]} ids - Vehicle identifiers.
     * @returns {Promise<import('../domain/model/vehicle.entity.js').Vehicle[]>} Vehicles found.
     */
    async function fetchVehiclesByIds(ids) {
        const uniqueIds = [...new Set(ids.filter(id => id != null))];
        if (!uniqueIds.length) return [];
        try {
            const response = await fleetApi.getVehicles({id: uniqueIds});
            return VehicleAssembler.toEntitiesFromResponse(response);
        } catch (error) {
            errors.value.push(error);
            return [];
        }
    }

    /**
     * @param {number|string} id - Vehicle identifier.
     * @returns {import('../domain/model/vehicle.entity.js').Vehicle|undefined} Vehicle in state.
     */
    function getVehicleById(id) {
        return vehicles.value.find(vehicle => vehicle.id === Number(id));
    }

    /**
     * Registers a vehicle (US05). Rejects duplicated plates in the dispatcher scope and invalid data.
     * @param {import('../domain/model/vehicle.entity.js').Vehicle} vehicle - New vehicle.
     * @returns {Promise<FleetResult>} Result.
     */
    async function addVehicle(vehicle) {
        const [firstError] = vehicle.validate();
        if (firstError) return {ok: false, errorCode: firstError};
        try {
            const duplicated = await fleetApi.getVehicles({dispatcherId: iamStore.currentUserId, plate: vehicle.plate});
            if (VehicleAssembler.toEntitiesFromResponse(duplicated).length) return {ok: false, errorCode: 'plate-duplicated'};
            vehicle.dispatcherId = iamStore.currentUserId;
            vehicle.status = VehicleStatus.AVAILABLE;
            const response = await fleetApi.createVehicle(VehicleAssembler.toResourceFromEntity(vehicle));
            vehicles.value.push(VehicleAssembler.toEntityFromResource(response.data));
            return {ok: true};
        } catch (error) {
            errors.value.push(error);
            return {ok: false, errorCode: 'network'};
        }
    }

    /**
     * Updates a vehicle of the dispatcher scope (US06, TS19, TS25).
     * Status changes are only allowed between available and under maintenance without an active reservation,
     * and the capacity cannot change while a shipment holds the vehicle.
     * @param {import('../domain/model/vehicle.entity.js').Vehicle} vehicle - Vehicle with changes.
     * @returns {Promise<FleetResult>} Result.
     */
    async function updateVehicle(vehicle) {
        const [firstError] = vehicle.validate();
        if (firstError) return {ok: false, errorCode: firstError};
        try {
            const currentResponse = await fleetApi.getVehicleById(vehicle.id);
            const current = VehicleAssembler.toEntityFromResource(currentResponse.data);
            if (current.dispatcherId !== iamStore.currentUserId) return {ok: false, errorCode: 'not-found'};
            if (current.status !== vehicle.status && !current.canChangeStatusTo(vehicle.status)) {
                return {ok: false, errorCode: 'status-locked'};
            }
            if (current.isLockedByShipment && current.capacityTons !== vehicle.capacityTons) {
                return {ok: false, errorCode: 'capacity-locked'};
            }
            if (current.plate !== vehicle.plate) {
                const duplicated = await fleetApi.getVehicles({dispatcherId: iamStore.currentUserId, plate: vehicle.plate});
                if (VehicleAssembler.toEntitiesFromResponse(duplicated).length) return {ok: false, errorCode: 'plate-duplicated'};
            }
            const response = await fleetApi.patchVehicle(vehicle.id, VehicleAssembler.toResourceFromEntity(vehicle));
            const updated = VehicleAssembler.toEntityFromResource(response.data);
            const index = vehicles.value.findIndex(item => item.id === updated.id);
            if (index !== -1) vehicles.value[index] = updated;
            return {ok: true};
        } catch (error) {
            errors.value.push(error);
            return {ok: false, errorCode: 'network'};
        }
    }

    /**
     * Loads the drivers of the signed-in dispatcher (TS11).
     * @returns {Promise<void>}
     */
    async function fetchDrivers() {
        try {
            const response = await fleetApi.getDrivers({dispatcherId: iamStore.currentUserId});
            drivers.value = DriverAssembler.toEntitiesFromResponse(response);
            driversLoaded.value = true;
        } catch (error) {
            errors.value.push(error);
            driversLoaded.value = true;
        }
    }

    /**
     * Registers a driver (US07). Rejects duplicated DNI in the dispatcher scope.
     * @param {import('../domain/model/driver.entity.js').Driver} driver - New driver.
     * @returns {Promise<FleetResult>} Result.
     */
    async function addDriver(driver) {
        const [firstError] = driver.validate();
        if (firstError) return {ok: false, errorCode: firstError};
        try {
            const duplicated = await fleetApi.getDrivers({dispatcherId: iamStore.currentUserId, dni: driver.dni});
            if (DriverAssembler.toEntitiesFromResponse(duplicated).length) return {ok: false, errorCode: 'dni-duplicated'};
            driver.dispatcherId = iamStore.currentUserId;
            driver.status = DriverStatus.AVAILABLE;
            const response = await fleetApi.createDriver(DriverAssembler.toResourceFromEntity(driver));
            drivers.value.push(DriverAssembler.toEntityFromResource(response.data));
            return {ok: true};
        } catch (error) {
            errors.value.push(error);
            return {ok: false, errorCode: 'network'};
        }
    }

    /**
     * Fetches a driver by id (used by shipment details).
     * @param {number} id - Driver identifier.
     * @returns {Promise<?import('../domain/model/driver.entity.js').Driver>} Driver or null.
     */
    async function findDriverById(id) {
        try {
            const response = await fleetApi.getDriverById(id);
            return DriverAssembler.toEntityFromResource(response.data);
        } catch {
            return null;
        }
    }

    /**
     * Fetches a vehicle by id (used by shipment details).
     * @param {number} id - Vehicle identifier.
     * @returns {Promise<?import('../domain/model/vehicle.entity.js').Vehicle>} Vehicle or null.
     */
    async function findVehicleById(id) {
        try {
            const response = await fleetApi.getVehicleById(id);
            return VehicleAssembler.toEntityFromResource(response.data);
        } catch {
            return null;
        }
    }

    /**
     * Re-reads both resources to confirm they are still available right before a reservation (US08, US09).
     * @param {number} vehicleId - Vehicle identifier.
     * @param {number} driverId - Driver identifier.
     * @returns {Promise<FleetResult>} Result with resource-unavailable when one is taken.
     */
    async function checkAvailability(vehicleId, driverId) {
        const [vehicle, driver] = await Promise.all([findVehicleById(vehicleId), findDriverById(driverId)]);
        if (!vehicle || !vehicle.isAvailable) return {ok: false, errorCode: 'vehicle-unavailable'};
        if (!driver || !driver.isAvailable) return {ok: false, errorCode: 'driver-unavailable'};
        return {ok: true};
    }

    /**
     * Sets the operational status of the resources held by a shipment and refreshes local state.
     * @param {number} vehicleId - Vehicle identifier.
     * @param {string} vehicleStatus - New vehicle status.
     * @param {number} driverId - Driver identifier.
     * @param {string} driverStatus - New driver status.
     * @returns {Promise<void>}
     */
    async function setResourcesStatus(vehicleId, vehicleStatus, driverId, driverStatus) {
        const updatedAt = new Date().toISOString();
        const [vehicleResponse, driverResponse] = await Promise.all([
            fleetApi.patchVehicle(vehicleId, {status: vehicleStatus, updatedAt}),
            fleetApi.patchDriver(driverId, {status: driverStatus, updatedAt})
        ]);
        const vehicle = VehicleAssembler.toEntityFromResource(vehicleResponse.data);
        const driver = DriverAssembler.toEntityFromResource(driverResponse.data);
        const vehicleIndex = vehicles.value.findIndex(item => item.id === vehicle.id);
        if (vehicleIndex !== -1) vehicles.value[vehicleIndex] = vehicle;
        const driverIndex = drivers.value.findIndex(item => item.id === driver.id);
        if (driverIndex !== -1) drivers.value[driverIndex] = driver;
    }

    /** Reserves vehicle and driver for a planned shipment. */
    const reserveResources = (vehicleId, driverId) =>
        setResourcesStatus(vehicleId, VehicleStatus.RESERVED, driverId, DriverStatus.ASSIGNED);
    /** Marks resources as in route when the shipment starts. */
    const lockResourcesInRoute = (vehicleId, driverId) =>
        setResourcesStatus(vehicleId, VehicleStatus.IN_ROUTE, driverId, DriverStatus.ASSIGNED);
    /** Releases resources when the shipment is delivered or cancelled. */
    const releaseResources = (vehicleId, driverId) =>
        setResourcesStatus(vehicleId, VehicleStatus.AVAILABLE, driverId, DriverStatus.AVAILABLE);

    /** Clears the cached fleet (on sign-out). */
    function reset() {
        vehicles.value = [];
        drivers.value = [];
        vehiclesLoaded.value = false;
        driversLoaded.value = false;
        errors.value = [];
    }

    return {
        vehicles,
        drivers,
        vehiclesLoaded,
        driversLoaded,
        errors,
        availableVehicles,
        availableDrivers,
        fetchVehicles,
        fetchVehiclesByIds,
        getVehicleById,
        addVehicle,
        updateVehicle,
        fetchDrivers,
        addDriver,
        findDriverById,
        findVehicleById,
        checkAvailability,
        reserveResources,
        lockResourcesInRoute,
        releaseResources,
        reset
    };
});

export default useFleetStore;
