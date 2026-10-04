<script setup>
import {computed} from "vue";
import {useI18n} from "vue-i18n";
import {useFormatters} from "../../../shared/presentation/composables/use-formatters.js";
import EmptyState from "../../../shared/presentation/components/empty-state.vue";

/**
 * Reported positions of a shipment, newest first, with date, source and freshness (US17).
 */
const props = defineProps({
  positions: {type: Array, default: () => []}
});

const {t} = useI18n();
const {formatDateTime, formatRelative} = useFormatters();

const ordered = computed(() => [...props.positions].reverse());
const last = computed(() => props.positions.length ? props.positions[props.positions.length - 1] : null);
</script>

<template>
  <div>
    <pv-message v-if="!last" class="mb-3" icon="pi pi-map-marker" severity="secondary">{{ t('tracking.no-position') }}</pv-message>
    <pv-message v-else-if="last.isStale()" class="mb-3" icon="pi pi-clock" severity="warn">
      {{ t('tracking.stale-message', {date: formatDateTime(last.reportedAt)}) }}
    </pv-message>
    <pv-data-table :value="ordered" data-key="id" size="small" striped-rows table-style="min-width: 40rem">
      <template #empty>
        <empty-state :description="t('tracking.no-position-description')" :title="t('tracking.no-positions')" icon="pi pi-map-marker"/>
      </template>
      <pv-column :header="t('tracking.reported-at')">
        <template #body="{data}">
          <div class="flex flex-column">
            <span>{{ formatDateTime(data.reportedAt) }}</span>
            <span class="agf-caption">{{ formatRelative(data.reportedAt) }}</span>
          </div>
        </template>
      </pv-column>
      <pv-column :header="t('tracking.source')">
        <template #body="{data}">{{ t(`tracking.sources.${data.source}`) }}</template>
      </pv-column>
      <pv-column :header="t('tracking.coordinates')">
        <template #body="{data}"><span class="agf-small">{{ data.latitude.toFixed(4) }}, {{ data.longitude.toFixed(4) }}</span></template>
      </pv-column>
      <pv-column :header="t('tracking.reference')" field="note"/>
      <pv-column :header="t('tracking.data-type')">
        <template #body="{data}">
          <pv-tag v-if="data.isDemo" :value="t('tracking.demo-data')" icon="pi pi-info-circle" severity="secondary"/>
          <pv-tag v-else :value="t('tracking.reported-data')" icon="pi pi-check" severity="success"/>
        </template>
      </pv-column>
    </pv-data-table>
  </div>
</template>
