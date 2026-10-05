<script setup>
import {computed, ref} from "vue";
import {useI18n} from "vue-i18n";
import useIamStore from "../../application/iam.store.js";
import {isValidEmail} from "../../domain/model/password-policy.js";

const {t} = useI18n();
const iamStore = useIamStore();

const email = ref('');
const submitted = ref(false);
const loading = ref(false);
const sent = ref(false);
const demoToken = ref(null);
const isDevelopment = import.meta.env.DEV;

const emailError = computed(() => submitted.value && !isValidEmail(email.value));

/**
 * Requests password recovery (US04). The confirmation is always generic and never reveals
 * whether the account exists.
 */
async function requestRecovery() {
  submitted.value = true;
  if (emailError.value) return;
  loading.value = true;
  demoToken.value = await iamStore.requestPasswordReset(email.value);
  loading.value = false;
  sent.value = true;
}
</script>

<template>
  <section class="auth-card agf-card">
    <span class="agf-eyebrow">{{ t('iam.recovery.eyebrow') }}</span>
    <h1 class="mb-1">{{ t('iam.recovery.title') }}</h1>
    <p class="agf-muted mt-0 mb-4">{{ t('iam.recovery.description') }}</p>

    <template v-if="sent">
      <pv-message class="mb-3" icon="pi pi-envelope" role="status" severity="success">{{ t('iam.recovery.sent') }}</pv-message>
      <pv-message v-if="isDevelopment && demoToken" class="mb-3" icon="pi pi-info-circle" severity="info">
        {{ t('iam.recovery.demo-notice') }}
        <router-link :to="{name: 'iam-reset-password', query: {token: demoToken}}">{{ t('iam.recovery.demo-link') }}</router-link>
      </pv-message>
    </template>

    <form v-else novalidate @submit.prevent="requestRecovery">
      <div class="agf-field">
        <label for="email">{{ t('iam.fields.email') }}</label>
        <pv-input-text id="email" v-model="email" autocomplete="email" fluid :invalid="emailError" type="email"/>
        <small v-if="emailError" class="agf-error-text">{{ t('validation.email') }}</small>
      </div>
      <pv-button :label="t('iam.recovery.submit')" :loading="loading" class="w-full mb-3" icon="pi pi-send" type="submit"/>
    </form>
    <router-link :to="{name: 'iam-sign-in'}" class="agf-small">{{ t('iam.recovery.back') }}</router-link>
  </section>
</template>

<style scoped>
.auth-card {
  max-width: 460px;
  margin: 0 auto;
}
</style>
