<script setup>
import {useRoute} from "vue-router";
import {useI18n} from "vue-i18n";
import EmptyState from "../components/empty-state.vue";

const route = useRoute();
const {t} = useI18n();
</script>

<template>
  <section class="agf-card not-found">
    <empty-state
        :description="t('page-not-found.content', {route: route.path})"
        :title="t('page-not-found.title')"
        icon="pi pi-map-marker">
      <pv-button :label="t('page-not-found.go-home')" as="router-link" icon="pi pi-home" to="/dashboard"/>
    </empty-state>
  </section>
</template>

<style scoped>
.not-found {
  max-width: 640px;
  margin: 0 auto;
}
</style>
