<script setup>
import {computed, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import {useRoute} from "vue-router";
import LanguageSwitcher from "./language-switcher.vue";
import FooterContent from "./footer-content.vue";
import BrandLogo from "./brand-logo.vue";
import AuthenticationSection from "../../../iam/presentation/components/authentication-section.vue";
import useIamStore from "../../../iam/application/iam.store.js";
import useNotificationsStore from "../../../incidents/application/notifications.store.js";

const {t} = useI18n();
const route = useRoute();
const iamStore = useIamStore();
const notificationsStore = useNotificationsStore();

const drawerVisible = ref(false);

/** Navigation adapts to the role (Navigation Systems, Chapter IV 4.2.5). */
const navigationItems = computed(() => {
  if (iamStore.isBuyer) {
    return [
      {label: 'navigation.incoming-shipments', icon: 'pi pi-inbox', to: '/dashboard'},
      {label: 'navigation.history', icon: 'pi pi-history', to: '/shipments'},
      {label: 'navigation.notifications', icon: 'pi pi-bell', to: '/notifications', badge: true},
      {label: 'navigation.settings', icon: 'pi pi-cog', to: '/iam/profile'}
    ];
  }
  return [
    {label: 'navigation.dashboard', icon: 'pi pi-th-large', to: '/dashboard'},
    {label: 'navigation.shipments', icon: 'pi pi-box', to: '/shipments'},
    {label: 'navigation.new-shipment', icon: 'pi pi-plus-circle', to: '/shipments/new'},
    {label: 'navigation.vehicles', icon: 'pi pi-truck', to: '/fleet/vehicles'},
    {label: 'navigation.drivers', icon: 'pi pi-id-card', to: '/fleet/drivers'},
    {label: 'navigation.notifications', icon: 'pi pi-bell', to: '/notifications', badge: true},
    {label: 'navigation.settings', icon: 'pi pi-cog', to: '/iam/profile'}
  ];
});

/**
 * The workspace frame stays mounted while a private route is active, so closing the session does not remount
 * the current view in the public frame before the navigation to sign-in completes.
 */
const showWorkspace = computed(() => iamStore.isSignedIn || (route.matched.length > 0 && !route.meta['public']));

const workspaceLabel = computed(() =>
    iamStore.isBuyer ? t('navigation.buyer-workspace') : t('navigation.dispatcher-workspace'));

/**
 * @param {string} path - Navigation path.
 * @returns {boolean} True when the item matches the current route.
 */
function isActive(path) {
  if (path === '/shipments') return route.path === '/shipments' || /^\/shipments\/\d+/.test(route.path);
  return route.path === path || route.path.startsWith(`${path}/`);
}

watch(() => iamStore.isSignedIn, (signedIn) => {
  if (signedIn) notificationsStore.fetchNotifications();
}, {immediate: true});

watch(() => route.fullPath, () => {
  drawerVisible.value = false;
});
</script>

<template>
  <pv-toast position="top-right"/>
  <pv-confirm-dialog/>
  <a class="skip-link" href="#main-content">{{ t('navigation.skip-to-content') }}</a>

  <!-- Authenticated workspace: top bar + role-based sidebar -->
  <div v-if="showWorkspace" class="workspace">
    <header class="topbar">
      <div class="topbar__start">
        <pv-button
            :aria-label="t('navigation.open-menu')"
            class="topbar__menu-button"
            icon="pi pi-bars"
            severity="secondary"
            text
            @click="drawerVisible = true"/>
        <router-link :aria-label="t('navigation.dashboard')" class="topbar__brand" to="/dashboard">
          <brand-logo/>
        </router-link>
        <span class="topbar__workspace agf-small">{{ workspaceLabel }}</span>
      </div>
      <div class="topbar__end">
        <router-link
            v-tooltip.bottom="t('navigation.notifications')"
            :aria-label="t('notifications.unread-count', {count: notificationsStore.unreadCount})"
            class="topbar__bell"
            to="/notifications">
          <i class="pi pi-bell" aria-hidden="true"/>
          <pv-badge v-if="notificationsStore.unreadCount" :value="notificationsStore.unreadCount" severity="warn"/>
        </router-link>
        <language-switcher/>
        <authentication-section/>
      </div>
    </header>

    <div class="workspace__body">
      <nav :aria-label="t('navigation.main')" class="sidebar">
        <router-link
            v-for="item in navigationItems"
            :key="item.to"
            :aria-current="isActive(item.to) ? 'page' : undefined"
            :class="{'sidebar__item--active': isActive(item.to)}"
            :to="item.to"
            class="sidebar__item">
          <i :class="item.icon" aria-hidden="true"/>
          <span>{{ t(item.label) }}</span>
          <pv-badge v-if="item.badge && notificationsStore.unreadCount" :value="notificationsStore.unreadCount"
                    class="ml-auto" severity="warn"/>
        </router-link>
      </nav>

      <pv-drawer v-model:visible="drawerVisible" :header="workspaceLabel" class="sidebar-drawer">
        <nav :aria-label="t('navigation.main')" class="flex flex-column gap-1">
          <router-link
              v-for="item in navigationItems"
              :key="item.to"
              :class="{'sidebar__item--active': isActive(item.to)}"
              :to="item.to"
              class="sidebar__item">
            <i :class="item.icon" aria-hidden="true"/>
            <span>{{ t(item.label) }}</span>
          </router-link>
        </nav>
      </pv-drawer>

      <div class="workspace__content">
        <main id="main-content" class="workspace__main" tabindex="-1">
          <router-view/>
        </main>
        <footer-content/>
      </div>
    </div>
  </div>

  <!-- Public pages: sign-in, sign-up, password recovery, terms, about -->
  <div v-else class="public">
    <header class="public__header">
      <router-link :aria-label="t('navigation.home')" to="/iam/sign-in">
        <brand-logo/>
      </router-link>
      <div class="public__actions">
        <router-link class="public__link agf-small" to="/terms">{{ t('footer.terms') }}</router-link>
        <language-switcher/>
        <authentication-section/>
      </div>
    </header>
    <main id="main-content" class="public__main" tabindex="-1">
      <router-view/>
    </main>
    <footer-content/>
  </div>
</template>

<style scoped>
.skip-link {
  position: absolute;
  left: -9999px;
  top: 0;
  z-index: 2000;
  padding: var(--agf-space-2) var(--agf-space-4);
  background: var(--agf-navy);
  color: var(--agf-white);
}

.skip-link:focus {
  left: var(--agf-space-4);
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--agf-space-3);
  height: var(--agf-header-height);
  padding: 0 var(--agf-space-4);
  background: var(--agf-white);
  border-bottom: 1px solid var(--agf-border);
}

