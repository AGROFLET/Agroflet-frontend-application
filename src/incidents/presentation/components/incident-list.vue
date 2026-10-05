<script setup>
import {useI18n} from "vue-i18n";
import {useFormatters} from "../../../shared/presentation/composables/use-formatters.js";
import EmptyState from "../../../shared/presentation/components/empty-state.vue";

/**
 * Incident history of a shipment ordered by date with type, description and impact (US14).
 */
defineProps({
  incidents: {type: Array, default: () => []}
});

const {t} = useI18n();
const {formatDateTime} = useFormatters();

const icons = {
  road_block: 'pi pi-ban',
  landslide: 'pi pi-exclamation-triangle',
  mechanical_failure: 'pi pi-wrench',
  accident: 'pi pi-exclamation-circle',
  heavy_traffic: 'pi pi-car',
  weather: 'pi pi-cloud',
  other: 'pi pi-info-circle'
};
</script>

<template>
  <empty-state v-if="!incidents.length" :description="t('incidents.empty-description')" :title="t('incidents.empty')"
               icon="pi pi-check-circle"/>
  <ol v-else class="incident-list">
    <li v-for="incident in incidents" :key="incident.id" class="incident-list__item">
      <span class="incident-list__icon" aria-hidden="true"><i :class="icons[incident.type] || icons.other"/></span>
      <div class="incident-list__body">
        <div class="flex flex-wrap align-items-center gap-2">
          <strong>{{ t(`incidents.types.${incident.type}`) }}</strong>
          <pv-tag :value="t('incidents.delay', {minutes: incident.estimatedDelayMinutes})"
                  :severity="incident.estimatedDelayMinutes > 0 ? 'warn' : 'secondary'" icon="pi pi-clock"/>
        </div>
        <p class="my-1">{{ incident.description }}</p>
        <span class="agf-caption">{{ t('incidents.occurred-at') }}: {{ formatDateTime(incident.occurredAt) }}</span>
      </div>
    </li>
  </ol>
</template>

<style scoped>
.incident-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--agf-space-3);
}

.incident-list__item {
  display: flex;
  gap: var(--agf-space-3);
  padding: var(--agf-space-3);
  border: 1px solid var(--agf-border);
  border-left: 4px solid var(--agf-accent-orange);
  border-radius: 8px;
  background: var(--agf-white);
}

.incident-list__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 36px;
  height: 36px;
  border-radius: 50%;
  background: #fff4e0;
  color: #9a5b00;
}

.incident-list__body {
  min-width: 0;
}
</style>
