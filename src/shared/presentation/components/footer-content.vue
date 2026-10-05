<script setup>
import {useI18n} from "vue-i18n";

const {t} = useI18n();
const year = new Date().getFullYear();
const landingPageUrl = import.meta.env.VITE_LANDING_PAGE_URL;
</script>

<template>
  <footer class="footer">
    <p class="m-0">© {{ year }} AgroFlet · {{ t('footer.team') }}</p>
    <nav :aria-label="t('footer.navigation')" class="footer__links">
      <router-link to="/terms">{{ t('footer.terms') }}</router-link>
      <router-link to="/about">{{ t('footer.about') }}</router-link>
      <a :href="landingPageUrl" rel="noopener noreferrer" target="_blank">{{ t('footer.landing') }}</a>
      <a href="mailto:info@agroflet.pe">info@agroflet.pe</a>
    </nav>
  </footer>
</template>

<style scoped>
.footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: var(--agf-space-3);
  padding: var(--agf-space-4) var(--agf-space-6);
  border-top: 1px solid var(--agf-border);
  background: var(--agf-white);
  font-size: 0.875rem;
  color: var(--agf-text-muted);
}

.footer__links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--agf-space-4);
}

.footer__links a {
  color: var(--agf-navy);
  text-decoration: none;
}

.footer__links a:hover {
  text-decoration: underline;
}
</style>
