<script setup>
import {computed, reactive, ref} from "vue";
import {useI18n} from "vue-i18n";
import {useToast} from "primevue";
import useIamStore from "../../application/iam.store.js";
import {UpdateProfileCommand} from "../../domain/model/update-profile.command.js";
import {ChangePasswordCommand} from "../../domain/model/change-password.command.js";
import {isValidPassword, isValidPhone, PASSWORD_MIN_LENGTH} from "../../domain/model/password-policy.js";
import {SUPPORTED_LOCALES} from "../../../i18n.js";
import PageHeader from "../../../shared/presentation/components/page-header.vue";
import {useErrorMessage} from "../../../shared/presentation/composables/use-error-message.js";
import {useSignOut} from "../composables/use-sign-out.js";

const {t} = useI18n();
const toast = useToast();
const iamStore = useIamStore();
const {errorMessage} = useErrorMessage();
const {signOut} = useSignOut();

const user = iamStore.currentUser;
const profile = reactive({
  firstName: user.firstName,
  lastName: user.lastName,
  phone: user.phone || '',
  companyName: user.companyName || '',
  preferredLanguage: user.preferredLanguage || 'en'
});
const passwords = reactive({currentPassword: '', newPassword: '', confirmPassword: ''});
const profileSubmitted = ref(false);
const passwordSubmitted = ref(false);
const savingProfile = ref(false);
const savingPassword = ref(false);
const passwordError = ref('');

const languageOptions = computed(() => SUPPORTED_LOCALES.map(code => ({code, label: t(`language.${code}`)})));

const profileValidation = computed(() => ({
  firstName: !profile.firstName.trim(),
  lastName: !profile.lastName.trim(),
  phone: !isValidPhone(profile.phone)
}));
const passwordValidation = computed(() => ({
  currentPassword: !passwords.currentPassword,
  newPassword: !isValidPassword(passwords.newPassword),
  confirmPassword: passwords.newPassword !== passwords.confirmPassword
}));

/**
 * Saves editable profile data and the language preference (US21, US23).
 * Role and email are read-only in this flow.
 */
async function saveProfile() {
  profileSubmitted.value = true;
  if (Object.values(profileValidation.value).some(Boolean)) return;
  savingProfile.value = true;
  const ok = await iamStore.updateProfile(new UpdateProfileCommand(profile));
  savingProfile.value = false;
  toast.add(ok
      ? {severity: 'success', summary: t('iam.profile.saved'), life: 4000}
      : {severity: 'error', summary: t('errors.network'), life: 6000});
}

/**
 * Changes the password (US22). With an incorrect current password the previous one is kept.
 * After a successful change the session is closed and the user signs in again.
 */
async function savePassword() {
  passwordSubmitted.value = true;
  passwordError.value = '';
  if (Object.values(passwordValidation.value).some(Boolean)) return;
  savingPassword.value = true;
  const ok = await iamStore.changePassword(new ChangePasswordCommand(passwords));
  savingPassword.value = false;
  if (!ok) {
    passwordError.value = errorMessage(iamStore.errors[0]?.code || 'network');
    return;
  }
  toast.add({severity: 'success', summary: t('iam.password.changed'), detail: t('iam.password.changed-detail'), life: 6000});
  await signOut();
}
</script>

