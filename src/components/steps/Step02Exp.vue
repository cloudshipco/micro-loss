<script setup lang="ts">
import { computed } from 'vue'
import katex from 'katex'
import { createTutorialState, provideTutorialState } from '../../composables/useTutorialState'
import BarChart from '../charts/BarChart.vue'
import LogitSliders from '../ui/LogitSliders.vue'
import FormulaLegend from '../ui/FormulaLegend.vue'
import MathBlock from '../ui/MathBlock.vue'
import Callout from '../ui/Callout.vue'

const km = (latex: string) => katex.renderToString(latex, { throwOnError: false, displayMode: false })

const state = createTutorialState()
provideTutorialState(state)
const labels = computed(() => [...state.tokens])

const sumExpLatex = computed(() =>
  `\\sum e^{z_j} = \\color{#6366f1}{${state.softmaxResult.value.sumExp.toFixed(2)}}`
)

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
    <FormulaLegend
      latex="e^{\textcolor{#93c5fd}{z_i}}"
      :symbols="[
        { symbol: 'z_i', label: 'logit for token i', color: '#93c5fd' },
      ]"
    />
    <LogitSliders />
    <div class="flex flex-wrap gap-4">
      <div
        v-for="(token, index) in state.tokens"
        :key="token"
        class="rounded-lg bg-surface-light px-4 py-2"
      >
        <div class="text-xs text-text-secondary" v-html="km(`e^{${state.logits.value[index].toFixed(1)}}`)"></div>
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
    <MathBlock :latex="sumExpLatex" size="sm" />

    <!-- Logit difference → probability ratio (live) -->
    <Callout variant="subtle" title="Logit difference &rarr; probability ratio:">
      <p class="mt-2">
        <span class="font-mono" :style="{ color: ratioInsight.topColor }">{{ ratioInsight.topToken }}</span>
        (<span v-html="km(`e^z`)"></span> = {{ ratioInsight.topExp.toFixed(2) }})
        divided by
        <span class="font-mono" :style="{ color: ratioInsight.secondColor }">{{ ratioInsight.secondToken }}</span>
        (<span v-html="km(`e^z`)"></span> = {{ ratioInsight.secondExp.toFixed(2) }})
        =
        <strong class="text-text-primary">{{ ratioInsight.ratio.toFixed(1) }}×</strong>.
        This is exactly <span v-html="km(`e^{${ratioInsight.logitDiff.toFixed(1)}} \\approx ${Math.exp(ratioInsight.logitDiff).toFixed(1)}`)"></span>×
        — the ratio depends only on the logit <em>difference</em>, not the absolute values.
      </p>
    </Callout>

    <!-- Try it callout -->
    <Callout variant="brand" title="Try it:">
      Set two logits to 1.0 and 2.0 (a difference of just 1). After exponentiation
      they become <span v-html="km('e^1 \\approx 2.72')"></span> and <span v-html="km('e^2 \\approx 7.39')"></span> — a ratio of ~2.7×.
      Now try 2.0 and 4.0 (difference of 2): <span v-html="km('e^2 \\approx 7.39')"></span> vs <span v-html="km('e^4 \\approx 54.60')"></span> — ~7.4×.
      Small logit differences become large after exponentiation. This amplification is a feature,
      not a bug — it lets the model express strong preferences.
    </Callout>
  </div>
</template>
