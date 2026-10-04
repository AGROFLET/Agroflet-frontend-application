<script setup>
import {computed, onMounted, reactive} from "vue";
import {useI18n} from "vue-i18n";
import {useRouter} from "vue-router";
import useIamStore from "../../../iam/application/iam.store.js";
import useShipmentsStore from "../../application/shipments.store.js";
import {CARGO_TYPES, SHIPMENT_STATUSES} from "../../domain/model/shipment-status.js";
import {ShipmentFilter} from "../../domain/model/shipment-filter.js";
import PageHeader from "../../../shared/presentation/components/page-header.vue";
import EmptyState from "../../../shared/presentation/components/empty-state.vue";
import ShipmentStatusTag from "../components/shipment-status-tag.vue";
import {useFormatters} from "../../../shared/presentation/composables/use-formatters.js";

const {t} = useI18n();
const router = useRouter();
const iamStore = useIamStore();
const shipmentsStore = useShipmentsStore();
const {formatDateTime, formatRelative, formatTons} = useFormatters();

/** Local copy of the filter: restored from the store so it is kept when returning from a detail. */
const criteria = reactive({...shipmentsStore.filter});

const statusOptions = computed(() => SHIPMENT_STATUSES.map(value => ({value, label: t(`shipments.status.${value}`)})));
const cargoOptions = computed(() => CARGO_TYPES.map(value => ({value, label: t(`shipments.cargo-types.${value}`)})));
const destinationOptions = computed(() => shipmentsStore.locations
    .filter(location => location.kind === 'destination')
    .map(location => ({value: location.id, label: location.label})));
const invertedRange = computed(() => new ShipmentFilter(criteria).hasInvertedRange);

/** Active filter chips with a translated label. */
const activeChips = computed(() => {
  const chips = [];
  const filter = shipmentsStore.filter;
  if (filter.term.trim()) chips.push({key: 'term', label: `${t('shipments.filters.search')}: ${filter.term}`});
  if (filter.status) chips.push({key: 'status', label: t(`shipments.status.${filter.status}`)});
  if (filter.cargoType) chips.push({key: 'cargoType', label: t(`shipments.cargo-types.${filter.cargoType}`)});
  if (filter.destinationId) chips.push({key: 'destinationId', label: shipmentsStore.getLocationById(filter.destinationId)?.label});
  if (filter.startDate) chips.push({key: 'startDate', label: `${t('shipments.filters.from')}: ${new Date(filter.startDate).toLocaleDateString()}`});
  if (filter.endDate) chips.push({key: 'endDate', label: `${t('shipments.filters.to')}: ${new Date(filter.endDate).toLocaleDateString()}`});
  return chips;
});

/**
 * @param {number} id - Location identifier.
 * @returns {string} City.
 */
const cityOf = (id) => shipmentsStore.getLocationById(id)?.city || '—';

/** Applies every criterion at once (US15) including the code/plate search (US16). */
function applyFilters() {
  shipmentsStore.setFilter({...criteria});
}

/** Clears filters and shows the full authorized list again. */
function clearFilters() {
  Object.assign(criteria, new ShipmentFilter());
  shipmentsStore.clearFilter();
}

/**
 * Removes a single active filter.
 * @param {string} key - Criterion name.
 */
function removeChip(key) {
  criteria[key] = key === 'term' ? '' : null;
  applyFilters();
}

/**
 * Opens a shipment detail.
 * @param {{data: import('../../domain/model/shipment.entity.js').Shipment}} event - Row click event.
 */
function openShipment(event) {
  router.push({name: 'shipment-detail', params: {id: event.data.id}});
}

onMounted(async () => {
  await shipmentsStore.fetchLocations();
  await shipmentsStore.fetchShipments();
});
</script>

