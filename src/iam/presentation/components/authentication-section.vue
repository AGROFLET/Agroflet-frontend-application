<script setup>
import {computed} from "vue";
import {useI18n} from "vue-i18n";
import {useConfirm} from "primevue";
import useIamStore from "../../application/iam.store.js";
import {useSignOut} from "../composables/use-sign-out.js";

const {t} = useI18n();
const confirm = useConfirm();
const iamStore = useIamStore();
const {signOut} = useSignOut();

const initials = computed(() => {
  const user = iamStore.currentUser;
  return user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() : '';
});

/**
 * Asks for confirmation and closes the session (US03), clearing every cached bounded-context state.
 */
function performSignOut() {
  confirm.require({
    header: t('iam.sign-out.header'),
    message: t('iam.sign-out.message'),
    icon: 'pi pi-sign-out',
    acceptLabel: t('iam.sign-out.accept'),
    rejectLabel: t('common.cancel'),
    rejectProps: {severity: 'secondary', outlined: true},
    accept: () => signOut()
  });
}
</script>

<template>
  <div class="auth-section">
    <template v-if="iamStore.isSignedIn">
      <router-link :aria-label="t('navigation.settings')" class="auth-section__user" to="/iam/profile">
        <pv-avatar :label="initials" shape="circle" class="auth-section__avatar"/>
        <span class="auth-section__name agf-small">{{ iamStore.currentUser?.fullName }}</span>
      </router-link>
      <pv-button
          v-tooltip.bottom="t('iam.sign-out.action')"
          :aria-label="t('iam.sign-out.action')"
          icon="pi pi-sign-out"
          severity="secondary"
          text
          @click="performSignOut"/>
    </template>
    <template v-else>
      <pv-button :label="t('iam.sign-in.action')" as="router-link" severity="secondary" size="small" text to="/iam/sign-in"/>
      <pv-button :label="t('iam.sign-up.action')" as="router-link" size="small" to="/iam/sign-up"/>
    </template>
  </div>
</template>

<style scoped>
.auth-section {
  display: flex;
  align-items: center;
  gap: var(--agf-space-2);
}

.auth-section__user {
  display: flex;
  align-items: center;
  gap: var(--agf-space-2);
  color: var(--agf-navy);
  text-decoration: none;
}

.auth-section__avatar {
  background: var(--agf-navy);
  color: var(--agf-white);
}

@media (max-width: 767px) {
  .auth-section__name {
    display: none;
  }
}
</style>
