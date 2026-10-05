<script setup>
import {computed} from "vue";
import {useI18n} from "vue-i18n";

/**
 * Status tag for vehicles and drivers. Color is never the only signal: it always carries an icon and text.
 */
const props = defineProps({
  status: {type: String, required: true}
});

const {t} = useI18n();

const appearance = {
  available: {severity: 'success', icon: 'pi pi-check-circle'},
  reserved: {severity: 'info', icon: 'pi pi-bookmark'},
  in_route: {severity: 'warn', icon: 'pi pi-truck'},
  assigned: {severity: 'info', icon: 'pi pi-user'},
  under_maintenance: {severity: 'danger', icon: 'pi pi-wrench'}
};

const config = computed(() => appearance[props.status] || {severity: 'secondary', icon: 'pi pi-circle'});
</script>

<template>
  <pv-tag :icon="config.icon" :severity="config.severity" :value="t(`fleet.status.${status}`)"/>
</template>
