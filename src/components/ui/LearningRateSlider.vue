<script setup lang="ts">
import { useTutorialState } from '../../composables/useTutorialState'

const state = useTutorialState()
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <label class="text-sm font-medium text-text-secondary">Learning Rate (η)</label>
      <span class="font-mono text-sm tabular-nums text-brand-light">
        {{ state.learningRate.value.toFixed(2) }}
      </span>
    </div>
    <input
      type="range"
      :min="0.01"
      :max="2"
      :step="0.01"
      v-model.number="state.learningRate.value"
      class="h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-lighter accent-brand"
    />
  </div>
</template>