<template>
  <section>
    <page-header :description="t('shipments.history.description')" :eyebrow="t('shipments.eyebrow')"
                 :title="iamStore.isBuyer ? t('shipments.history.buyer-title') : t('shipments.history.title')">
      <template #actions>
        <pv-button v-if="iamStore.isDispatcher" :label="t('navigation.new-shipment')" as="router-link" icon="pi pi-plus" to="/shipments/new"/>
      </template>
    </page-header>

    <form :aria-label="t('shipments.filters.title')" class="agf-card mb-4" role="search" @submit.prevent="applyFilters">
      <div class="filters">
        <div class="agf-field filters__search">
          <label for="term">{{ t('shipments.filters.search') }}</label>
          <pv-icon-field>
            <pv-input-icon class="pi pi-search"/>
            <pv-input-text id="term" v-model="criteria.term" fluid :placeholder="t('shipments.filters.search-placeholder')"/>
          </pv-icon-field>
        </div>
        <div class="agf-field">
          <label id="status-label" for="status">{{ t('shipments.fields.status') }}</label>
          <pv-select v-model="criteria.status" :options="statusOptions" fluid input-id="status" aria-labelledby="status-label" option-label="label" option-value="value"
                     :placeholder="t('common.all')" show-clear/>
        </div>
        <div class="agf-field">
          <label id="cargoType-label" for="cargoType">{{ t('shipments.fields.cargo-type') }}</label>
          <pv-select v-model="criteria.cargoType" :options="cargoOptions" fluid input-id="cargoType" aria-labelledby="cargoType-label" option-label="label" option-value="value"
                     :placeholder="t('common.all')" show-clear/>
        </div>
        <div class="agf-field">
          <label id="destination-label" for="destination">{{ t('shipments.fields.destination') }}</label>
          <pv-select v-model="criteria.destinationId" :options="destinationOptions" fluid input-id="destination" aria-labelledby="destination-label" option-label="label"
                     option-value="value" :placeholder="t('common.all')" show-clear/>
        </div>
        <div class="agf-field">
          <label for="startDate">{{ t('shipments.filters.from') }}</label>
          <pv-date-picker v-model="criteria.startDate" :invalid="invertedRange" fluid input-id="startDate" show-button-bar show-icon/>
        </div>
        <div class="agf-field">
          <label for="endDate">{{ t('shipments.filters.to') }}</label>
          <pv-date-picker v-model="criteria.endDate" :invalid="invertedRange" fluid input-id="endDate" show-button-bar show-icon/>
        </div>
      </div>
      <pv-message v-if="invertedRange" class="mb-3" icon="pi pi-calendar-times" role="alert" severity="error">{{ t('errors.inverted-range') }}</pv-message>
      <div class="agf-actions">
        <pv-button :disabled="invertedRange" :label="t('shipments.filters.apply')" icon="pi pi-filter" type="submit"/>
        <pv-button :label="t('shipments.filters.clear')" icon="pi pi-filter-slash" outlined severity="secondary" type="button" @click="clearFilters"/>
      </div>
    </form>

    <div v-if="activeChips.length" :aria-label="t('shipments.filters.active')" class="chips mb-3" role="list">
      <span class="agf-small agf-muted">{{ t('shipments.filters.active') }}:</span>
      <button v-for="chip in activeChips" :key="chip.key" :aria-label="`${t('shipments.filters.remove')} ${chip.label}`" class="chip"
              role="listitem" type="button" @click="removeChip(chip.key)">
        {{ chip.label }} <i aria-hidden="true" class="pi pi-times"/>
      </button>
    </div>

    <div class="agf-card p-0 overflow-hidden">
      <pv-data-table
          :loading="!shipmentsStore.shipmentsLoaded"
          :rows="10"
          :rows-per-page-options="[5, 10, 20]"
          :value="shipmentsStore.filteredShipments"
          data-key="id"
          paginator
          row-hover
          striped-rows
          table-style="min-width: 60rem"
          @row-click="openShipment">
        <template #header>
          <span class="agf-small agf-muted" role="status">{{ t('shipments.history.results', {count: shipmentsStore.filteredShipments.length}) }}</span>
        </template>
        <template #empty>
          <empty-state :description="t('shipments.history.empty-description')" :title="t('shipments.history.empty')" icon="pi pi-search"/>
        </template>
        <pv-column :header="t('shipments.fields.code')" field="code" sortable>
          <template #body="{data}">
            <router-link :to="{name: 'shipment-detail', params: {id: data.id}}" class="font-semibold white-space-nowrap" @click.stop>{{ data.code }}</router-link>
          </template>
        </pv-column>
        <pv-column :header="t('shipments.fields.cargo')" field="cargoType" sortable>
          <template #body="{data}">{{ t(`shipments.cargo-types.${data.cargoType}`) }} · {{ formatTons(data.weightTons) }}</template>
        </pv-column>
        <pv-column :header="t('shipments.fields.route')">
          <template #body="{data}">{{ cityOf(data.originId) }} → {{ cityOf(data.destinationId) }}</template>
        </pv-column>
        <pv-column :header="t('fleet.fields.plate')">
          <template #body="{data}"><span class="white-space-nowrap">{{ shipmentsStore.vehiclePlates[data.vehicleId] || '—' }}</span></template>
        </pv-column>
        <pv-column :header="t('shipments.fields.status')" field="status" sortable>
          <template #body="{data}"><shipment-status-tag :status="data.status"/></template>
        </pv-column>
        <pv-column :header="t('shipments.fields.planned-departure')" field="plannedDepartureAt" sortable>
          <template #body="{data}">{{ formatDateTime(data.plannedDepartureAt) }}</template>
        </pv-column>
        <pv-column :header="t('shipments.fields.eta')" field="estimatedArrivalAt" sortable>
          <template #body="{data}">{{ formatDateTime(data.estimatedArrivalAt) }}</template>
        </pv-column>
        <pv-column :header="t('common.last-update')" field="updatedAt" sortable>
          <template #body="{data}"><span class="agf-small agf-muted">{{ formatRelative(data.updatedAt) }}</span></template>
        </pv-column>
      </pv-data-table>
    </div>
  </section>
</template>

<style scoped>
.filters {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  column-gap: var(--agf-space-4);
}

.filters__search {
  grid-column: span 3;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--agf-space-2);
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: var(--agf-space-1);
  padding: var(--agf-space-1) var(--agf-space-3);
  border: 1px solid var(--agf-border);
  border-radius: 999px;
  background: var(--agf-blue-tint);
  color: var(--agf-navy);
  font-size: 0.8125rem;
  cursor: pointer;
}

:deep(.p-datatable-tbody > tr) {
  cursor: pointer;
}

@media (max-width: 1023px) {
  .filters {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filters__search {
    grid-column: span 2;
  }
}

@media (max-width: 640px) {
  .filters {
    grid-template-columns: 1fr;
  }

  .filters__search {
    grid-column: span 1;
  }
}
</style>
