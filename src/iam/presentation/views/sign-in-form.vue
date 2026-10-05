<script setup>
import {computed, reactive, ref} from "vue";
import {useI18n} from "vue-i18n";
import {useRoute, useRouter} from "vue-router";
import useIamStore from "../../application/iam.store.js";
import {SignInCommand} from "../../domain/model/sign-in.command.js";
import {isValidEmail} from "../../domain/model/password-policy.js";
import {USER_TYPES} from "../../domain/model/user-type.js";

const {t} = useI18n();
const route = useRoute();
const router = useRouter();
const iamStore = useIamStore();

const form = reactive({email: '', password: ''});
const submitted = ref(false);
const loading = ref(false);
const failed = ref(false);

/** Segment chosen on the landing page (US34): it only guides the copy, it grants no permission. */
const segment = computed(() => USER_TYPES.includes(route.query.segment) ? route.query.segment : null);

const emailError = computed(() => submitted.value && !isValidEmail(form.email));
const passwordError = computed(() => submitted.value && !form.password);

/**
 * Builds a SignInCommand and executes the sign-in use case (US02).
 * Invalid credentials show a generic message that does not reveal whether the account exists.
 */
async function performSignIn() {
  submitted.value = true;
  failed.value = false;
  if (emailError.value || passwordError.value) return;
  loading.value = true;
  const ok = await iamStore.signIn(new SignInCommand(form));
  loading.value = false;
  if (!ok) {
    failed.value = true;
    return;
  }
  const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/') ? route.query.redirect : '/dashboard';
  await router.push(redirect);
}
</script>

<template>
  <section class="auth-card agf-card">
    <span class="agf-eyebrow">{{ segment ? t(`iam.segments.${segment}.eyebrow`) : t('iam.sign-in.eyebrow') }}</span>
    <h1 class="mb-1">{{ t('iam.sign-in.title') }}</h1>
    <p class="agf-muted mt-0 mb-4">{{ segment ? t(`iam.segments.${segment}.description`) : t('iam.sign-in.description') }}</p>

    <pv-message v-if="failed" class="mb-3" icon="pi pi-exclamation-triangle" role="alert" severity="error">
      {{ iamStore.errors.some(error => error.code === 'invalid-credentials') ? t('errors.invalid-credentials') : t('errors.network') }}
    </pv-message>

    <form novalidate @submit.prevent="performSignIn">
      <div class="agf-field">
        <label for="email">{{ t('iam.fields.email') }}</label>
        <pv-input-text id="email" v-model="form.email" :aria-invalid="emailError" autocomplete="email" fluid
                       :invalid="emailError" placeholder="name@company.com" type="email"/>
        <small v-if="emailError" class="agf-error-text">{{ t('validation.email') }}</small>
      </div>
      <div class="agf-field">
        <label for="password">{{ t('iam.fields.password') }}</label>
        <pv-password v-model="form.password" :feedback="false" :invalid="passwordError" fluid input-id="password"
                     :input-props="{autocomplete: 'current-password'}" toggle-mask/>
        <small v-if="passwordError" class="agf-error-text">{{ t('validation.required') }}</small>
      </div>
      <pv-button :label="t('iam.sign-in.action')" :loading="loading" class="w-full mb-3" icon="pi pi-sign-in" type="submit"/>
    </form>

    <div class="auth-card__links agf-small">
      <router-link :to="{name: 'iam-password-recovery'}">{{ t('iam.sign-in.forgot-password') }}</router-link>
      <span>
        {{ t('iam.sign-in.no-account') }}
        <router-link :to="{name: 'iam-sign-up', query: segment ? {segment} : {}}">{{ t('iam.sign-up.action') }}</router-link>
      </span>
    </div>

    <pv-divider/>
    <p class="agf-caption m-0">{{ t('iam.sign-in.demo-accounts') }}</p>
  </section>
</template>

<style scoped>
.auth-card {
  max-width: 460px;
  margin: 0 auto;
}

.auth-card__links {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--agf-space-2);
}
</style>
