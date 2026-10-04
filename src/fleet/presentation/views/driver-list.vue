<script setup>
import {onMounted} from "vue";
import {useI18n} from "vue-i18n";
import useFleetStore from "../../application/fleet.store.js";
import PageHeader from "../../../shared/presentation/components/page-header.vue";
import EmptyState from "../../../shared/presentation/components/empty-state.vue";
import ResourceStatusTag from "../components/resource-status-tag.vue";

const {t} = useI18n();
const fleetStore = useFleetStore();

onMounted(() => {
  fleetStore.fetchDrivers();
});
</script>

<template>
  <section>
    <page-header :description="t('fleet.drivers.description')" :eyebrow="t('fleet.eyebrow')" :title="t('fleet.drivers.title')">
      <template #actions>
        <pv-button :label="t('fleet.drivers.new')" as="router-link" icon="pi pi-plus" to="/fleet/drivers/new"/>
      </template>
    </page-header>
    <div class="agf-card p-0 overflow-hidden">
      <pv-data-table
          :loading="!fleetStore.driversLoaded"
          :rows="10"
          :value="fleetStore.drivers"
          data-key="id"
          paginator
          :rows-per-page-options="[5, 10, 20]"
          sort-field="lastName"
          :sort-order="1"
          striped-rows
          table-style="min-width: 44rem">
        <template #empty>
          <empty-state :description="t('fleet.drivers.empty-description')" :title="t('fleet.drivers.empty')" icon="pi pi-id-card">
            <pv-button :label="t('fleet.drivers.new')" as="router-link" icon="pi pi-plus" to="/fleet/drivers/new"/>
          </empty-state>
        </template>
        <pv-column :header="t('fleet.fields.driver')" field="lastName" sortable>
          <template #body="{data}"><span class="font-semibold">{{ data.fullName }}</span></template>
        </pv-column>
        <pv-column :header="t('fleet.fields.dni')" field="dni"/>
        <pv-column :header="t('fleet.fields.license')" field="licenseNumber">
          <template #body="{data}">{{ data.licenseNumber }} · {{ data.licenseCategory }}</template>
        </pv-column>
        <pv-column :header="t('fleet.fields.phone')" field="phone">
          <template #body="{data}"><a :href="`tel:+51${data.phone}`">{{ data.phone }}</a></template>
        </pv-column>
        <pv-column :header="t('fleet.fields.status')" field="status" sortable>
          <template #body="{data}"><resource-status-tag :status="data.status"/></template>
        </pv-column>
      </pv-data-table>
    </div>
    <pv-message v-if="fleetStore.errors.length" class="mt-3" severity="error">{{ t('errors.network') }}</pv-message>
  </section>
</template>
