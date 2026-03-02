<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  value: number
  precision?: number
  color?: string
  size?: 'sm' | 'md' | 'lg'
}>()

const formatted = computed(() => props.value.toFixed(props.precision ?? 4))
</script>

<template>
  <div class="flex flex-col items-center gap-1">
    <span class="text-xs uppercase tracking-wider text-text-secondary">{{ label }}</span>
    <span
      class="font-mono font-bold tabular-nums"
      :class="{
        'text-lg': size === 'sm',
        'text-2xl': size === 'md' || !size,
        'text-4xl': size === 'lg',
      }"
      :style="color ? { color } : {}"
    >
      {{ formatted }}
    </span>
  </div>
</template>
