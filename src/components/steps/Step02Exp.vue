<script setup lang="ts">
import { computed } from 'vue'
import { useTutorialState } from '../../composables/useTutorialState'
import BarChart from '../charts/BarChart.vue'
import MathBlock from '../ui/MathBlock.vue'

const state = useTutorialState()
const labels = computed(() => [...state.tokens])
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap gap-4">
      <div
        v-for="(token, index) in state.tokens"
        :key="token"
        class="rounded-lg bg-surface-light px-4 py-2"
      >
        <div class="text-xs text-text-secondary">e<sup>{{ state.logits.value[index].toFixed(1) }}</sup></div>
        <div class="font-mono text-lg font-bold" :style="{ color: state.tokenColors[index] }">
          {{ state.expValues.value[index].toFixed(2) }}
        </div>
      </div>
    </div>
    <BarChart
      :labels="labels"
      :values="state.expValues.value"
      :colors="state.tokenColors"
      title="Exponentiated Values"
      :precision="2"
      y-axis-label="e^z"
    />
    <MathBlock size="sm">
      <span class="text-text-secondary">Σ e<sup>z<sub>j</sub></sup> = </span>
      <span class="text-brand-light">{{ state.softmaxResult.value.sumExp.toFixed(2) }}</span>
    </MathBlock>

    <!-- Try it callout -->
    <div class="rounded-lg border border-brand/30 bg-brand/5 p-4 text-sm text-text-secondary">
      <strong class="text-brand-light">Try it:</strong>
      Go back and set two logits to 1.0 and 2.0 (a difference of just 1). After exponentiation
      they become e<sup>1</sup> ≈ 2.72 and e<sup>2</sup> ≈ 7.39 — a gap of nearly 3x.
      Now try 2.0 and 4.0 (still a difference of 2): e<sup>2</sup> ≈ 7.39 vs e<sup>4</sup> ≈ 54.60 — a 7x gap.
      Small logit differences become <em>huge</em> after exponentiation.
    </div>
  </div>
</template>
