<script setup lang="ts">
import { useTutorialState } from '../../composables/useTutorialState'

const state = useTutorialState()
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <label class="text-sm font-medium text-text-secondary">Temperature (τ)</label>
      <span class="font-mono text-sm tabular-nums text-brand-light">
        {{ state.temperature.value.toFixed(2) }}
      </span>
    </div>
    <input
      type="range"
      :min="0.1"
      :max="5"
      :step="0.05"
      v-model.number="state.temperature.value"
      class="h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-lighter accent-brand"
    />
    <div class="flex justify-between text-xs text-text-secondary">
      <span>Sharp (0.1)</span>
      <span>Normal (1.0)</span>
      <span>Flat (5.0)</span>
    </div>
  </div>
</template>
