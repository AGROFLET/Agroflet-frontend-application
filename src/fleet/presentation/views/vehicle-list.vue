<script setup>
import {onMounted} from "vue";
import {useI18n} from "vue-i18n";
import useFleetStore from "../../application/fleet.store.js";
import PageHeader from "../../../shared/presentation/components/page-header.vue";
import EmptyState from "../../../shared/presentation/components/empty-state.vue";
import ResourceStatusTag from "../components/resource-status-tag.vue";
import {useFormatters} from "../../../shared/presentation/composables/use-formatters.js";

const {t} = useI18n();
const fleetStore = useFleetStore();
const {formatRelative} = useFormatters();

onMounted(() => {
  fleetStore.fetchVehicles();
});
</script>

<template>
  <section>
    <page-header :description="t('fleet.vehicles.description')" :eyebrow="t('fleet.eyebrow')" :title="t('fleet.vehicles.title')">
      <template #actions>
        <pv-button :label="t('fleet.vehicles.new')" as="router-link" icon="pi pi-plus" to="/fleet/vehicles/new"/>
      </template>
    </page-header>

    <div class="agf-card p-0 overflow-hidden">
      <pv-data-table
          :loading="!fleetStore.vehiclesLoaded"
          :rows="10"
          :value="fleetStore.vehicles"
          data-key="id"
          paginator
          :rows-per-page-options="[5, 10, 20]"
          sort-field="plate"
          :sort-order="1"
          striped-rows
          table-style="min-width: 48rem">
        <template #empty>
          <empty-state :description="t('fleet.vehicles.empty-description')" :title="t('fleet.vehicles.empty')" icon="pi pi-truck">
            <pv-button :label="t('fleet.vehicles.new')" as="router-link" icon="pi pi-plus" to="/fleet/vehicles/new"/>
          </empty-state>
        </template>
        <pv-column :header="t('fleet.fields.plate')" field="plate" sortable>
          <template #body="{data}"><span class="font-semibold white-space-nowrap">{{ data.plate }}</span></template>
        </pv-column>
        <pv-column :header="t('fleet.fields.vehicle')" field="brand" sortable>
          <template #body="{data}">{{ data.brand }} {{ data.model }} · {{ data.year }}</template>
        </pv-column>
        <pv-column :header="t('fleet.fields.capacity')" field="capacityTons" sortable>
          <template #body="{data}">{{ t('common.tons', {value: data.capacityTons}) }}</template>
        </pv-column>
        <pv-column :header="t('fleet.fields.body-type')" field="bodyType">
          <template #body="{data}">{{ t(`fleet.body-types.${data.bodyType}`) }}</template>
        </pv-column>
        <pv-column :header="t('fleet.fields.status')" field="status" sortable>
          <template #body="{data}"><resource-status-tag :status="data.status"/></template>
        </pv-column>
        <pv-column :header="t('common.last-update')" field="updatedAt" sortable>
          <template #body="{data}"><span class="agf-small agf-muted">{{ formatRelative(data.updatedAt) }}</span></template>
        </pv-column>
        <pv-column :header="t('common.actions')">
          <template #body="{data}">
            <pv-button v-tooltip.top="t('common.edit')" :aria-label="`${t('common.edit')} ${data.plate}`" as="router-link"
                       icon="pi pi-pencil" rounded text :to="`/fleet/vehicles/${data.id}/edit`"/>
          </template>
        </pv-column>
      </pv-data-table>
    </div>
    <pv-message v-if="fleetStore.errors.length" class="mt-3" severity="error">{{ t('errors.network') }}</pv-message>
  </section>
</template>
