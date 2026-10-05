<script setup>
/**
 * AgroFlet imagotype: the name is split chromatically ("Agro" green, "Flet" navy).
 */
defineProps({
  compact: {type: Boolean, default: false}
});
</script>

<template>
  <span class="brand">
    <img alt="" aria-hidden="true" class="brand__icon" src="/agroflet-logo.svg"/>
    <span v-if="!compact" class="brand__name"><span class="brand__agro">Agro</span><span class="brand__flet">Flet</span></span>
  </span>
</template>

<style scoped>
.brand {
  display: inline-flex;
  align-items: center;
  gap: var(--agf-space-2);
}

.brand__icon {
  width: 32px;
  height: 32px;
}

.brand__name {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.brand__agro {
  color: var(--agf-primary-green);
}

.brand__flet {
  color: var(--agf-navy);
}
</style>
