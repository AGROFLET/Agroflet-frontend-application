<script setup>
import {computed, reactive, ref} from "vue";
import {useI18n} from "vue-i18n";
import {useRoute, useRouter} from "vue-router";
import {useToast} from "primevue";
import useIamStore from "../../application/iam.store.js";
import {SignUpCommand} from "../../domain/model/sign-up.command.js";
import {isValidEmail, isValidPassword, isValidPhone, PASSWORD_MIN_LENGTH} from "../../domain/model/password-policy.js";
import {USER_TYPES, UserType} from "../../domain/model/user-type.js";
import {useErrorMessage} from "../../../shared/presentation/composables/use-error-message.js";

const {t, locale} = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const iamStore = useIamStore();
const {errorMessage} = useErrorMessage();

const segment = USER_TYPES.includes(route.query.segment) ? route.query.segment : UserType.DISPATCHER;

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  userType: segment,
  phone: '',
  companyName: '',
  acceptTerms: false
});
const submitted = ref(false);
const loading = ref(false);
const serverError = ref('');

const roleOptions = computed(() => USER_TYPES.map(value => ({value, label: t(`iam.roles.${value}`)})));

const validation = computed(() => ({
  firstName: !form.firstName.trim(),
  lastName: !form.lastName.trim(),
  email: !isValidEmail(form.email),
  password: !isValidPassword(form.password),
  confirmPassword: form.password !== form.confirmPassword,
  phone: !isValidPhone(form.phone),
  acceptTerms: !form.acceptTerms
}));

/**
 * @param {string} field - Field name.
 * @returns {boolean} True when the field is invalid after the first submit.
 */
const invalid = (field) => submitted.value && validation.value[field];

/**
 * Executes the sign-up use case (US01). A duplicated email or invalid data never creates another account.
 */
async function performSignUp() {
  submitted.value = true;
  serverError.value = '';
  if (Object.values(validation.value).some(Boolean)) return;
  loading.value = true;
  const ok = await iamStore.signUp(new SignUpCommand({...form, preferredLanguage: locale.value}));
  loading.value = false;
  if (!ok) {
    serverError.value = errorMessage(iamStore.errors[0]?.code || 'network');
    return;
  }
  toast.add({severity: 'success', summary: t('iam.sign-up.success-title'), detail: t('iam.sign-up.success-detail'), life: 6000});
  await router.push({name: 'iam-sign-in', query: {segment: form.userType}});
}
</script>

<template>
  <section class="auth-card agf-card">
    <span class="agf-eyebrow">{{ t(`iam.segments.${form.userType}.eyebrow`) }}</span>
    <h1 class="mb-1">{{ t('iam.sign-up.title') }}</h1>
    <p class="agf-muted mt-0 mb-4">{{ t('iam.sign-up.description') }}</p>

    <pv-message class="mb-3" icon="pi pi-info-circle" severity="warn">{{ t('iam.sign-up.demo-notice') }}</pv-message>

    <pv-message v-if="serverError" class="mb-3" icon="pi pi-exclamation-triangle" role="alert" severity="error">{{ serverError }}</pv-message>

    <form novalidate @submit.prevent="performSignUp">
      <div class="agf-field">
        <span id="user-type-label" class="font-medium agf-small">{{ t('iam.fields.user-type') }}</span>
        <pv-select-button v-model="form.userType" :allow-empty="false" :options="roleOptions" aria-labelledby="user-type-label"
                          option-label="label" option-value="value"/>
        <small class="agf-caption">{{ t(`iam.roles.${form.userType}-hint`) }}</small>
      </div>
      <div class="agf-form-grid">
        <div class="agf-field">
          <label for="firstName">{{ t('iam.fields.first-name') }}</label>
          <pv-input-text id="firstName" v-model="form.firstName" autocomplete="given-name" fluid :invalid="invalid('firstName')"/>
          <small v-if="invalid('firstName')" class="agf-error-text">{{ t('validation.required') }}</small>
        </div>
        <div class="agf-field">
          <label for="lastName">{{ t('iam.fields.last-name') }}</label>
          <pv-input-text id="lastName" v-model="form.lastName" autocomplete="family-name" fluid :invalid="invalid('lastName')"/>
          <small v-if="invalid('lastName')" class="agf-error-text">{{ t('validation.required') }}</small>
        </div>
        <div class="agf-field agf-span-2">
          <label for="email">{{ t('iam.fields.email') }}</label>
          <pv-input-text id="email" v-model="form.email" autocomplete="email" fluid :invalid="invalid('email')" type="email"/>
          <small v-if="invalid('email')" class="agf-error-text">{{ t('validation.email') }}</small>
        </div>
        <div class="agf-field">
          <label for="password">{{ t('iam.fields.password') }}</label>
          <pv-password v-model="form.password" :invalid="invalid('password')" :prompt-label="t('iam.password.prompt')"
                       :weak-label="t('iam.password.weak')" :medium-label="t('iam.password.medium')"
                       :strong-label="t('iam.password.strong')" fluid input-id="password"
                       :input-props="{autocomplete: 'new-password'}" toggle-mask/>
          <small :class="invalid('password') ? 'agf-error-text' : 'agf-caption'">{{ t('validation.password', {min: PASSWORD_MIN_LENGTH}) }}</small>
        </div>
        <div class="agf-field">
          <label for="confirmPassword">{{ t('iam.fields.confirm-password') }}</label>
          <pv-password v-model="form.confirmPassword" :feedback="false" :invalid="invalid('confirmPassword')" fluid
                       input-id="confirmPassword" :input-props="{autocomplete: 'new-password'}" toggle-mask/>
          <small v-if="invalid('confirmPassword')" class="agf-error-text">{{ t('validation.passwords-match') }}</small>
        </div>
        <div class="agf-field">
          <label for="phone">{{ t('iam.fields.phone') }} <span class="agf-caption">({{ t('common.optional') }})</span></label>
          <pv-input-text id="phone" v-model="form.phone" autocomplete="tel" fluid inputmode="numeric" :invalid="invalid('phone')" maxlength="9"/>
          <small v-if="invalid('phone')" class="agf-error-text">{{ t('validation.phone') }}</small>
        </div>
        <div class="agf-field">
          <label for="companyName">{{ t('iam.fields.company') }} <span class="agf-caption">({{ t('common.optional') }})</span></label>
          <pv-input-text id="companyName" v-model="form.companyName" autocomplete="organization" fluid/>
        </div>
      </div>
      <div class="flex align-items-center gap-2 mb-3">
        <pv-checkbox v-model="form.acceptTerms" :invalid="invalid('acceptTerms')" binary input-id="acceptTerms"/>
        <label class="agf-small" for="acceptTerms">
          {{ t('iam.sign-up.accept-terms') }} <router-link target="_blank" to="/terms">{{ t('footer.terms') }}</router-link>
        </label>
      </div>
      <small v-if="invalid('acceptTerms')" class="agf-error-text block mb-3">{{ t('validation.accept-terms') }}</small>
      <pv-button :label="t('iam.sign-up.submit')" :loading="loading" class="w-full mb-3" icon="pi pi-user-plus" type="submit"/>
    </form>
    <p class="agf-small m-0">
      {{ t('iam.sign-up.has-account') }}
      <router-link :to="{name: 'iam-sign-in', query: {segment: form.userType}}">{{ t('iam.sign-in.action') }}</router-link>
    </p>
  </section>
</template>

<style scoped>
.auth-card {
  max-width: 640px;
  margin: 0 auto;
}

.agf-error-text {
  color: var(--agf-error);
  font-size: 0.75rem;
}
</style>
