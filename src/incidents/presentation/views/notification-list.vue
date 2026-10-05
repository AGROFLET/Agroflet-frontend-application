<script setup>
import {computed, onMounted, ref} from "vue";
import {useI18n} from "vue-i18n";
import {useRouter} from "vue-router";
import useNotificationsStore from "../../application/notifications.store.js";
import {NotificationType} from "../../domain/model/notification.entity.js";
import PageHeader from "../../../shared/presentation/components/page-header.vue";
import EmptyState from "../../../shared/presentation/components/empty-state.vue";
import {useFormatters} from "../../../shared/presentation/composables/use-formatters.js";

const {t} = useI18n();
const router = useRouter();
const notificationsStore = useNotificationsStore();
const {formatDateTime, formatRelative} = useFormatters();

const view = ref('all');
const viewOptions = computed(() => [
  {value: 'all', label: t('notifications.filters.all')},
  {value: 'unread', label: t('notifications.filters.unread')}
]);
const visibleNotifications = computed(() => view.value === 'unread'
    ? notificationsStore.notifications.filter(item => !item.isRead)
    : notificationsStore.notifications);

onMounted(() => {
  notificationsStore.fetchNotifications();
});

/**
 * @param {import('../../domain/model/notification.entity.js').Notification} notification - Notification.
 * @returns {string} Translated title.
 */
function titleOf(notification) {
  if (notification.type === NotificationType.INCIDENT) return t('notifications.incident-title', {code: notification.shipmentCode});
  return t('notifications.status-title', {code: notification.shipmentCode, status: t(`shipments.status.${notification.payload.newStatus}`)});
}

/**
 * @param {import('../../domain/model/notification.entity.js').Notification} notification - Notification.
 * @returns {string} Translated message.
 */
function messageOf(notification) {
  const payload = notification.payload;
  if (notification.type === NotificationType.INCIDENT) {
    return t('notifications.incident-message', {type: t(`incidents.types.${payload.incidentType}`), minutes: payload.estimatedDelayMinutes});
  }
  if (!payload.previousStatus) return t('notifications.created-message');
  return t('notifications.status-message', {
    from: t(`shipments.status.${payload.previousStatus}`),
    to: t(`shipments.status.${payload.newStatus}`)
  });
}

/**
 * Marks the notification as read and opens the related shipment.
 * @param {import('../../domain/model/notification.entity.js').Notification} notification - Notification.
 */
async function openNotification(notification) {
  await notificationsStore.markAsRead(notification);
  await router.push({name: 'shipment-detail', params: {id: notification.shipmentId}});
}
</script>

<template>
  <section class="notifications">
    <page-header :description="t('notifications.description')" :eyebrow="t('notifications.eyebrow')" :title="t('notifications.title')">
      <template #actions>
        <pv-select-button v-model="view" :allow-empty="false" :options="viewOptions" option-label="label" option-value="value"/>
        <pv-button :disabled="!notificationsStore.unreadCount" :label="t('notifications.mark-all')" icon="pi pi-check-square"
                   outlined @click="notificationsStore.markAllAsRead()"/>
      </template>
    </page-header>

    <div class="agf-card p-0">
      <div v-if="!notificationsStore.notificationsLoaded" class="p-4 flex flex-column gap-3">
        <pv-skeleton v-for="index in 3" :key="index" height="3.5rem"/>
      </div>
      <empty-state v-else-if="!visibleNotifications.length" :description="t('notifications.empty-description')"
                   :title="t('notifications.empty')" icon="pi pi-bell"/>
      <ul v-else class="notification-list">
        <li v-for="notification in visibleNotifications" :key="notification.id"
            :class="{'notification--unread': !notification.isRead}" class="notification">
          <i :class="notification.type === 'incident' ? 'pi pi-exclamation-triangle notification__icon--incident' : 'pi pi-sync notification__icon--status'"
             aria-hidden="true" class="notification__icon"/>
          <div class="notification__body">
            <div class="flex flex-wrap align-items-center gap-2">
              <strong>{{ titleOf(notification) }}</strong>
              <pv-tag v-if="!notification.isRead" :value="t('notifications.new')" severity="warn"/>
            </div>
            <p class="my-1 agf-small">{{ messageOf(notification) }}</p>
            <span v-tooltip.bottom="formatDateTime(notification.createdAt)" class="agf-caption">{{ formatRelative(notification.createdAt) }}</span>
          </div>
          <div class="notification__actions">
            <pv-button :label="t('common.view-details')" icon="pi pi-arrow-right" icon-pos="right" size="small" text
                       @click="openNotification(notification)"/>
            <pv-button v-if="!notification.isRead" v-tooltip.left="t('notifications.mark-read')" :aria-label="t('notifications.mark-read')"
                       icon="pi pi-check" rounded size="small" text @click="notificationsStore.markAsRead(notification)"/>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.notifications {
  max-width: 960px;
}

.notification-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.notification {
  display: flex;
  align-items: flex-start;
  gap: var(--agf-space-3);
  padding: var(--agf-space-4);
  border-bottom: 1px solid var(--agf-border);
}

.notification:last-child {
  border-bottom: none;
}

.notification--unread {
  background: var(--agf-blue-tint);
}

.notification__icon {
  margin-top: 4px;
  font-size: 1.125rem;
}

.notification__icon--incident {
  color: #b26a00;
}

.notification__icon--status {
  color: var(--agf-navy);
}

.notification__body {
  flex: 1;
  min-width: 0;
}

.notification__actions {
  display: flex;
  align-items: center;
  gap: var(--agf-space-1);
}

@media (max-width: 640px) {
  .notification {
    flex-wrap: wrap;
  }

  .notification__actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
