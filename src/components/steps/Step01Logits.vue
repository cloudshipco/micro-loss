<script setup lang="ts">
import { computed } from 'vue'
import { useTutorialState } from '../../composables/useTutorialState'
import LogitSliders from '../ui/LogitSliders.vue'
import BarChart from '../charts/BarChart.vue'

const state = useTutorialState()
const labels = computed(() => [...state.tokens])

// Logit difference → probability ratio for the top two tokens
const sortedIndices = computed(() => {
  const indices = state.logits.value.map((_, i) => i)
  indices.sort((a, b) => state.logits.value[b] - state.logits.value[a])
  return indices
})

const topTwoRatio = computed(() => {
  const topLogit = state.logits.value[sortedIndices.value[0]]
  const secondLogit = state.logits.value[sortedIndices.value[1]]
  const diff = topLogit - secondLogit
  return {
    topToken: state.tokens[sortedIndices.value[0]],
    secondToken: state.tokens[sortedIndices.value[1]],
    diff: diff,
    ratio: Math.exp(diff),
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Concrete example callout -->
    <div class="rounded-lg border border-surface-lighter bg-surface-light/50 p-4 text-sm">
      <strong class="text-brand-light">Running example:</strong>
      <span class="text-text-secondary">
        The model produced scores for <em>"On the mat sat a ___"</em>:
      </span>
      <span
        v-for="(token, index) in state.tokens"
        :key="token"
        class="ml-2 font-mono"
        :style="{ color: state.tokenColors[index] }"
      >
        {{ token }}&nbsp;→&nbsp;{{ state.logits.value[index].toFixed(1) }}<span v-if="index < state.tokens.length - 1" class="text-text-secondary">,</span>
      </span>
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <div>
        <h3 class="mb-3 text-sm font-medium text-text-secondary">Adjust logits</h3>
        <LogitSliders />
      </div>
      <div>
        <BarChart
          :labels="labels"
          :values="state.logits.value"
          :colors="state.tokenColors"
          title="Raw Logits"
          :precision="1"
          y-axis-label="logit value"
        />
      </div>
    </div>

    <!-- Logit difference → probability ratio -->
    <div class="rounded-lg bg-surface-light p-4 text-sm">
      <strong class="text-text-primary">Logit difference → probability ratio:</strong>
      <p class="mt-2 text-text-secondary">
        <span class="font-mono" :style="{ color: state.tokenColors[sortedIndices[0]] }">{{ topTwoRatio.topToken }}</span>
        has a logit
        <span class="font-mono text-brand-light">{{ topTwoRatio.diff.toFixed(1) }}</span>
        higher than
        <span class="font-mono" :style="{ color: state.tokenColors[sortedIndices[1]] }">{{ topTwoRatio.secondToken }}</span>.
        After exponentiation, that means
        <span class="font-mono" :style="{ color: state.tokenColors[sortedIndices[0]] }">{{ topTwoRatio.topToken }}</span>
        will be
        <strong class="text-text-primary">e<sup>{{ topTwoRatio.diff.toFixed(1) }}</sup> &asymp; {{ topTwoRatio.ratio.toFixed(1) }}&times;</strong>
        more probable. Logit differences map to multiplicative probability ratios.
      </p>
    </div>

    <!-- Try it callout -->
    <div class="rounded-lg border border-brand/30 bg-brand/5 p-4 text-sm text-text-secondary">
      <strong class="text-brand-light">Try it:</strong>
      Drag "cat"'s logit down below "dog"'s and watch the ratio flip. Then try setting
      all four logits to the same value &mdash; the ratio becomes 1.0&times; (equally likely).
      You can also drag logits into negative territory &mdash; that's valid too. Only
      the <em>differences</em> between logits matter, not whether they're positive or negative.
    </div>
  </div>
</template>
