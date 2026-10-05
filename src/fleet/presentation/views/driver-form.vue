<script setup>
import {computed, reactive, ref} from "vue";
import {useI18n} from "vue-i18n";
import {useRouter} from "vue-router";
import {useToast} from "primevue";
import useFleetStore from "../../application/fleet.store.js";
import {Driver, LICENSE_CATEGORIES} from "../../domain/model/driver.entity.js";
import PageHeader from "../../../shared/presentation/components/page-header.vue";
import {useErrorMessage} from "../../../shared/presentation/composables/use-error-message.js";

const {t} = useI18n();
const router = useRouter();
const toast = useToast();
const fleetStore = useFleetStore();
const {errorMessage} = useErrorMessage();

const form = reactive({firstName: '', lastName: '', dni: '', licenseNumber: '', licenseCategory: 'A-IIIb', phone: ''});
const submitted = ref(false);
const saving = ref(false);
const serverError = ref('');

const draft = computed(() => new Driver({...form}));
const fieldErrors = computed(() => submitted.value ? draft.value.validate() : []);
/**
 * @param {string} code - Validation code.
 * @returns {boolean} True when the code is among the current errors.
 */
const hasError = (code) => fieldErrors.value.includes(code);

/**
 * Registers the driver (US07); a duplicated DNI in the dispatcher scope is rejected.
 */
async function saveDriver() {
  submitted.value = true;
  serverError.value = '';
  if (fieldErrors.value.length) return;
  saving.value = true;
  const result = await fleetStore.addDriver(draft.value);
  saving.value = false;
  if (!result.ok) {
    serverError.value = errorMessage(result.errorCode);
    return;
  }
  toast.add({severity: 'success', summary: t('fleet.drivers.registered'), detail: draft.value.fullName, life: 4000});
  await router.push({name: 'fleet-drivers'});
}
</script>

<template>
  <section class="form-page">
    <page-header :description="t('fleet.drivers.form-description')" :eyebrow="t('fleet.eyebrow')" :title="t('fleet.drivers.new-title')"/>
    <form class="agf-card" novalidate @submit.prevent="saveDriver">
      <pv-message v-if="serverError" class="mb-3" icon="pi pi-exclamation-triangle" role="alert" severity="error">{{ serverError }}</pv-message>
      <div class="agf-form-grid">
        <div class="agf-field">
          <label for="firstName">{{ t('iam.fields.first-name') }}</label>
          <pv-input-text id="firstName" v-model="form.firstName" fluid :invalid="hasError('first-name-required')"/>
          <small v-if="hasError('first-name-required')" class="agf-error-text">{{ t('validation.required') }}</small>
        </div>
        <div class="agf-field">
          <label for="lastName">{{ t('iam.fields.last-name') }}</label>
          <pv-input-text id="lastName" v-model="form.lastName" fluid :invalid="hasError('last-name-required')"/>
          <small v-if="hasError('last-name-required')" class="agf-error-text">{{ t('validation.required') }}</small>
        </div>
        <div class="agf-field">
          <label for="dni">{{ t('fleet.fields.dni') }}</label>
          <pv-input-text id="dni" v-model="form.dni" fluid inputmode="numeric" :invalid="hasError('dni-format')" maxlength="8"/>
          <small :class="hasError('dni-format') ? 'agf-error-text' : 'agf-caption'">{{ t('validation.dni') }}</small>
        </div>
        <div class="agf-field">
          <label for="phone">{{ t('iam.fields.phone') }}</label>
          <pv-input-text id="phone" v-model="form.phone" fluid inputmode="numeric" :invalid="hasError('phone-format')" maxlength="9"/>
          <small :class="hasError('phone-format') ? 'agf-error-text' : 'agf-caption'">{{ t('validation.phone') }}</small>
        </div>
        <div class="agf-field">
          <label for="licenseNumber">{{ t('fleet.fields.license-number') }}</label>
          <pv-input-text id="licenseNumber" v-model="form.licenseNumber" fluid :invalid="hasError('license-format')" maxlength="9" placeholder="Q12345678"/>
          <small :class="hasError('license-format') ? 'agf-error-text' : 'agf-caption'">{{ t('validation.license') }}</small>
        </div>
        <div class="agf-field">
          <label id="licenseCategory-label" for="licenseCategory">{{ t('fleet.fields.license-category') }}</label>
          <pv-select v-model="form.licenseCategory" input-id="licenseCategory" aria-labelledby="licenseCategory-label" :options="LICENSE_CATEGORIES" fluid/>
        </div>
      </div>
      <div class="agf-actions">
        <pv-button :label="t('common.save')" :loading="saving" icon="pi pi-save" type="submit"/>
        <pv-button :label="t('common.cancel')" as="router-link" outlined severity="secondary" to="/fleet/drivers"/>
      </div>
    </form>
  </section>
</template>

<style scoped>
.form-page {
  max-width: 820px;
}
</style>
