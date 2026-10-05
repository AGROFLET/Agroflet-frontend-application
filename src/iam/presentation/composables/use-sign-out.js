import {useRouter} from "vue-router";
import useIamStore from "../../application/iam.store.js";
import useFleetStore from "../../../fleet/application/fleet.store.js";
import useShipmentsStore from "../../../shipments/application/shipments.store.js";
import useTrackingStore from "../../../tracking/application/tracking.store.js";
import useIncidentsStore from "../../../incidents/application/incidents.store.js";
import useNotificationsStore from "../../../incidents/application/notifications.store.js";

/**
 * Closes the session (US03) and clears the state cached by every bounded context,
 * so the next account that signs in on the same device never sees previous data.
 *
 * @returns {{signOut: function(): Promise<void>}} Sign-out action.
 */
export function useSignOut() {
    const router = useRouter();
    const iamStore = useIamStore();
    const fleetStore = useFleetStore();
    const shipmentsStore = useShipmentsStore();
    const trackingStore = useTrackingStore();
    const incidentsStore = useIncidentsStore();
    const notificationsStore = useNotificationsStore();

    /**
     * Removes the session, navigates to sign-in and then resets the cached state,
     * once the private view has been unmounted.
     * @returns {Promise<void>}
     */
    async function signOut() {
        iamStore.signOut();
        await router.push({name: 'iam-sign-in'});
        fleetStore.reset();
        shipmentsStore.reset();
        trackingStore.reset();
        incidentsStore.reset();
        notificationsStore.reset();
    }

    return {signOut};
}
