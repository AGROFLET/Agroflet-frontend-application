<script setup>
import {computed, reactive, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import {useToast} from "primevue";
import useTrackingStore from "../../application/tracking.store.js";
import {POSITION_SOURCES, ReportedPosition} from "../../domain/model/reported-position.entity.js";
import {useErrorMessage} from "../../../shared/presentation/composables/use-error-message.js";

/**
 * Dialog to register a position received from the driver or another source (US32).
 * The office location of the user is never used as the truck position.
 */
const props = defineProps({
  shipment: {type: Object, required: true}
});
const visible = defineModel('visible', {type: Boolean, default: false});

const {t} = useI18n();
const toast = useToast();
const trackingStore = useTrackingStore();
const {errorMessage} = useErrorMessage();

const form = reactive({latitude: null, longitude: null, reportedAt: new Date(), source: null, note: ''});
const submitted = ref(false);
const saving = ref(false);
const serverError = ref('');

const sourceOptions = computed(() => POSITION_SOURCES.map(value => ({value, label: t(`tracking.sources.${value}`)})));
const draft = computed(() => new ReportedPosition({
  ...form,
  reportedAt: form.reportedAt ? new Date(form.reportedAt).toISOString() : null
}));
const fieldErrors = computed(() => submitted.value ? draft.value.validate() : []);
/**
 * @param {string} code - Validation code.
 * @returns {boolean} True when present.
 */
const hasError = (code) => fieldErrors.value.includes(code);

watch(visible, (open) => {
  if (!open) return;
  Object.assign(form, {latitude: null, longitude: null, reportedAt: new Date(), source: null, note: ''});
  submitted.value = false;
  serverError.value = '';
});

/** Registers the position and closes the dialog. */
async function savePosition() {
  submitted.value = true;
  serverError.value = '';
  if (fieldErrors.value.length) return;
  saving.value = true;
  const result = await trackingStore.registerPosition(props.shipment, draft.value);
  saving.value = false;
  if (!result.ok) {
    serverError.value = errorMessage(result.errorCode);
    return;
  }
  toast.add({severity: 'success', summary: t('tracking.position-registered'), detail: props.shipment.code, life: 4000});
  visible.value = false;
}
</script>

<template>
  <pv-dialog v-model:visible="visible" :header="t('tracking.register-position')" :style="{width: '36rem'}"
             :breakpoints="{'640px': '95vw'}" modal>
    <form id="position-form" novalidate @submit.prevent="savePosition">
      <p class="agf-small agf-muted mt-0">{{ t('tracking.register-hint') }}</p>
      <pv-message v-if="serverError" class="mb-3" role="alert" severity="error">{{ serverError }}</pv-message>
      <div class="agf-form-grid">
        <div class="agf-field">
          <label for="latitude">{{ t('tracking.latitude') }}</label>
          <pv-input-number v-model="form.latitude" :invalid="hasError('latitude-range')" :max-fraction-digits="6" :min-fraction-digits="0"
                           fluid input-id="latitude" mode="decimal" placeholder="-11.9370" :use-grouping="false"/>
          <small :class="hasError('latitude-range') ? 'agf-error-text' : 'agf-caption'">{{ t('validation.latitude') }}</small>
        </div>
        <div class="agf-field">
          <label for="longitude">{{ t('tracking.longitude') }}</label>
          <pv-input-number v-model="form.longitude" :invalid="hasError('longitude-range')" :max-fraction-digits="6" :min-fraction-digits="0"
                           fluid input-id="longitude" mode="decimal" placeholder="-76.6970" :use-grouping="false"/>
          <small :class="hasError('longitude-range') ? 'agf-error-text' : 'agf-caption'">{{ t('validation.longitude') }}</small>
        </div>
        <div class="agf-field">
          <label for="reportedAt">{{ t('tracking.reported-at') }}</label>
          <pv-date-picker v-model="form.reportedAt" :invalid="hasError('reported-at-required') || hasError('reported-at-future')"
                          :max-date="new Date()" fluid hour-format="24" input-id="reportedAt" show-icon show-time/>
          <small v-if="hasError('reported-at-future')" class="agf-error-text">{{ t('validation.not-future') }}</small>
        </div>
        <div class="agf-field">
          <label id="source-label" for="source">{{ t('tracking.source') }}</label>
          <pv-select v-model="form.source" :invalid="hasError('source-required')" :options="sourceOptions" fluid input-id="source" aria-labelledby="source-label"
                     option-label="label" option-value="value" :placeholder="t('common.select')"/>
          <small v-if="hasError('source-required')" class="agf-error-text">{{ t('validation.source') }}</small>
        </div>
        <div class="agf-field agf-span-2">
          <label for="note">{{ t('tracking.reference') }} <span class="agf-caption">({{ t('common.optional') }})</span></label>
          <pv-input-text id="note" v-model="form.note" fluid maxlength="80" :placeholder="t('tracking.reference-placeholder')"/>
        </div>
      </div>
    </form>
    <template #footer>
      <pv-button :label="t('common.cancel')" outlined severity="secondary" @click="visible = false"/>
      <pv-button :label="t('tracking.register-position')" :loading="saving" form="position-form" icon="pi pi-map-marker" type="submit"/>
    </template>
  </pv-dialog>
</template>
