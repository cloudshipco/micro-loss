<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <div class="rounded-lg border border-surface-lighter bg-surface-light/50 p-4 text-sm text-text-secondary my-4">
    <strong class="text-text-primary">{{ title }}</strong>
    <div class="mt-1 leading-relaxed">
      <slot />
    </div>
  </div>
</template>
