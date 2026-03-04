<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'info' | 'brand' | 'positive' | 'subtle'
  title?: string
}>(), { variant: 'info' })
</script>

<template>
  <div class="rounded-lg p-4 text-sm text-text-secondary" :class="{
    'border border-surface-lighter bg-surface-light/50': variant === 'info',
    'border border-brand/30 bg-brand/5': variant === 'brand',
    'border border-positive/30 bg-positive/5': variant === 'positive',
    'bg-surface-light': variant === 'subtle',
  }">
    <strong v-if="title" :class="{
      'text-text-primary': variant === 'info' || variant === 'subtle',
      'text-brand-light': variant === 'brand',
      'text-positive': variant === 'positive',
    }">{{ title }}</strong>
    <slot />
  </div>
</template>
