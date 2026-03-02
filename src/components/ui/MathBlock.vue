<script setup lang="ts">
defineProps<{
  formula?: string
  size?: 'sm' | 'md' | 'lg'
}>()
</script>

<template>
  <div
    class="inline-block rounded-lg bg-surface-light px-4 py-2 font-mono tracking-wide"
    :class="{
      'text-sm': size === 'sm',
      'text-lg': size === 'md' || !size,
      'text-2xl': size === 'lg',
    }"
  >
    <slot>{{ formula }}</slot>
  </div>
</template>
