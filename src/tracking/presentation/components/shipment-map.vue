<script setup>
import {nextTick, onBeforeUnmount, onMounted, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import L from "leaflet";
import {useFormatters} from "../../../shared/presentation/composables/use-formatters.js";

/**
 * Interactive map that distinguishes the planned route (dashed reference line) from the reported positions
 * (dated points with their source). It never draws an invented current position (US17, US18).
 *
 * Each item: { id, code, route: PlannedRoute, positions: ReportedPosition[] }.
 */
const props = defineProps({
  items: {type: Array, default: () => []},
  selectedId: {type: Number, default: null},
  height: {type: String, default: '420px'}
});
const emit = defineEmits(['select']);

const {t, locale} = useI18n();
const {formatDateTime} = useFormatters();

const container = ref(null);
let map = null;
let layerGroup = null;

/** Default view: central Peru. */
const PERU_CENTER = [-11.2, -76.2];

const COLORS = {route: '#0B3B60', selectedRoute: '#176B3A', position: '#27AE60', last: '#F39C12', stale: '#5B6676'};

/**
 * @param {string} text - Raw text.
 * @returns {string} HTML-escaped text (labels may contain user-written content).
 */
function escapeHtml(text) {
  return String(text ?? '').replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]));
}

/** Redraws routes and positions and fits the view to them. */
function render() {
  if (!map) return;
  layerGroup.clearLayers();
  const bounds = [];
  props.items.forEach(item => {
    const selected = item.id === props.selectedId;
    const route = item.route;
    if (route?.isAvailable) {
      const from = [route.origin.latitude, route.origin.longitude];
      const to = [route.destination.latitude, route.destination.longitude];
      L.polyline([from, to], {
        color: selected ? COLORS.selectedRoute : COLORS.route,
        weight: selected ? 4 : 3,
        dashArray: '8 8',
        opacity: props.selectedId && !selected ? 0.45 : 0.9
      }).bindTooltip(`${escapeHtml(item.code)} · ${t('tracking.planned-route')}`)
          .on('click', () => emit('select', item.id))
          .addTo(layerGroup);
      L.circleMarker(from, {radius: 5, color: COLORS.route, fillColor: '#FFFFFF', fillOpacity: 1, weight: 2})
          .bindTooltip(`${t('shipments.fields.origin')}: ${escapeHtml(route.origin.label)}`).addTo(layerGroup);
      L.circleMarker(to, {radius: 6, color: COLORS.route, fillColor: COLORS.route, fillOpacity: 1, weight: 2})
          .bindTooltip(`${t('shipments.fields.destination')}: ${escapeHtml(route.destination.label)}`).addTo(layerGroup);
      bounds.push(from, to);
    }
    const positions = item.positions || [];
    positions.forEach((position, index) => {
      const isLast = index === positions.length - 1;
      const stale = position.isStale();
      const color = isLast ? (stale ? COLORS.stale : COLORS.last) : COLORS.position;
      const lines = [
        `<strong>${escapeHtml(item.code)}</strong> · ${t('tracking.reported-position')}`,
        `${t('tracking.reported-at')}: ${formatDateTime(position.reportedAt)}`,
        `${t('tracking.source')}: ${t(`tracking.sources.${position.source}`)}`,
        position.note ? escapeHtml(position.note) : '',
        isLast && stale ? `<em>${t('tracking.stale-warning')}</em>` : '',
        position.isDemo ? `<em>${t('tracking.demo-data')}</em>` : ''
      ].filter(Boolean);
      L.circleMarker([position.latitude, position.longitude], {
        radius: isLast ? 9 : 6, color: '#FFFFFF', weight: 2, fillColor: color, fillOpacity: 1
      }).bindPopup(lines.join('<br>')).addTo(layerGroup);
      bounds.push([position.latitude, position.longitude]);
    });
  });
  if (bounds.length) map.fitBounds(bounds, {padding: [32, 32], maxZoom: 9});
  else map.setView(PERU_CENTER, 6);
}

onMounted(async () => {
  await nextTick();
  map = L.map(container.value, {scrollWheelZoom: false, attributionControl: true}).setView(PERU_CENTER, 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  layerGroup = L.layerGroup().addTo(map);
  render();
});

watch(() => [props.items, props.selectedId, locale.value], render, {deep: true});

onBeforeUnmount(() => {
  if (map) map.remove();
  map = null;
});
</script>

<template>
  <figure class="shipment-map">
    <div ref="container" :aria-label="t('tracking.map-label')" :style="{height}" class="shipment-map__canvas" role="region"/>
    <figcaption class="shipment-map__legend">
      <span><span class="legend-line" aria-hidden="true"/> {{ t('tracking.legend.planned-route') }}</span>
      <span><span class="legend-dot legend-dot--position" aria-hidden="true"/> {{ t('tracking.legend.reported-position') }}</span>
      <span><span class="legend-dot legend-dot--last" aria-hidden="true"/> {{ t('tracking.legend.last-position') }}</span>
      <span><span class="legend-dot legend-dot--stale" aria-hidden="true"/> {{ t('tracking.legend.stale-position') }}</span>
    </figcaption>
    <p class="agf-caption m-0">{{ t('tracking.disclaimer') }}</p>
  </figure>
</template>

<style scoped>
.shipment-map {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--agf-space-2);
}

.shipment-map__canvas {
  width: 100%;
  border-radius: var(--agf-radius);
  border: 1px solid var(--agf-border);
  z-index: 0;
  background: #e5eef5;
}

.shipment-map__legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--agf-space-4);
  font-size: 0.75rem;
  color: var(--agf-text-muted);
}

.shipment-map__legend > span {
  display: inline-flex;
  align-items: center;
  gap: var(--agf-space-1);
}

.legend-line {
  display: inline-block;
  width: 24px;
  border-top: 3px dashed #0B3B60;
}

.legend-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #FFFFFF;
  box-shadow: 0 0 0 1px var(--agf-border);
}

.legend-dot--position {
  background: #27AE60;
}

.legend-dot--last {
  background: #F39C12;
}

.legend-dot--stale {
  background: #5B6676;
}
</style>
