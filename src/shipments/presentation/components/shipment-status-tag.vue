<script setup>
import {computed} from "vue";
import {useI18n} from "vue-i18n";

/**
 * Shipment status tag: icon + text + color, so the state is never communicated by color alone.
 */
const props = defineProps({
  status: {type: String, required: true}
});

const {t} = useI18n();

const appearance = {
  planned: {severity: 'info', icon: 'pi pi-calendar'},
  in_transit: {severity: 'warn', icon: 'pi pi-truck'},
  delivered: {severity: 'success', icon: 'pi pi-check-circle'},
  cancelled: {severity: 'danger', icon: 'pi pi-times-circle'}
};

const config = computed(() => appearance[props.status] || {severity: 'secondary', icon: 'pi pi-circle'});
</script>

<template>
  <pv-tag :icon="config.icon" :severity="config.severity" :value="t(`shipments.status.${status}`)"/>
</template>