.topbar__start,
.topbar__end {
  display: flex;
  align-items: center;
  gap: var(--agf-space-3);
}

.topbar__brand {
  text-decoration: none;
}

.topbar__workspace {
  padding: var(--agf-space-1) var(--agf-space-3);
  border-radius: 999px;
  background: var(--agf-blue-tint);
  color: var(--agf-navy);
  font-weight: 500;
}

.topbar__menu-button {
  display: none;
}

.topbar__bell {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--agf-space-1);
  color: var(--agf-navy);
  text-decoration: none;
  font-size: 1.25rem;
}

.workspace__body {
  display: flex;
  min-height: calc(100vh - var(--agf-header-height));
}

.sidebar {
  position: sticky;
  top: var(--agf-header-height);
  align-self: flex-start;
  display: flex;
  flex-direction: column;
  gap: var(--agf-space-1);
  width: var(--agf-sidebar-width);
  min-height: calc(100vh - var(--agf-header-height));
  padding: var(--agf-space-4) var(--agf-space-3);
  background: var(--agf-white);
  border-right: 1px solid var(--agf-border);
}

.sidebar__item {
  display: flex;
  align-items: center;
  gap: var(--agf-space-3);
  padding: var(--agf-space-2) var(--agf-space-3);
  border-radius: 8px;
  color: var(--agf-navy);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9375rem;
}

.sidebar__item:hover {
  background: var(--agf-background-light);
}

.sidebar__item--active {
  background: #e8f3ec;
  color: var(--agf-action-green);
}

.workspace__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.workspace__main {
  flex: 1;
  padding: var(--agf-space-8);
  outline: none;
}

.public {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.public__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--agf-space-3);
  padding: var(--agf-space-3) var(--agf-space-6);
  background: var(--agf-white);
  border-bottom: 1px solid var(--agf-border);
}

.public__header a {
  text-decoration: none;
}

.public__actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--agf-space-3);
}

.public__link {
  color: var(--agf-navy);
}

.public__main {
  flex: 1;
  padding: var(--agf-space-8) var(--agf-space-4);
  outline: none;
}

@media (max-width: 1023px) {
  .sidebar {
    display: none;
  }

  .topbar__menu-button {
    display: inline-flex;
  }

  .topbar__workspace {
    display: none;
  }

  .workspace__main {
    padding: var(--agf-space-4);
  }
}

@media (max-width: 480px) {
  .public__header {
    padding: var(--agf-space-3) var(--agf-space-4);
  }

  .topbar {
    padding: 0 var(--agf-space-2);
    gap: var(--agf-space-2);
  }

  .topbar__start,
  .topbar__end {
    gap: var(--agf-space-2);
  }

  /* Only the imagotype icon fits next to the actions on small phones. */
  .topbar__brand :deep(.brand__name) {
    display: none;
  }
}
</style>
