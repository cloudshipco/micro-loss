<script setup lang="ts">
import { computed } from 'vue'
import { useTutorialState } from '../../composables/useTutorialState'
import BarChart from '../charts/BarChart.vue'
import MathBlock from '../ui/MathBlock.vue'

const state = useTutorialState()
const labels = computed(() => [...state.tokens])

// Compute the pairwise ratios for the top two tokens to show logit-diff → ratio
const sortedIndices = computed(() => {
  const indices = state.logits.value.map((_, i) => i)
  indices.sort((a, b) => state.logits.value[b] - state.logits.value[a])
  return indices
})

const ratioInsight = computed(() => {
  const i = sortedIndices.value[0]
  const j = sortedIndices.value[1]
  return {
    topToken: state.tokens[i],
    topColor: state.tokenColors[i],
    secondToken: state.tokens[j],
    secondColor: state.tokenColors[j],
    topExp: state.expValues.value[i],
    secondExp: state.expValues.value[j],
    ratio: state.expValues.value[i] / state.expValues.value[j],
    logitDiff: state.logits.value[i] - state.logits.value[j],
  }
})
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
      <span class="text-text-secondary">&Sigma; e<sup>z<sub>j</sub></sup> = </span>
      <span class="text-brand-light">{{ state.softmaxResult.value.sumExp.toFixed(2) }}</span>
    </MathBlock>

    <!-- Logit difference → probability ratio (live) -->
    <div class="rounded-lg bg-surface-light p-4 text-sm">
      <strong class="text-text-primary">Logit difference &rarr; probability ratio:</strong>
      <p class="mt-2 text-text-secondary">
        <span class="font-mono" :style="{ color: ratioInsight.topColor }">{{ ratioInsight.topToken }}</span>
        (e<sup>z</sup> = {{ ratioInsight.topExp.toFixed(2) }})
        divided by
        <span class="font-mono" :style="{ color: ratioInsight.secondColor }">{{ ratioInsight.secondToken }}</span>
        (e<sup>z</sup> = {{ ratioInsight.secondExp.toFixed(2) }})
        =
        <strong class="text-text-primary">{{ ratioInsight.ratio.toFixed(1) }}&times;</strong>.
        This is exactly e<sup>{{ ratioInsight.logitDiff.toFixed(1) }}</sup> &asymp; {{ Math.exp(ratioInsight.logitDiff).toFixed(1) }}&times;
        &mdash; the ratio depends only on the logit <em>difference</em>, not the absolute values.
      </p>
    </div>

    <!-- Try it callout -->
    <div class="rounded-lg border border-brand/30 bg-brand/5 p-4 text-sm text-text-secondary">
      <strong class="text-brand-light">Try it:</strong>
      Go back and set two logits to 1.0 and 2.0 (a difference of just 1). After exponentiation
      they become e<sup>1</sup> &asymp; 2.72 and e<sup>2</sup> &asymp; 7.39 &mdash; a ratio of ~2.7&times;.
      Now try 2.0 and 4.0 (difference of 2): e<sup>2</sup> &asymp; 7.39 vs e<sup>4</sup> &asymp; 54.60 &mdash; ~7.4&times;.
      Small logit differences become <em>huge</em> after exponentiation. This amplification is a feature,
      not a bug &mdash; it lets the network express strong preferences.
    </div>
  </div>
</template>