<template>
  <section class="settings">
    <page-header :description="t('iam.profile.description')" :eyebrow="t('navigation.settings')" :title="t('iam.profile.title')"/>
    <div class="grid">
      <div class="col-12 lg:col-7">
        <form class="agf-card" novalidate @submit.prevent="saveProfile">
          <h2 class="mb-3">{{ t('iam.profile.data-title') }}</h2>
          <div class="agf-form-grid">
            <div class="agf-field">
              <label for="firstName">{{ t('iam.fields.first-name') }}</label>
              <pv-input-text id="firstName" v-model="profile.firstName" fluid :invalid="profileSubmitted && profileValidation.firstName"/>
              <small v-if="profileSubmitted && profileValidation.firstName" class="agf-error-text">{{ t('validation.required') }}</small>
            </div>
            <div class="agf-field">
              <label for="lastName">{{ t('iam.fields.last-name') }}</label>
              <pv-input-text id="lastName" v-model="profile.lastName" fluid :invalid="profileSubmitted && profileValidation.lastName"/>
              <small v-if="profileSubmitted && profileValidation.lastName" class="agf-error-text">{{ t('validation.required') }}</small>
            </div>
            <div class="agf-field">
              <label for="email">{{ t('iam.fields.email') }}</label>
              <pv-input-text id="email" :model-value="user.email" disabled fluid/>
            </div>
            <div class="agf-field">
              <label for="role">{{ t('iam.fields.user-type') }}</label>
              <pv-input-text id="role" :model-value="t(`iam.roles.${user.userType}`)" disabled fluid/>
            </div>
            <div class="agf-field">
              <label for="phone">{{ t('iam.fields.phone') }}</label>
              <pv-input-text id="phone" v-model="profile.phone" fluid inputmode="numeric" :invalid="profileSubmitted && profileValidation.phone" maxlength="9"/>
              <small v-if="profileSubmitted && profileValidation.phone" class="agf-error-text">{{ t('validation.phone') }}</small>
            </div>
            <div class="agf-field">
              <label for="companyName">{{ t('iam.fields.company') }}</label>
              <pv-input-text id="companyName" v-model="profile.companyName" fluid/>
            </div>
            <div class="agf-field agf-span-2">
              <label id="language-label" for="language">{{ t('iam.fields.preferred-language') }}</label>
              <pv-select v-model="profile.preferredLanguage" input-id="language" aria-labelledby="language-label" :options="languageOptions" fluid
                         option-label="label" option-value="code"/>
              <small class="agf-caption">{{ t('iam.profile.language-hint') }}</small>
            </div>
          </div>
          <p class="agf-caption mt-0">{{ t('iam.profile.readonly-hint') }}</p>
          <pv-button :label="t('common.save-changes')" :loading="savingProfile" icon="pi pi-save" type="submit"/>
        </form>
      </div>
      <div class="col-12 lg:col-5">
        <form class="agf-card" novalidate @submit.prevent="savePassword">
          <h2 class="mb-3">{{ t('iam.password.title') }}</h2>
          <pv-message v-if="passwordError" class="mb-3" role="alert" severity="error">{{ passwordError }}</pv-message>
          <div class="agf-field">
            <label for="currentPassword">{{ t('iam.fields.current-password') }}</label>
            <pv-password v-model="passwords.currentPassword" :feedback="false" fluid input-id="currentPassword"
                         :invalid="passwordSubmitted && passwordValidation.currentPassword" toggle-mask/>
            <small v-if="passwordSubmitted && passwordValidation.currentPassword" class="agf-error-text">{{ t('validation.required') }}</small>
          </div>
          <div class="agf-field">
            <label for="newPassword">{{ t('iam.fields.new-password') }}</label>
            <pv-password v-model="passwords.newPassword" :prompt-label="t('iam.password.prompt')" :weak-label="t('iam.password.weak')"
                         :medium-label="t('iam.password.medium')" :strong-label="t('iam.password.strong')" fluid
                         input-id="newPassword" :invalid="passwordSubmitted && passwordValidation.newPassword" toggle-mask/>
            <small :class="passwordSubmitted && passwordValidation.newPassword ? 'agf-error-text' : 'agf-caption'">
              {{ t('validation.password', {min: PASSWORD_MIN_LENGTH}) }}
            </small>
          </div>
          <div class="agf-field">
            <label for="confirmNewPassword">{{ t('iam.fields.confirm-password') }}</label>
            <pv-password v-model="passwords.confirmPassword" :feedback="false" fluid input-id="confirmNewPassword"
                         :invalid="passwordSubmitted && passwordValidation.confirmPassword" toggle-mask/>
            <small v-if="passwordSubmitted && passwordValidation.confirmPassword" class="agf-error-text">{{ t('validation.passwords-match') }}</small>
          </div>
          <p class="agf-caption mt-0">{{ t('iam.password.policy') }}</p>
          <pv-button :label="t('iam.password.submit')" :loading="savingPassword" icon="pi pi-lock" severity="secondary" type="submit"/>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped>
.settings {
  max-width: 1200px;
}
</style>
