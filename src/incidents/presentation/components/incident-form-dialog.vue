<script setup>
import {computed, reactive, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import {useToast} from "primevue";
import useIncidentsStore from "../../application/incidents.store.js";
import {createIdempotencyKey, Incident, INCIDENT_TYPES} from "../../domain/model/incident.entity.js";
import {useErrorMessage} from "../../../shared/presentation/composables/use-error-message.js";

/**
 * Dialog to register a route incident and its estimated delay (US13).
 * One idempotency key is generated per dialog session, so a retry never duplicates the incident.
 */
const props = defineProps({
  shipment: {type: Object, required: true}
});
const visible = defineModel('visible', {type: Boolean, default: false});

const {t} = useI18n();
const toast = useToast();
const incidentsStore = useIncidentsStore();
const {errorMessage} = useErrorMessage();

const form = reactive({type: null, description: '', estimatedDelayMinutes: 0, occurredAt: new Date()});
const idempotencyKey = ref(createIdempotencyKey());
const submitted = ref(false);
const saving = ref(false);
const serverError = ref('');

const typeOptions = computed(() => INCIDENT_TYPES.map(value => ({value, label: t(`incidents.types.${value}`)})));
const draft = computed(() => new Incident({
  ...form,
  estimatedDelayMinutes: form.estimatedDelayMinutes ?? -1,
  occurredAt: form.occurredAt ? new Date(form.occurredAt).toISOString() : null,
  idempotencyKey: idempotencyKey.value
}));
const fieldErrors = computed(() => submitted.value ? draft.value.validate() : []);
/**
 * @param {string} code - Validation code.
 * @returns {boolean} True when present.
 */
const hasError = (code) => fieldErrors.value.includes(code);

watch(visible, (open) => {
  if (!open) return;
  Object.assign(form, {type: null, description: '', estimatedDelayMinutes: 0, occurredAt: new Date()});
  idempotencyKey.value = createIdempotencyKey();
  submitted.value = false;
  serverError.value = '';
});

/** Registers the incident; the ETA is recalculated once and the participants are notified. */
async function saveIncident() {
  submitted.value = true;
  serverError.value = '';
  if (fieldErrors.value.length) return;
  saving.value = true;
  const result = await incidentsStore.registerIncident(props.shipment, draft.value);
  saving.value = false;
  if (!result.ok) {
    serverError.value = errorMessage(result.errorCode);
    return;
  }
  toast.add({
    severity: result.duplicated ? 'info' : 'success',
    summary: result.duplicated ? t('incidents.duplicated') : t('incidents.registered'),
    detail: t('incidents.eta-updated'),
    life: 5000
  });
  visible.value = false;
}
</script>

<template>
  <pv-dialog v-model:visible="visible" :header="t('incidents.register')" :style="{width: '36rem'}"
             :breakpoints="{'640px': '95vw'}" modal>
    <form id="incident-form" novalidate @submit.prevent="saveIncident">
      <p class="agf-small agf-muted mt-0">{{ t('incidents.register-hint', {code: shipment.code}) }}</p>
      <pv-message v-if="serverError" class="mb-3" role="alert" severity="error">{{ serverError }}</pv-message>
      <div class="agf-field">
        <label id="incidentType-label" for="incidentType">{{ t('incidents.type') }}</label>
        <pv-select v-model="form.type" :invalid="hasError('type-required')" :options="typeOptions" fluid input-id="incidentType" aria-labelledby="incidentType-label"
                   option-label="label" option-value="value" :placeholder="t('common.select')"/>
        <small v-if="hasError('type-required')" class="agf-error-text">{{ t('validation.required') }}</small>
      </div>
      <div class="agf-field">
        <label for="description">{{ t('incidents.description') }}</label>
        <pv-textarea id="description" v-model="form.description" :invalid="hasError('description-required')" auto-resize fluid
                     maxlength="280" rows="3"/>
        <small v-if="hasError('description-required')" class="agf-error-text">{{ t('validation.required') }}</small>
      </div>
      <div class="agf-form-grid">
        <div class="agf-field">
          <label for="delay">{{ t('incidents.estimated-delay') }}</label>
          <pv-input-number v-model="form.estimatedDelayMinutes" :invalid="hasError('delay-non-negative')" :max="4320" :min="0"
                           fluid input-id="delay" :suffix="` ${t('common.minutes')}`"/>
          <small :class="hasError('delay-non-negative') ? 'agf-error-text' : 'agf-caption'">{{ t('validation.delay') }}</small>
        </div>
        <div class="agf-field">
          <label for="occurredAt">{{ t('incidents.occurred-at') }}</label>
          <pv-date-picker v-model="form.occurredAt" :invalid="hasError('occurred-at-required') || hasError('occurred-at-future')"
                          :max-date="new Date()" fluid hour-format="24" input-id="occurredAt" show-icon show-time/>
          <small v-if="hasError('occurred-at-future')" class="agf-error-text">{{ t('validation.not-future') }}</small>
        </div>
      </div>
    </form>
    <template #footer>
      <pv-button :label="t('common.cancel')" outlined severity="secondary" @click="visible = false"/>
      <pv-button :label="t('incidents.register')" :loading="saving" form="incident-form" icon="pi pi-exclamation-triangle"
                 severity="warn" type="submit"/>
    </template>
  </pv-dialog>
</template>
