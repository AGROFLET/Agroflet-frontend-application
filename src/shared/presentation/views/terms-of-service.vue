<script setup>
import {useI18n} from "vue-i18n";
import PageHeader from "../components/page-header.vue";

const {t, tm, rt} = useI18n();
</script>

<template>
  <section class="terms">
    <page-header :description="t('terms.description')" :eyebrow="t('terms.eyebrow')" :title="t('terms.title')"/>
    <pv-message class="mb-4" icon="pi pi-info-circle" severity="warn">{{ t('terms.simulation-notice') }}</pv-message>
    <article v-for="(section, index) in tm('terms.sections')" :key="index" class="agf-card mb-3">
      <h2 class="mb-2">{{ rt(section.title) }}</h2>
      <p class="m-0 agf-muted">{{ rt(section.content) }}</p>
    </article>
    <p class="agf-small">{{ t('terms.contact') }} <a href="mailto:info@agroflet.pe">info@agroflet.pe</a></p>
  </section>
</template>

<style scoped>
.terms {
  max-width: 860px;
  margin: 0 auto;
}
</style>
