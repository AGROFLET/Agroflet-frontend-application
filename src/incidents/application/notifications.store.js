import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {IncidentsApi} from "../infrastructure/incidents-api.js";
import {NotificationAssembler} from "../infrastructure/notification.assembler.js";
import useIamStore from "../../iam/application/iam.store.js";

const incidentsApi = new IncidentsApi();

/**
 * Application service store for alerts (US19, US20).
 * Notifications are only addressed to the participants of the shipment and never duplicated per event.
 *
 * @returns {Object} Store state and actions.
 */
const useNotificationsStore = defineStore('notifications', () => {
    const iamStore = useIamStore();

    /** @type {import('vue').Ref<import('../domain/model/notification.entity.js').Notification[]>} */
    const notifications = ref([]);
    /** @type {import('vue').Ref<boolean>} */
    const notificationsLoaded = ref(false);
    /** @type {import('vue').Ref<Error[]>} */
    const errors = ref([]);

    /** @type {import('vue').ComputedRef<number>} */
    const unreadCount = computed(() => notifications.value.filter(notification => !notification.isRead).length);

    /**
     * Loads the notifications of the signed-in user (TS15).
     * @returns {Promise<void>}
     */
    async function fetchNotifications() {
        if (!iamStore.currentUserId) return;
        try {
            const response = await incidentsApi.getNotifications({recipientId: iamStore.currentUserId});
            notifications.value = NotificationAssembler.toEntitiesFromResponse(response);
        } catch (error) {
            errors.value.push(error);
        } finally {
            notificationsLoaded.value = true;
        }
    }

    /**
     * Marks a notification as read; repeating the action keeps the first read date (TS16).
     * @param {import('../domain/model/notification.entity.js').Notification} notification - Notification.
     * @returns {Promise<void>}
     */
    async function markAsRead(notification) {
        if (notification.isRead) return;
        try {
            const response = await incidentsApi.patchNotification(notification.id, {isRead: true, readAt: new Date().toISOString()});
            const updated = NotificationAssembler.toEntityFromResource(response.data);
            const index = notifications.value.findIndex(item => item.id === updated.id);
            if (index !== -1) notifications.value[index] = updated;
        } catch (error) {
            errors.value.push(error);
        }
    }

    /** Marks every unread notification as read. */
    async function markAllAsRead() {
        await Promise.all(notifications.value.filter(item => !item.isRead).map(item => markAsRead(item)));
    }

    /**
     * Publishes one notification per recipient for a domain event, skipping recipients that already have it.
     * @param {Object} event - Domain event.
     * @param {string} event.type - Notification type.
     * @param {string} event.eventKey - Unique event key.
     * @param {number[]} event.recipientIds - Participants of the shipment.
     * @param {number} event.shipmentId - Shipment identifier.
     * @param {string} event.shipmentCode - Shipment code.
     * @param {Object} event.payload - Data for the translated message.
     * @returns {Promise<void>}
     */
    async function publish({type, eventKey, recipientIds, shipmentId, shipmentCode, payload}) {
        const uniqueRecipients = [...new Set(recipientIds.filter(id => id != null))];
        for (const recipientId of uniqueRecipients) {
            try {
                const existing = await incidentsApi.getNotifications({recipientId, eventKey});
                if (NotificationAssembler.toEntitiesFromResponse(existing).length) continue;
                const response = await incidentsApi.createNotification({
                    recipientId, shipmentId, shipmentCode, type, eventKey, payload,
                    createdAt: new Date().toISOString(), isRead: false, readAt: null
                });
                if (recipientId === iamStore.currentUserId) {
                    notifications.value.unshift(NotificationAssembler.toEntityFromResource(response.data));
                }
            } catch (error) {
                errors.value.push(error);
            }
        }
    }

    /** Clears cached notifications (on sign-out). */
    function reset() {
        notifications.value = [];
        notificationsLoaded.value = false;
        errors.value = [];
    }

    return {notifications, notificationsLoaded, errors, unreadCount, fetchNotifications, markAsRead, markAllAsRead, publish, reset};
});

export default useNotificationsStore;
