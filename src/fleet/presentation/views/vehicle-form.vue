<script setup>
import {computed, onMounted, reactive, ref} from "vue";
import {useI18n} from "vue-i18n";
import {useRoute, useRouter} from "vue-router";
import {useToast} from "primevue";
import useFleetStore from "../../application/fleet.store.js";
import {Vehicle} from "../../domain/model/vehicle.entity.js";
import {MANAGEABLE_VEHICLE_STATUSES, VEHICLE_BODY_TYPES, VehicleStatus} from "../../domain/model/vehicle-status.js";
import PageHeader from "../../../shared/presentation/components/page-header.vue";
import ResourceStatusTag from "../components/resource-status-tag.vue";
import {useErrorMessage} from "../../../shared/presentation/composables/use-error-message.js";

const {t} = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const fleetStore = useFleetStore();
const {errorMessage} = useErrorMessage();

const isEdit = computed(() => !!route.params.id);
const original = ref(null);
const form = reactive({plate: '', brand: '', model: '', year: new Date().getFullYear(), capacityTons: null,
  bodyType: 'refrigerated_van', status: VehicleStatus.AVAILABLE});
const submitted = ref(false);
const saving = ref(false);
const serverError = ref('');

const bodyTypeOptions = computed(() => VEHICLE_BODY_TYPES.map(value => ({value, label: t(`fleet.body-types.${value}`)})));
const statusOptions = computed(() => MANAGEABLE_VEHICLE_STATUSES.map(value => ({value, label: t(`fleet.status.${value}`)})));
const isLocked = computed(() => !!original.value?.isLockedByShipment);

const draft = computed(() => new Vehicle({...form, id: original.value?.id ?? null, dispatcherId: original.value?.dispatcherId ?? null}));
const fieldErrors = computed(() => submitted.value ? draft.value.validate() : []);
/**
 * @param {string} code - Validation code.
 * @returns {boolean} True when the code is among the current errors.
 */
const hasError = (code) => fieldErrors.value.includes(code);

onMounted(async () => {
  if (!isEdit.value) return;
  if (!fleetStore.vehiclesLoaded) await fleetStore.fetchVehicles();
  const vehicle = fleetStore.getVehicleById(route.params.id);
  if (!vehicle) {
    toast.add({severity: 'warn', summary: t('errors.not-found'), life: 4000});
    await router.push({name: 'fleet-vehicles'});
    return;
  }
  original.value = vehicle;
  Object.assign(form, {plate: vehicle.plate, brand: vehicle.brand, model: vehicle.model, year: vehicle.year,
    capacityTons: vehicle.capacityTons, bodyType: vehicle.bodyType, status: vehicle.status});
});

/**
 * Registers (US05) or updates (US06) the vehicle and goes back to the list.
 */
async function saveVehicle() {
  submitted.value = true;
  serverError.value = '';
  if (fieldErrors.value.length) return;
  saving.value = true;
  const result = isEdit.value ? await fleetStore.updateVehicle(draft.value) : await fleetStore.addVehicle(draft.value);
  saving.value = false;
  if (!result.ok) {
    serverError.value = errorMessage(result.errorCode);
    return;
  }
  toast.add({severity: 'success', summary: isEdit.value ? t('fleet.vehicles.updated') : t('fleet.vehicles.registered'),
    detail: draft.value.plate, life: 4000});
  await router.push({name: 'fleet-vehicles'});
}
</script>

<template>
  <section class="form-page">
    <page-header :eyebrow="t('fleet.eyebrow')" :title="isEdit ? t('fleet.vehicles.edit-title', {plate: form.plate}) : t('fleet.vehicles.new-title')"
                 :description="t('fleet.vehicles.form-description')"/>
    <form class="agf-card" novalidate @submit.prevent="saveVehicle">
      <pv-message v-if="serverError" class="mb-3" icon="pi pi-exclamation-triangle" role="alert" severity="error">{{ serverError }}</pv-message>
      <pv-message v-if="isLocked" class="mb-3" icon="pi pi-lock" severity="warn">{{ t('fleet.vehicles.locked-notice') }}</pv-message>
      <div class="agf-form-grid">
        <div class="agf-field">
          <label for="plate">{{ t('fleet.fields.plate') }}</label>
          <pv-input-text id="plate" v-model="form.plate" fluid :invalid="hasError('plate-format')" maxlength="7" placeholder="ABC-123"
                         @update:model-value="value => form.plate = (value || '').toUpperCase()"/>
          <small :class="hasError('plate-format') ? 'agf-error-text' : 'agf-caption'">{{ t('validation.plate') }}</small>
        </div>
        <div class="agf-field">
          <label id="bodyType-label" for="bodyType">{{ t('fleet.fields.body-type') }}</label>
          <pv-select v-model="form.bodyType" input-id="bodyType" aria-labelledby="bodyType-label" :options="bodyTypeOptions" fluid option-label="label" option-value="value"/>
        </div>
        <div class="agf-field">
          <label for="brand">{{ t('fleet.fields.brand') }}</label>
          <pv-input-text id="brand" v-model="form.brand" fluid :invalid="hasError('brand-required')"/>
          <small v-if="hasError('brand-required')" class="agf-error-text">{{ t('validation.required') }}</small>
        </div>
        <div class="agf-field">
          <label for="model">{{ t('fleet.fields.model') }}</label>
          <pv-input-text id="model" v-model="form.model" fluid :invalid="hasError('model-required')"/>
          <small v-if="hasError('model-required')" class="agf-error-text">{{ t('validation.required') }}</small>
        </div>
        <div class="agf-field">
          <label for="year">{{ t('fleet.fields.year') }}</label>
          <pv-input-number v-model="form.year" :invalid="hasError('year-range')" :use-grouping="false" fluid input-id="year"/>
          <small v-if="hasError('year-range')" class="agf-error-text">{{ t('validation.year') }}</small>
        </div>
        <div class="agf-field">
          <label for="capacity">{{ t('fleet.fields.capacity-tons') }}</label>
          <pv-input-number v-model="form.capacityTons" :disabled="isLocked" :invalid="hasError('capacity-positive')"
                           :max-fraction-digits="2" :min="0" fluid input-id="capacity" suffix=" t"/>
          <small v-if="hasError('capacity-positive')" class="agf-error-text">{{ t('validation.capacity') }}</small>
        </div>
        <div v-if="isEdit" class="agf-field agf-span-2">
          <label id="status-label" for="status">{{ t('fleet.fields.status') }}</label>
          <div v-if="isLocked" class="flex align-items-center gap-2">
            <resource-status-tag :status="form.status"/>
            <span class="agf-caption">{{ t('fleet.vehicles.status-managed') }}</span>
          </div>
          <pv-select v-else v-model="form.status" input-id="status" aria-labelledby="status-label" :options="statusOptions" fluid option-label="label" option-value="value"/>
        </div>
      </div>
      <div class="agf-actions">
        <pv-button :label="t('common.save')" :loading="saving" icon="pi pi-save" type="submit"/>
        <pv-button :label="t('common.cancel')" as="router-link" outlined severity="secondary" to="/fleet/vehicles"/>
      </div>
    </form>
  </section>
</template>

<style scoped>
.form-page {
  max-width: 820px;
}
</style>
