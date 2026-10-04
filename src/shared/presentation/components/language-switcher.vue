<script setup>
import {computed} from "vue";
import {useI18n} from "vue-i18n";
import {setLocale, SUPPORTED_LOCALES} from "../../../i18n.js";
import useIamStore from "../../../iam/application/iam.store.js";

const {locale, t} = useI18n();
const iamStore = useIamStore();

const options = SUPPORTED_LOCALES.map(code => ({code, label: code.toUpperCase()}));

const selectedLocale = computed({
  get: () => locale.value,
  set: (value) => {
    if (!value) return;
    setLocale(value);
    iamStore.savePreferredLanguage(value);
  }
});
</script>

<template>
  <pv-select-button
      v-model="selectedLocale"
      :allow-empty="false"
      :aria-label="t('language.change')"
      :options="options"
      option-label="label"
      option-value="code"
      size="small"/>
</template>
