<script setup>
/**
 * Page heading with eyebrow, title, description and an actions slot.
 */
defineProps({
  eyebrow: {type: String, default: ''},
  title: {type: String, required: true},
  description: {type: String, default: ''}
});
</script>

<template>
  <header class="page-header">
    <div class="page-header__text">
      <span v-if="eyebrow" class="agf-eyebrow">{{ eyebrow }}</span>
      <h1>{{ title }}</h1>
      <p v-if="description" class="page-header__description agf-muted">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="agf-actions">
      <slot name="actions"/>
    </div>
  </header>
</template>

<style scoped>
.page-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--agf-space-4);
  margin-bottom: var(--agf-space-6);
}

.page-header__text {
  display: flex;
  flex-direction: column;
  gap: var(--agf-space-1);
}

.page-header__description {
  margin: 0;
  max-width: 60ch;
}
</style>
