<script setup lang="ts">
import { useTutorialState } from '../../composables/useTutorialState'

const state = useTutorialState()

function formatLogit(value: number): string {
  return value >= 0 ? `+${value.toFixed(1)}` : value.toFixed(1)
}
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="(token, index) in state.tokens"
      :key="token"
      class="flex items-center gap-4"
    >
      <span
        class="w-12 text-right text-sm font-semibold"
        :style="{ color: state.tokenColors[index] }"
      >
        {{ token }}
      </span>
      <input
        type="range"
        :min="-5"
        :max="5"
        :step="0.1"
        :value="state.logits.value[index]"
        @input="state.setLogit(index, parseFloat(($event.target as HTMLInputElement).value))"
        class="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-surface-lighter accent-brand"
      />
      <span class="w-14 text-right font-mono text-sm tabular-nums text-text-secondary">
        {{ formatLogit(state.logits.value[index]) }}
      </span>
    </div>
  </div>
</template>
