<script setup lang="ts">
import { computed } from 'vue'
import { useTutorialState } from '../../composables/useTutorialState'
import BarChart from '../charts/BarChart.vue'
import PieChart from '../charts/PieChart.vue'

const state = useTutorialState()
const labels = computed(() => [...state.tokens])
</script>

<template>
  <div class="space-y-4">
    <!-- Step-by-step computation -->
    <div class="rounded-lg bg-surface-light p-4">
      <h4 class="mb-3 text-sm font-medium text-text-secondary">Full computation with current values:</h4>
      <div class="space-y-2 font-mono text-sm">
        <div v-for="(token, index) in state.tokens" :key="token" class="flex items-center gap-2">
          <span class="w-10 text-right" :style="{ color: state.tokenColors[index] }">{{ token }}</span>
          <span class="text-text-secondary">:</span>
          <span class="text-text-secondary">e<sup>{{ state.logits.value[index].toFixed(1) }}</sup></span>
          <span class="text-text-secondary">/</span>
          <span class="text-text-secondary">{{ state.softmaxResult.value.sumExp.toFixed(2) }}</span>
          <span class="text-text-secondary">=</span>
          <span class="text-text-secondary">{{ state.expValues.value[index].toFixed(2) }}</span>
          <span class="text-text-secondary">/</span>
          <span class="text-text-secondary">{{ state.softmaxResult.value.sumExp.toFixed(2) }}</span>
          <span class="text-text-secondary">=</span>
          <span class="font-bold" :style="{ color: state.tokenColors[index] }">
            {{ (state.probabilities.value[index] * 100).toFixed(1) }}%
          </span>
        </div>
      </div>
    </div>

    <!-- Probability values -->
    <div class="flex flex-wrap gap-4">
      <div
        v-for="(token, index) in state.tokens"
        :key="token"
        class="rounded-lg bg-surface-light px-4 py-2"
      >
        <div class="text-xs text-text-secondary">p({{ token }})</div>
        <div class="font-mono text-lg font-bold" :style="{ color: state.tokenColors[index] }">
          {{ (state.probabilities.value[index] * 100).toFixed(1) }}%
        </div>
      </div>
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <BarChart
        :labels="labels"
        :values="state.probabilities.value"
        :colors="state.tokenColors"
        title="Probabilities"
        :precision="4"
        y-axis-label="probability"
      />
      <PieChart
        :labels="labels"
        :values="state.probabilities.value"
        :colors="state.tokenColors"
      />
    </div>

    <!-- Key insight -->
    <div class="rounded-lg border border-surface-lighter bg-surface-light/50 p-4 text-sm text-text-secondary">
      <strong class="text-text-primary">Key insight:</strong>
      The probabilities always sum to exactly 1.0 — check the pie chart. This means every
      token's probability comes at the expense of the others. If "cat" gains probability,
      the other tokens must collectively lose the same amount. This zero-sum property
      is why training is a balancing act.
    </div>
  </div>
</template>
