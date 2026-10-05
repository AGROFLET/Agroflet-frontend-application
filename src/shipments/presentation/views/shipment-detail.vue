<script setup>
import {computed, onMounted, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import {useRoute} from "vue-router";
import {useConfirm, useToast} from "primevue";
import useIamStore from "../../../iam/application/iam.store.js";
import useFleetStore from "../../../fleet/application/fleet.store.js";
import useShipmentsStore from "../../application/shipments.store.js";
import useTrackingStore from "../../../tracking/application/tracking.store.js";
import useIncidentsStore from "../../../incidents/application/incidents.store.js";
import PageHeader from "../../../shared/presentation/components/page-header.vue";
import EmptyState from "../../../shared/presentation/components/empty-state.vue";
import ShipmentStatusTag from "../components/shipment-status-tag.vue";
import CancelShipmentDialog from "../components/cancel-shipment-dialog.vue";
import ShipmentMap from "../../../tracking/presentation/components/shipment-map.vue";
import PositionList from "../../../tracking/presentation/components/position-list.vue";
import RegisterPositionDialog from "../../../tracking/presentation/components/register-position-dialog.vue";
import IncidentList from "../../../incidents/presentation/components/incident-list.vue";
import IncidentFormDialog from "../../../incidents/presentation/components/incident-form-dialog.vue";
import {useFormatters} from "../../../shared/presentation/composables/use-formatters.js";
import {useErrorMessage} from "../../../shared/presentation/composables/use-error-message.js";

const {t} = useI18n();
const route = useRoute();
const confirm = useConfirm();
const toast = useToast();
const iamStore = useIamStore();
const fleetStore = useFleetStore();
const shipmentsStore = useShipmentsStore();
const trackingStore = useTrackingStore();
const incidentsStore = useIncidentsStore();
const {formatDateTime, formatRelative, formatTons} = useFormatters();
const {errorMessage} = useErrorMessage();

const loading = ref(true);
const shipmentId = computed(() => Number(route.params.id));
const shipment = computed(() => shipmentsStore.shipments.find(item => item.id === shipmentId.value) || null);
const notAccessible = ref(false);
const buyer = ref(null);
const dispatcher = ref(null);
const vehicle = ref(null);
const driver = ref(null);
const statusChanges = ref([]);
const activeTab = ref('summary');
const busyAction = ref('');
const cancelVisible = ref(false);
const incidentVisible = ref(false);
const positionVisible = ref(false);

const isOwnerDispatcher = computed(() => iamStore.isDispatcher && shipment.value?.dispatcherId === iamStore.currentUserId);
const origin = computed(() => shipment.value ? shipmentsStore.getLocationById(shipment.value.originId) : null);
const destination = computed(() => shipment.value ? shipmentsStore.getLocationById(shipment.value.destinationId) : null);
const positions = computed(() => trackingStore.positionsByShipment[shipmentId.value] || []);
const lastPosition = computed(() => positions.value.length ? positions.value[positions.value.length - 1] : null);
const incidents = computed(() => incidentsStore.incidentsByShipment[shipmentId.value] || []);
const plannedRoute = computed(() => shipment.value ? trackingStore.getPlannedRoute(shipment.value) : null);
const mapItems = computed(() => shipment.value ? [{
  id: shipment.value.id,
  code: shipment.value.code,
  route: plannedRoute.value,
  positions: positions.value
}] : []);
const totalDelay = computed(() => incidents.value.reduce((sum, incident) => sum + incident.estimatedDelayMinutes, 0));

const timelineEvents = computed(() => statusChanges.value.map(change => ({
  ...change,
  icon: {planned: 'pi pi-calendar', in_transit: 'pi pi-truck', delivered: 'pi pi-check', cancelled: 'pi pi-times'}[change.newStatus]
})));

/** Loads the shipment with its resources, participants, positions, incidents and timeline. */
async function loadShipment() {
  loading.value = true;
  notAccessible.value = false;
  await shipmentsStore.fetchLocations();
  const found = await shipmentsStore.fetchShipmentById(shipmentId.value);
  if (!found) {
    notAccessible.value = true;
    loading.value = false;
    return;
  }
  const [buyerUser, dispatcherUser, vehicleFound, driverFound] = await Promise.all([
    iamStore.findUserById(found.buyerId),
    iamStore.findUserById(found.dispatcherId),
    fleetStore.findVehicleById(found.vehicleId),
    fleetStore.findDriverById(found.driverId)
  ]);
  buyer.value = buyerUser;
  dispatcher.value = dispatcherUser;
  vehicle.value = vehicleFound;
  driver.value = driverFound;
  await Promise.all([
    trackingStore.fetchPositions([found.id]),
    incidentsStore.fetchIncidents(found.id),
    reloadTimeline()
  ]);
  loading.value = false;
}

/** Reloads the status timeline. */
async function reloadTimeline() {
  statusChanges.value = await shipmentsStore.fetchStatusChanges(shipmentId.value);
}

/**
 * Runs a lifecycle use case and reports the outcome.
 * @param {string} action - Action key.
 * @param {function(): Promise<{ok: boolean, errorCode?: string}>} useCase - Use case.
 * @param {string} successKey - i18n key of the success message.
 */
async function runAction(action, useCase, successKey) {
  busyAction.value = action;
  const result = await useCase();
  busyAction.value = '';
  if (!result.ok) {
    toast.add({severity: 'error', summary: errorMessage(result.errorCode), life: 6000});
    return false;
  }
  toast.add({severity: 'success', summary: t(successKey, {code: shipment.value.code}), life: 5000});
  await reloadTimeline();
  vehicle.value = await fleetStore.findVehicleById(shipment.value.vehicleId);
  driver.value = await fleetStore.findDriverById(shipment.value.driverId);
  return true;
}

/** Confirms the effective departure (US31). */
function confirmStart() {
  confirm.require({
    header: t('shipments.start.header'),
    message: t('shipments.start.message', {code: shipment.value.code}),
    icon: 'pi pi-truck',
    acceptLabel: t('shipments.actions.start'),
    rejectLabel: t('common.cancel'),
    rejectProps: {severity: 'secondary', outlined: true},
    accept: () => runAction('start', () => shipmentsStore.startTransit(shipment.value), 'shipments.start.success')
  });
}

/** Confirms the delivery (US12, scenario 1). */
function confirmDelivery() {
  confirm.require({
    header: t('shipments.deliver.header'),
    message: t('shipments.deliver.message', {code: shipment.value.code}),
    icon: 'pi pi-check-circle',
    acceptLabel: t('shipments.actions.deliver'),
    rejectLabel: t('common.cancel'),
    rejectProps: {severity: 'secondary', outlined: true},
    accept: () => runAction('deliver', () => shipmentsStore.markAsDelivered(shipment.value), 'shipments.deliver.success')
  });
}

/**
 * Cancels with the reason entered in the dialog (US12, scenario 2).
 * @param {string} reason - Cancellation reason.
 */
async function cancelWithReason(reason) {
  const ok = await runAction('cancel', () => shipmentsStore.cancelShipment(shipment.value, reason), 'shipments.cancel.success');
  if (ok) cancelVisible.value = false;
}

onMounted(loadShipment);
watch(shipmentId, loadShipment);
watch(incidentVisible, (open) => {
  if (!open && shipment.value) reloadTimeline();
});
</script>

<template>
  <section>
    <router-link :to="{name: 'shipments'}" class="back-link agf-small">
      <i aria-hidden="true" class="pi pi-arrow-left"/> {{ t('shipments.detail.back') }}
    </router-link>

    <div v-if="loading" class="flex flex-column gap-3 mt-3">
      <pv-skeleton height="3rem" width="40%"/>
      <pv-skeleton height="16rem"/>
    </div>

    <div v-else-if="notAccessible || !shipment" class="agf-card mt-3">
      <empty-state :description="t('shipments.detail.not-found-description')" :title="t('shipments.detail.not-found')" icon="pi pi-lock">
        <pv-button :label="t('shipments.detail.back')" as="router-link" icon="pi pi-arrow-left" to="/shipments"/>
      </empty-state>
    </div>

    <template v-else>
      <page-header :description="`${origin?.label || '—'} → ${destination?.label || '—'}`" :eyebrow="t('shipments.detail.eyebrow')"
                   :title="shipment.code" class="mt-3">
        <template #actions>
          <shipment-status-tag :status="shipment.status" class="mr-2"/>
          <template v-if="isOwnerDispatcher">
            <pv-button v-if="shipment.canStartTransit" :label="t('shipments.actions.start')" :loading="busyAction === 'start'"
                       icon="pi pi-play" @click="confirmStart"/>
            <pv-button v-if="shipment.acceptsTravelEvents" :label="t('incidents.register')" icon="pi pi-exclamation-triangle"
                       severity="warn" @click="incidentVisible = true"/>
            <pv-button v-if="shipment.acceptsTravelEvents" :label="t('tracking.register-position')" icon="pi pi-map-marker"
                       outlined @click="positionVisible = true"/>
            <pv-button v-if="shipment.canBeDelivered" :label="t('shipments.actions.deliver')" :loading="busyAction === 'deliver'"
                       icon="pi pi-check" severity="success" @click="confirmDelivery"/>
            <pv-button v-if="shipment.canBeCancelled" :label="t('shipments.actions.cancel')" icon="pi pi-times" outlined
                       severity="danger" @click="cancelVisible = true"/>
          </template>
        </template>
      </page-header>

      <pv-message v-if="shipment.isTerminal" class="mb-3" icon="pi pi-lock" severity="secondary">{{ t('shipments.detail.terminal-notice') }}</pv-message>

      <div class="summary-strip mb-4">
        <div class="agf-card summary-strip__item">
          <span class="agf-caption">{{ t('shipments.fields.eta') }}</span>
          <strong>{{ formatDateTime(shipment.estimatedArrivalAt) }}</strong>
          <span v-if="totalDelay" class="agf-caption">{{ t('shipments.detail.includes-delay', {minutes: totalDelay}) }}</span>
        </div>
        <div class="agf-card summary-strip__item">
          <span class="agf-caption">{{ t('shipments.fields.cargo') }}</span>
          <strong>{{ t(`shipments.cargo-types.${shipment.cargoType}`) }} · {{ formatTons(shipment.weightTons) }}</strong>
        </div>
        <div class="agf-card summary-strip__item">
          <span class="agf-caption">{{ t('tracking.last-position') }}</span>
          <template v-if="lastPosition">
            <strong>{{ formatRelative(lastPosition.reportedAt) }}</strong>
            <span v-if="shipment.acceptsTravelEvents && lastPosition.isStale()" class="agf-caption stale-text">
              <i aria-hidden="true" class="pi pi-exclamation-triangle"/> {{ t('tracking.stale-warning') }}
            </span>
          </template>
          <strong v-else>{{ t('tracking.location-unavailable') }}</strong>
        </div>
        <div class="agf-card summary-strip__item">
          <span class="agf-caption">{{ t('common.last-update') }}</span>
          <strong>{{ formatRelative(shipment.updatedAt) }}</strong>
        </div>
      </div>

      <pv-tabs v-model:value="activeTab">
        <pv-tab-list>
          <pv-tab value="summary">{{ t('shipments.detail.tabs.summary') }}</pv-tab>
          <pv-tab value="route">{{ t('shipments.detail.tabs.route') }}</pv-tab>
          <pv-tab value="positions">{{ t('shipments.detail.tabs.positions') }} ({{ positions.length }})</pv-tab>
          <pv-tab value="incidents">{{ t('shipments.detail.tabs.incidents') }} ({{ incidents.length }})</pv-tab>
          <pv-tab value="history">{{ t('shipments.detail.tabs.history') }}</pv-tab>
        </pv-tab-list>
        <pv-tab-panels>
          <pv-tab-panel value="summary">
            <div class="grid">
              <div class="col-12 md:col-6">
                <h3 class="mb-2">{{ t('shipments.detail.operation') }}</h3>
                <dl class="details">
                  <dt>{{ t('shipments.fields.cargo-description') }}</dt><dd>{{ shipment.cargoDescription || '—' }}</dd>
                  <dt>{{ t('shipments.fields.origin') }}</dt><dd>{{ origin ? `${origin.label} (${origin.region})` : '—' }}</dd>
                  <dt>{{ t('shipments.fields.destination') }}</dt><dd>{{ destination ? `${destination.label} (${destination.region})` : '—' }}</dd>
                  <dt>{{ t('shipments.fields.planned-departure') }}</dt><dd>{{ formatDateTime(shipment.plannedDepartureAt) }}</dd>
                  <dt>{{ t('shipments.fields.actual-departure') }}</dt><dd>{{ formatDateTime(shipment.actualDepartureAt) }}</dd>
                  <dt>{{ t('shipments.fields.eta') }}</dt><dd>{{ formatDateTime(shipment.estimatedArrivalAt) }}</dd>
                  <dt v-if="shipment.deliveredAt">{{ t('shipments.fields.delivered-at') }}</dt>
                  <dd v-if="shipment.deliveredAt">{{ formatDateTime(shipment.deliveredAt) }}</dd>
                  <dt v-if="shipment.cancelledAt">{{ t('shipments.fields.cancelled-at') }}</dt>
                  <dd v-if="shipment.cancelledAt">{{ formatDateTime(shipment.cancelledAt) }}</dd>
                  <dt v-if="shipment.cancellationReason">{{ t('shipments.cancel.reason') }}</dt>
                  <dd v-if="shipment.cancellationReason">{{ shipment.cancellationReason }}</dd>
                </dl>
              </div>
              <div class="col-12 md:col-6">
                <h3 class="mb-2">{{ t('shipments.detail.participants') }}</h3>
                <dl class="details">
                  <dt>{{ t('iam.roles.dispatcher') }}</dt>
                  <dd>{{ dispatcher ? `${dispatcher.fullName} · ${dispatcher.companyName}` : '—' }}</dd>
                  <dt>{{ t('iam.roles.buyer') }}</dt>
                  <dd>{{ buyer ? `${buyer.fullName} · ${buyer.companyName}` : '—' }}</dd>
                  <dt>{{ t('shipments.fields.vehicle') }}</dt>
                  <dd>{{ vehicle ? `${vehicle.plate} · ${vehicle.brand} ${vehicle.model} · ${t(`fleet.body-types.${vehicle.bodyType}`)}` : '—' }}</dd>
                  <dt>{{ t('shipments.fields.driver') }}</dt>
                  <dd>{{ driver ? driver.fullName : '—' }}</dd>
                  <template v-if="isOwnerDispatcher && driver">
                    <dt>{{ t('fleet.fields.dni') }}</dt><dd>{{ driver.dni }}</dd>
                    <dt>{{ t('fleet.fields.phone') }}</dt><dd><a :href="`tel:+51${driver.phone}`">{{ driver.phone }}</a></dd>
                  </template>
                </dl>
              </div>
            </div>
          </pv-tab-panel>
          <pv-tab-panel value="route">
            <pv-message v-if="plannedRoute && !plannedRoute.isAvailable" class="mb-3" icon="pi pi-map" severity="warn">
              {{ t('tracking.route-unavailable') }}
            </pv-message>
            <p v-else-if="plannedRoute" class="agf-small agf-muted mt-0">
              {{ t('tracking.route-summary', {km: plannedRoute.straightDistanceKm}) }}
            </p>
            <shipment-map v-if="activeTab === 'route'" :items="mapItems" :selected-id="shipment.id" height="440px"/>
          </pv-tab-panel>
          <pv-tab-panel value="positions">
            <position-list :positions="positions"/>
          </pv-tab-panel>
          <pv-tab-panel value="incidents">
            <incident-list :incidents="incidents"/>
          </pv-tab-panel>
          <pv-tab-panel value="history">
            <pv-timeline :value="timelineEvents" class="status-timeline">
              <template #marker="{item}">
                <span class="timeline-marker"><i :class="item.icon" aria-hidden="true"/></span>
              </template>
              <template #content="{item}">
                <div class="mb-3">
                  <shipment-status-tag :status="item.newStatus"/>
                  <p class="my-1 agf-small">
                    {{ item.previousStatus ? t('shipments.detail.transition', {from: t(`shipments.status.${item.previousStatus}`), to: t(`shipments.status.${item.newStatus}`)}) : t('shipments.detail.created') }}
                  </p>
                  <span class="agf-caption">{{ formatDateTime(item.changedAt) }}</span>
                  <p v-if="item.reason" class="my-1 agf-small agf-muted">{{ item.reason }}</p>
                </div>
              </template>
            </pv-timeline>
          </pv-tab-panel>
        </pv-tab-panels>
      </pv-tabs>

      <cancel-shipment-dialog v-model:visible="cancelVisible" :loading="busyAction === 'cancel'" :shipment="shipment"
                              @confirm="cancelWithReason"/>
      <incident-form-dialog v-model:visible="incidentVisible" :shipment="shipment"/>
      <register-position-dialog v-model:visible="positionVisible" :shipment="shipment"/>
    </template>
  </section>
</template>

<style scoped>
.back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--agf-space-1);
  text-decoration: none;
  font-weight: 500;
}

.summary-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--agf-space-4);
}

.summary-strip__item {
  display: flex;
  flex-direction: column;
  gap: var(--agf-space-1);
  padding: var(--agf-space-4);
}

.summary-strip__item strong {
  color: var(--agf-navy);
}

.stale-text {
  color: var(--agf-warning-text);
  font-weight: 600;
}

.details {
  display: grid;
  grid-template-columns: minmax(140px, auto) 1fr;
  gap: var(--agf-space-2) var(--agf-space-4);
  margin: 0;
  font-size: 0.9375rem;
}

.details dt {
  color: var(--agf-text-muted);
}

.details dd {
  margin: 0;
}

.timeline-marker {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--agf-navy);
  color: var(--agf-white);
}

:deep(.status-timeline .p-timeline-event-opposite) {
  display: none;
}

@media (max-width: 1023px) {
  .summary-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 480px) {
  .summary-strip {
    grid-template-columns: 1fr;
  }

  .details {
    grid-template-columns: 1fr;
  }
}
</style>
