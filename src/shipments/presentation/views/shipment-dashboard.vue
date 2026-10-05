<script setup>
import {computed, onMounted, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import useIamStore from "../../../iam/application/iam.store.js";
import useShipmentsStore from "../../application/shipments.store.js";
import useTrackingStore from "../../../tracking/application/tracking.store.js";
import PageHeader from "../../../shared/presentation/components/page-header.vue";
import EmptyState from "../../../shared/presentation/components/empty-state.vue";
import ShipmentStatusTag from "../components/shipment-status-tag.vue";
import ShipmentMap from "../../../tracking/presentation/components/shipment-map.vue";
import {useFormatters} from "../../../shared/presentation/composables/use-formatters.js";

const {t} = useI18n();
const iamStore = useIamStore();
const shipmentsStore = useShipmentsStore();
const trackingStore = useTrackingStore();
const {formatDateTime, formatRelative, formatTons} = useFormatters();

const selectedId = ref(null);

const kpis = computed(() => [
  {key: 'planned', icon: 'pi pi-calendar', value: shipmentsStore.countByStatus.planned || 0},
  {key: 'in_transit', icon: 'pi pi-truck', value: shipmentsStore.countByStatus.in_transit || 0},
  {key: 'delivered', icon: 'pi pi-check-circle', value: shipmentsStore.countByStatus.delivered || 0},
  {key: 'cancelled', icon: 'pi pi-times-circle', value: shipmentsStore.countByStatus.cancelled || 0}
]);

/** Map items: planned route + reported positions of every active shipment (US10, US17, US18). */
const mapItems = computed(() => shipmentsStore.activeShipments.map(shipment => ({
  id: shipment.id,
  code: shipment.code,
  route: trackingStore.getPlannedRoute(shipment),
  positions: trackingStore.positionsByShipment[shipment.id] || []
})));

/**
 * @param {number} id - Location identifier.
 * @returns {string} City of the location.
 */
const cityOf = (id) => shipmentsStore.getLocationById(id)?.city || '—';

onMounted(async () => {
  await shipmentsStore.fetchLocations();
  await shipmentsStore.fetchShipments();
});

watch(() => shipmentsStore.activeShipments.map(shipment => shipment.id).join(','), () => {
  trackingStore.fetchPositions(shipmentsStore.activeShipments.map(shipment => shipment.id));
}, {immediate: true});
</script>

<template>
  <section>
    <page-header
        :description="iamStore.isBuyer ? t('dashboard.buyer-description') : t('dashboard.dispatcher-description')"
        :eyebrow="t('dashboard.greeting', {name: iamStore.currentUser?.firstName ?? ''})"
        :title="iamStore.isBuyer ? t('dashboard.buyer-title') : t('dashboard.dispatcher-title')">
      <template #actions>
        <pv-button v-if="iamStore.isDispatcher" :label="t('navigation.new-shipment')" as="router-link" icon="pi pi-plus" to="/shipments/new"/>
        <pv-button :label="t('dashboard.view-history')" as="router-link" icon="pi pi-history" outlined to="/shipments"/>
      </template>
    </page-header>

    <ul class="kpis">
      <li v-for="kpi in kpis" :key="kpi.key" class="agf-card kpi">
        <i :class="kpi.icon" aria-hidden="true" class="kpi__icon"/>
        <div>
          <span class="kpi__value">{{ kpi.value }}</span>
          <span class="kpi__label agf-small">{{ t(`shipments.status.${kpi.key}`) }}</span>
        </div>
      </li>
    </ul>

    <pv-message v-if="shipmentsStore.errors.length" class="mb-3" icon="pi pi-wifi" severity="error">{{ t('errors.api-unavailable') }}</pv-message>

    <div class="dashboard">
      <div class="agf-card dashboard__map">
        <h2 class="mb-3">{{ t('dashboard.map-title') }}</h2>
        <shipment-map :items="mapItems" :selected-id="selectedId" height="460px" @select="id => selectedId = id"/>
      </div>

      <aside :aria-label="t('dashboard.active-operations')" class="agf-card dashboard__list">
        <div class="flex align-items-center justify-content-between mb-3">
          <h2>{{ t('dashboard.active-operations') }}</h2>
          <pv-tag :value="String(shipmentsStore.activeShipments.length)" rounded severity="secondary"/>
        </div>
        <div v-if="!shipmentsStore.shipmentsLoaded" class="flex flex-column gap-2">
          <pv-skeleton v-for="index in 3" :key="index" height="6rem"/>
        </div>
        <empty-state v-else-if="!shipmentsStore.activeShipments.length"
                     :description="iamStore.isBuyer ? t('dashboard.buyer-empty-description') : t('dashboard.dispatcher-empty-description')"
                     :title="t('dashboard.empty')" icon="pi pi-box">
          <pv-button v-if="iamStore.isDispatcher" :label="t('navigation.new-shipment')" as="router-link" icon="pi pi-plus" to="/shipments/new"/>
        </empty-state>
        <ul v-else class="operations">
          <li v-for="shipment in shipmentsStore.activeShipments" :key="shipment.id">
            <button :aria-pressed="selectedId === shipment.id" :class="{'operation--selected': selectedId === shipment.id}"
                    class="operation" type="button" @click="selectedId = shipment.id">
              <span class="flex align-items-center justify-content-between gap-2">
                <strong>{{ shipment.code }}</strong>
                <shipment-status-tag :status="shipment.status"/>
              </span>
              <span class="agf-small">{{ t(`shipments.cargo-types.${shipment.cargoType}`) }} · {{ formatTons(shipment.weightTons) }}</span>
              <span class="agf-small agf-muted">{{ cityOf(shipment.originId) }} → {{ cityOf(shipment.destinationId) }}</span>
              <span class="agf-small"><i class="pi pi-flag" aria-hidden="true"/> {{ t('shipments.fields.eta') }}: {{ formatDateTime(shipment.estimatedArrivalAt) }}</span>
              <span class="agf-caption">{{ t('common.last-update') }}: {{ formatRelative(shipment.updatedAt) }}</span>
            </button>
            <router-link :to="{name: 'shipment-detail', params: {id: shipment.id}}" class="operation__link agf-small">
              {{ t('common.view-details') }} <i class="pi pi-arrow-right" aria-hidden="true"/>
            </router-link>
          </li>
        </ul>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.kpis {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--agf-space-4);
  list-style: none;
  padding: 0;
  margin: 0 0 var(--agf-space-6);
}

