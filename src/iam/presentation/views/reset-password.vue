<script setup>
import {computed, ref} from "vue";
import {useI18n} from "vue-i18n";
import {useRoute, useRouter} from "vue-router";
import {useToast} from "primevue";
import useIamStore from "../../application/iam.store.js";
import {isValidPassword, PASSWORD_MIN_LENGTH} from "../../domain/model/password-policy.js";

const {t} = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const iamStore = useIamStore();

const token = typeof route.query.token === 'string' ? route.query.token : '';
const password = ref('');
const confirmPassword = ref('');
const submitted = ref(false);
const loading = ref(false);
const rejected = ref(!token);

const passwordError = computed(() => submitted.value && !isValidPassword(password.value));
const confirmError = computed(() => submitted.value && password.value !== confirmPassword.value);

/**
 * Resets the password; expired or used links are rejected (US04, scenario 2).
 */
async function performReset() {
  submitted.value = true;
  if (passwordError.value || confirmError.value) return;
  loading.value = true;
  const ok = await iamStore.resetPassword(token, password.value);
  loading.value = false;
  if (!ok) {
    rejected.value = true;
    return;
  }
  toast.add({severity: 'success', summary: t('iam.reset.success'), life: 5000});
  await router.push({name: 'iam-sign-in'});
}
</script>

<template>
  <section class="auth-card agf-card">
    <span class="agf-eyebrow">{{ t('iam.recovery.eyebrow') }}</span>
    <h1 class="mb-1">{{ t('iam.reset.title') }}</h1>
    <p class="agf-muted mt-0 mb-4">{{ t('iam.reset.description') }}</p>

    <pv-message v-if="rejected" class="mb-3" icon="pi pi-times-circle" role="alert" severity="error">
      {{ t('errors.invalid-reset-token') }}
    </pv-message>

    <form v-else novalidate @submit.prevent="performReset">
      <div class="agf-field">
        <label for="password">{{ t('iam.fields.new-password') }}</label>
        <pv-password v-model="password" :invalid="passwordError" :prompt-label="t('iam.password.prompt')"
                     :weak-label="t('iam.password.weak')" :medium-label="t('iam.password.medium')"
                     :strong-label="t('iam.password.strong')" fluid input-id="password" toggle-mask/>
        <small :class="passwordError ? 'agf-error-text' : 'agf-caption'">{{ t('validation.password', {min: PASSWORD_MIN_LENGTH}) }}</small>
      </div>
      <div class="agf-field">
        <label for="confirmPassword">{{ t('iam.fields.confirm-password') }}</label>
        <pv-password v-model="confirmPassword" :feedback="false" :invalid="confirmError" fluid input-id="confirmPassword" toggle-mask/>
        <small v-if="confirmError" class="agf-error-text">{{ t('validation.passwords-match') }}</small>
      </div>
      <pv-button :label="t('iam.reset.submit')" :loading="loading" class="w-full mb-3" icon="pi pi-check" type="submit"/>
    </form>
    <router-link :to="{name: rejected ? 'iam-password-recovery' : 'iam-sign-in'}" class="agf-small">
      {{ rejected ? t('iam.reset.request-new') : t('iam.recovery.back') }}
    </router-link>
  </section>
</template>

<style scoped>
.auth-card {
  max-width: 460px;
  margin: 0 auto;
}
</style>
