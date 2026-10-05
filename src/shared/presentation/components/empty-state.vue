<script setup>
/**
 * Empty state shown when a query returns no results.
 */
defineProps({
  icon: {type: String, default: 'pi pi-inbox'},
  title: {type: String, required: true},
  description: {type: String, default: ''}
});
</script>

<template>
  <div class="empty-state" role="status">
    <i :class="icon" aria-hidden="true"/>
    <h3>{{ title }}</h3>
    <p v-if="description" class="agf-muted agf-small">{{ description }}</p>
    <div v-if="$slots.default" class="agf-actions">
      <slot/>
    </div>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--agf-space-2);
  padding: var(--agf-space-8) var(--agf-space-4);
}

.empty-state i {
  font-size: 2rem;
  color: var(--agf-primary-green);
}

.empty-state p {
  margin: 0;
  max-width: 48ch;
}
</style>
