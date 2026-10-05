<script setup>
import {computed, onMounted, reactive, ref} from "vue";
import {useI18n} from "vue-i18n";
import {useRouter} from "vue-router";
import {useToast} from "primevue";
import useIamStore from "../../../iam/application/iam.store.js";
import useFleetStore from "../../../fleet/application/fleet.store.js";
import useShipmentsStore from "../../application/shipments.store.js";
import {Shipment} from "../../domain/model/shipment.entity.js";
import {CARGO_TYPES} from "../../domain/model/shipment-status.js";
import PageHeader from "../../../shared/presentation/components/page-header.vue";
import ResourceStatusTag from "../../../fleet/presentation/components/resource-status-tag.vue";
import {useErrorMessage} from "../../../shared/presentation/composables/use-error-message.js";
import {useFormatters} from "../../../shared/presentation/composables/use-formatters.js";

const {t} = useI18n();
const router = useRouter();
const toast = useToast();
const iamStore = useIamStore();
const fleetStore = useFleetStore();
const shipmentsStore = useShipmentsStore();
const {errorMessage} = useErrorMessage();
const {formatDateTime, formatTons} = useFormatters();

/**
 * @param {number} hours - Hours from now.
 * @returns {Date} Rounded date.
 */
function hoursFromNow(hours) {
  const date = new Date(Date.now() + hours * 3600000);
  date.setMinutes(0, 0, 0);
  return date;
}

const form = reactive({
  cargoType: 'potato',
  cargoDescription: '',
  weightTons: null,
  originId: null,
  destinationId: null,
  buyerId: null,
  vehicleId: null,
  driverId: null,
  plannedDepartureAt: hoursFromNow(12),
  estimatedArrivalAt: hoursFromNow(20)
});
const submitted = ref(false);
const saving = ref(false);
const serverError = ref('');

const cargoOptions = computed(() => CARGO_TYPES.map(value => ({value, label: t(`shipments.cargo-types.${value}`)})));
const originOptions = computed(() => shipmentsStore.locations.filter(location => location.kind === 'origin'));
const destinationOptions = computed(() => shipmentsStore.locations.filter(location => location.kind === 'destination'));
const buyerOptions = computed(() => iamStore.buyers.map(buyer => ({
  value: buyer.id,
  label: buyer.companyName ? `${buyer.fullName} · ${buyer.companyName}` : buyer.fullName
})));
/** Every resource is listed; unavailable ones are disabled and show their status (US08, scenario 2). */
const vehicleOptions = computed(() => [...fleetStore.vehicles].sort((a, b) => Number(b.isAvailable) - Number(a.isAvailable)));
const driverOptions = computed(() => [...fleetStore.drivers].sort((a, b) => Number(b.isAvailable) - Number(a.isAvailable)));
const selectedVehicle = computed(() => fleetStore.getVehicleById(form.vehicleId));
const selectedDriver = computed(() => fleetStore.drivers.find(driver => driver.id === form.driverId));

const draft = computed(() => new Shipment({
  ...form,
  weightTons: form.weightTons ?? 0,
  plannedDepartureAt: form.plannedDepartureAt ? new Date(form.plannedDepartureAt).toISOString() : null,
  estimatedArrivalAt: form.estimatedArrivalAt ? new Date(form.estimatedArrivalAt).toISOString() : null
}));
const fieldErrors = computed(() => submitted.value ? draft.value.validateForCreation(selectedVehicle.value) : []);
/**
 * @param {...string} codes - Validation codes.
 * @returns {boolean} True when one of them is present.
 */
const hasError = (...codes) => codes.some(code => fieldErrors.value.includes(code));

onMounted(async () => {
  await Promise.all([shipmentsStore.fetchLocations(), iamStore.fetchBuyers(), fleetStore.fetchVehicles(), fleetStore.fetchDrivers()]);
});

/**
 * Confirms the operation: it is created as planned and both resources are reserved in the same use case (US09).
 */
async function confirmShipment() {
  submitted.value = true;
  serverError.value = '';
  if (fieldErrors.value.length) return;
  saving.value = true;
  const result = await shipmentsStore.createShipment(draft.value);
  saving.value = false;
  if (!result.ok) {
    serverError.value = errorMessage(result.errorCode);
    if (['vehicle-unavailable', 'driver-unavailable'].includes(result.errorCode)) {
      await Promise.all([fleetStore.fetchVehicles(), fleetStore.fetchDrivers()]);
    }
    return;
  }
  toast.add({severity: 'success', summary: t('shipments.form.created', {code: result.shipment.code}), detail: t('shipments.form.created-detail'), life: 6000});
  await router.push({name: 'shipment-detail', params: {id: result.shipment.id}});
}
</script>