.kpi {
  display: flex;
  align-items: center;
  gap: var(--agf-space-3);
  padding: var(--agf-space-4);
}

.kpi__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #e8f3ec;
  color: var(--agf-action-green);
  font-size: 1.25rem;
}

.kpi__value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--agf-navy);
  line-height: 1.2;
}

.kpi__label {
  color: var(--agf-text-muted);
}

/* 70 % map / 30 % operations list on wide screens (Chapter IV, 4.4.1) */
.dashboard {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 3fr);
  gap: var(--agf-space-4);
  align-items: start;
}

.dashboard__list {
  max-height: 620px;
  overflow-y: auto;
}

.operations {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--agf-space-3);
}

.operation {
  display: flex;
  flex-direction: column;
  gap: var(--agf-space-1);
  width: 100%;
  padding: var(--agf-space-3);
  border: 1px solid var(--agf-border);
  border-radius: 8px;
  background: var(--agf-white);
  text-align: left;
  cursor: pointer;
  color: var(--agf-text);
}

.operation:hover,
.operation--selected {
  border-color: var(--agf-action-green);
  background: #f3faf5;
}

.operation__link {
  display: inline-flex;
  gap: var(--agf-space-1);
  align-items: center;
  margin: var(--agf-space-1) 0 0 var(--agf-space-1);
  font-weight: 500;
  text-decoration: none;
}

@media (max-width: 1199px) {
  .dashboard {
    grid-template-columns: 1fr;
  }

  .dashboard__list {
    max-height: none;
  }
}

@media (max-width: 767px) {
  .kpis {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
