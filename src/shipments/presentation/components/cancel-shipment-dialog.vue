<script setup>
import {ref, watch} from "vue";
import {useI18n} from "vue-i18n";

/**
 * Dialog that asks for the mandatory cancellation reason (US12, scenario 2).
 */
defineProps({
  shipment: {type: Object, required: true},
  loading: {type: Boolean, default: false}
});
const visible = defineModel('visible', {type: Boolean, default: false});
const emit = defineEmits(['confirm']);

const {t} = useI18n();
const reason = ref('');
const submitted = ref(false);

watch(visible, (open) => {
  if (open) {
    reason.value = '';
    submitted.value = false;
  }
});

/** Emits the reason when it is not empty. */
function confirmCancellation() {
  submitted.value = true;
  if (!reason.value.trim()) return;
  emit('confirm', reason.value.trim());
}
</script>

<template>
  <pv-dialog v-model:visible="visible" :header="t('shipments.cancel.title', {code: shipment.code})" :style="{width: '32rem'}"
             :breakpoints="{'640px': '95vw'}" modal>
    <pv-message class="mb-3" icon="pi pi-exclamation-triangle" severity="warn">{{ t('shipments.cancel.warning') }}</pv-message>
    <div class="agf-field">
      <label for="cancelReason">{{ t('shipments.cancel.reason') }}</label>
      <pv-textarea id="cancelReason" v-model="reason" :invalid="submitted && !reason.trim()" auto-resize fluid maxlength="280" rows="3"/>
      <small v-if="submitted && !reason.trim()" class="agf-error-text">{{ t('validation.reason') }}</small>
    </div>
    <template #footer>
      <pv-button :label="t('common.back')" outlined severity="secondary" @click="visible = false"/>
      <pv-button :label="t('shipments.actions.cancel')" :loading="loading" icon="pi pi-times" severity="danger" @click="confirmCancellation"/>
    </template>
  </pv-dialog>
</template>