<template>
  <section>
    <page-header :description="t('shipments.form.description')" :eyebrow="t('shipments.eyebrow')" :title="t('shipments.form.title')"/>
    <pv-message v-if="serverError" class="mb-3" icon="pi pi-exclamation-triangle" role="alert" severity="error">{{ serverError }}</pv-message>
    <form class="grid" novalidate @submit.prevent="confirmShipment">
      <div class="col-12 lg:col-8 flex flex-column gap-4">
        <fieldset class="agf-card">
          <legend class="form-legend">1. {{ t('shipments.form.cargo-section') }}</legend>
          <div class="agf-form-grid">
            <div class="agf-field">
              <label id="cargoType-label" for="cargoType">{{ t('shipments.fields.cargo-type') }}</label>
              <pv-select v-model="form.cargoType" :options="cargoOptions" fluid input-id="cargoType" aria-labelledby="cargoType-label" option-label="label" option-value="value"/>
            </div>
            <div class="agf-field">
              <label for="weight">{{ t('shipments.fields.weight') }}</label>
              <pv-input-number v-model="form.weightTons" :invalid="hasError('weight-positive', 'weight-exceeds-capacity')"
                               :max-fraction-digits="2" :min="0" fluid input-id="weight" suffix=" t"/>
              <small v-if="hasError('weight-positive')" class="agf-error-text">{{ t('errors.weight-positive') }}</small>
              <small v-else-if="hasError('weight-exceeds-capacity')" class="agf-error-text">{{ t('errors.weight-exceeds-capacity') }}</small>
            </div>
            <div class="agf-field agf-span-2">
              <label for="cargoDescription">{{ t('shipments.fields.cargo-description') }} <span class="agf-caption">({{ t('common.optional') }})</span></label>
              <pv-input-text id="cargoDescription" v-model="form.cargoDescription" fluid maxlength="120"
                             :placeholder="t('shipments.form.cargo-placeholder')"/>
            </div>
          </div>
        </fieldset>

        <fieldset class="agf-card">
          <legend class="form-legend">2. {{ t('shipments.form.route-section') }}</legend>
          <div class="agf-form-grid">
            <div class="agf-field">
              <label id="origin-label" for="origin">{{ t('shipments.fields.origin') }}</label>
              <pv-select v-model="form.originId" :invalid="hasError('origin-required', 'same-origin-destination')" :options="originOptions"
                         filter fluid input-id="origin" aria-labelledby="origin-label" option-label="label" option-value="id" :placeholder="t('common.select')"/>
              <small v-if="hasError('origin-required')" class="agf-error-text">{{ t('validation.required') }}</small>
            </div>
            <div class="agf-field">
              <label id="destination-label" for="destination">{{ t('shipments.fields.destination') }}</label>
              <pv-select v-model="form.destinationId" :invalid="hasError('destination-required', 'same-origin-destination')"
                         :options="destinationOptions" filter fluid input-id="destination" aria-labelledby="destination-label" option-label="label" option-value="id"
                         :placeholder="t('common.select')"/>
              <small v-if="hasError('destination-required')" class="agf-error-text">{{ t('validation.required') }}</small>
            </div>
            <div class="agf-field">
              <label for="plannedDeparture">{{ t('shipments.fields.planned-departure') }}</label>
              <pv-date-picker v-model="form.plannedDepartureAt" :invalid="hasError('departure-required')" fluid hour-format="24"
                              input-id="plannedDeparture" show-icon show-time/>
            </div>
            <div class="agf-field">
              <label for="estimatedArrival">{{ t('shipments.fields.eta') }}</label>
              <pv-date-picker v-model="form.estimatedArrivalAt" :invalid="hasError('arrival-required', 'arrival-before-departure')"
                              fluid hour-format="24" input-id="estimatedArrival" show-icon show-time/>
              <small v-if="hasError('arrival-before-departure')" class="agf-error-text">{{ t('errors.arrival-before-departure') }}</small>
            </div>
            <div class="agf-field agf-span-2">
              <label id="buyer-label" for="buyer">{{ t('shipments.fields.buyer') }}</label>
              <pv-select v-model="form.buyerId" :invalid="hasError('buyer-required')" :options="buyerOptions" filter fluid input-id="buyer" aria-labelledby="buyer-label"
                         option-label="label" option-value="value" :placeholder="t('common.select')"/>
              <small v-if="hasError('buyer-required')" class="agf-error-text">{{ t('validation.required') }}</small>
            </div>
          </div>
          <small v-if="hasError('same-origin-destination')" class="agf-error-text">{{ t('errors.same-origin-destination') }}</small>
        </fieldset>

        <fieldset class="agf-card">
          <legend class="form-legend">3. {{ t('shipments.form.resources-section') }}</legend>
          <p class="agf-small agf-muted mt-0">{{ t('shipments.form.resources-hint') }}</p>
          <div class="agf-form-grid">
            <div class="agf-field">
              <label id="vehicle-label" for="vehicle">{{ t('shipments.fields.vehicle') }}</label>
              <pv-select v-model="form.vehicleId" :invalid="hasError('vehicle-required')" :option-disabled="vehicle => !vehicle.isAvailable"
                         :options="vehicleOptions" fluid input-id="vehicle" aria-labelledby="vehicle-label" option-label="label" option-value="id" :placeholder="t('common.select')">
                <template #option="{option}">
                  <div class="flex align-items-center justify-content-between gap-2 w-full">
                    <span>{{ option.label }}</span>
                    <resource-status-tag :status="option.status"/>
                  </div>
                </template>
              </pv-select>
              <small v-if="hasError('vehicle-required')" class="agf-error-text">{{ t('validation.required') }}</small>
              <router-link v-if="fleetStore.vehiclesLoaded && !fleetStore.availableVehicles.length" class="agf-small" to="/fleet/vehicles/new">
                {{ t('shipments.form.no-vehicles') }}
              </router-link>
            </div>
            <div class="agf-field">
              <label id="driver-label" for="driver">{{ t('shipments.fields.driver') }}</label>
              <pv-select v-model="form.driverId" :invalid="hasError('driver-required')" :option-disabled="driver => !driver.isAvailable"
                         :options="driverOptions" fluid input-id="driver" aria-labelledby="driver-label" option-label="label" option-value="id" :placeholder="t('common.select')">
                <template #option="{option}">
                  <div class="flex align-items-center justify-content-between gap-2 w-full">
                    <span>{{ option.label }}</span>
                    <resource-status-tag :status="option.status"/>
                  </div>
                </template>
              </pv-select>
              <small v-if="hasError('driver-required')" class="agf-error-text">{{ t('validation.required') }}</small>
              <router-link v-if="fleetStore.driversLoaded && !fleetStore.availableDrivers.length" class="agf-small" to="/fleet/drivers/new">
                {{ t('shipments.form.no-drivers') }}
              </router-link>
            </div>
          </div>
        </fieldset>
      </div>

      <div class="col-12 lg:col-4">
        <aside :aria-label="t('shipments.form.review')" class="agf-card review">
          <h2 class="mb-3">{{ t('shipments.form.review') }}</h2>
          <dl class="review__list">
            <dt>{{ t('shipments.fields.cargo') }}</dt>
            <dd>{{ t(`shipments.cargo-types.${form.cargoType}`) }} · {{ formatTons(form.weightTons || 0) }}</dd>
            <dt>{{ t('shipments.fields.route') }}</dt>
            <dd>{{ shipmentsStore.getLocationById(form.originId)?.city || '—' }} → {{ shipmentsStore.getLocationById(form.destinationId)?.city || '—' }}</dd>
            <dt>{{ t('shipments.fields.planned-departure') }}</dt>
            <dd>{{ formatDateTime(draft.plannedDepartureAt) }}</dd>
            <dt>{{ t('shipments.fields.eta') }}</dt>
            <dd>{{ formatDateTime(draft.estimatedArrivalAt) }}</dd>
            <dt>{{ t('shipments.fields.vehicle') }}</dt>
            <dd>{{ selectedVehicle ? `${selectedVehicle.plate} · ${t('fleet.fields.capacity')} ${formatTons(selectedVehicle.capacityTons)}` : '—' }}</dd>
            <dt>{{ t('shipments.fields.driver') }}</dt>
            <dd>{{ selectedDriver?.fullName || '—' }}</dd>
          </dl>
          <pv-message class="mb-3" icon="pi pi-info-circle" severity="secondary" size="small">{{ t('shipments.form.reservation-note') }}</pv-message>
          <div class="flex flex-column gap-2">
            <pv-button :label="t('shipments.form.confirm')" :loading="saving" icon="pi pi-check" type="submit"/>
            <pv-button :label="t('common.cancel')" as="router-link" outlined severity="secondary" to="/dashboard"/>
          </div>
        </aside>
      </div>
    </form>
  </section>
</template>

<style scoped>
fieldset.agf-card {
  margin: 0;
}

.form-legend {
  padding: 0 var(--agf-space-2);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--agf-navy);
}

.review {
  position: sticky;
  top: calc(var(--agf-header-height) + var(--agf-space-4));
}

.review__list {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--agf-space-2) var(--agf-space-3);
  margin: 0 0 var(--agf-space-4);
  font-size: 0.875rem;
}

.review__list dt {
  color: var(--agf-text-muted);
}

.review__list dd {
  margin: 0;
  font-weight: 500;
  text-align: right;
}

.agf-error-text {
  color: var(--agf-error);
  font-size: 0.75rem;
}
</style>
