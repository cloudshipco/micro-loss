<script setup lang="ts">
import { computed } from 'vue'
import katex from 'katex'
import { createTutorialState, provideTutorialState } from '../../composables/useTutorialState'
import LogitSliders from '../ui/LogitSliders.vue'

const km = (latex: string) => katex.renderToString(latex, { throwOnError: false, displayMode: false })

const state = createTutorialState()
provideTutorialState(state)

// All pairwise comparisons sorted by logit value (highest first)
const sortedIndices = computed(() => {
  const indices = state.logits.value.map((_, i) => i)
  indices.sort((a, b) => state.logits.value[b] - state.logits.value[a])
  return indices
})

// Top two tokens comparison
const topTwoRatio = computed(() => {
  const topIdx = sortedIndices.value[0]
  const secondIdx = sortedIndices.value[1]
  const topLogit = state.logits.value[topIdx]
  const secondLogit = state.logits.value[secondIdx]
  const diff = topLogit - secondLogit
  return {
    topToken: state.tokens[topIdx],
    topColor: state.tokenColors[topIdx],
    topLogit,
    secondToken: state.tokens[secondIdx],
    secondColor: state.tokenColors[secondIdx],
    secondLogit,
    diff,
    ratio: Math.exp(diff),
  }
})

// Sorted tokens with their logits for the ranking view
const rankedTokens = computed(() =>
  sortedIndices.value.map(i => ({
    token: state.tokens[i],
    color: state.tokenColors[i],
    logit: state.logits.value[i],
  }))
)
</script>

<template>
  <div class="space-y-6">
    <!-- Concrete example callout -->
    <div class="rounded-lg border border-surface-lighter bg-surface-light/50 p-4 text-sm">
      <strong class="text-brand-light">Running example:</strong>
      <span class="text-text-secondary">
        The model produced scores for <em>"the cat ate ___"</em>:
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

      <!-- Ranking + difference visualisation -->
      <div class="rounded-lg bg-surface-light p-4">
        <h3 class="mb-3 text-sm font-medium text-text-secondary">Ranking (highest → lowest)</h3>
        <div class="space-y-2">
          <div
            v-for="(t, rank) in rankedTokens"
            :key="t.token"
            class="flex items-center gap-3"
          >
            <span class="w-5 text-right text-xs text-text-secondary">{{ rank + 1 }}.</span>
            <span class="w-10 font-mono text-sm font-semibold" :style="{ color: t.color }">{{ t.token }}</span>
            <!-- Relative bar: width based on position in min–max range -->
            <div class="flex-1">
              <div
                class="h-5 rounded-r transition-all duration-200"
                :style="{
                  backgroundColor: t.color + '40',
                  borderLeft: `3px solid ${t.color}`,
                  width: rankedTokens.length > 1
                    ? Math.max(8, ((t.logit - rankedTokens[rankedTokens.length - 1].logit) / Math.max(0.01, rankedTokens[0].logit - rankedTokens[rankedTokens.length - 1].logit)) * 100) + '%'
                    : '100%',
                }"
              />
            </div>
            <span class="w-12 text-right font-mono text-xs text-text-secondary">{{ t.logit >= 0 ? '+' : '' }}{{ t.logit.toFixed(1) }}</span>
          </div>
        </div>

        <!-- Difference annotation -->
        <div class="mt-4 rounded-lg border border-surface-lighter bg-surface p-3">
          <div class="flex items-center gap-2 text-sm">
            <span class="font-mono font-semibold" :style="{ color: topTwoRatio.topColor }">{{ topTwoRatio.topToken }}</span>
            <span class="text-text-secondary">−</span>
            <span class="font-mono font-semibold" :style="{ color: topTwoRatio.secondColor }">{{ topTwoRatio.secondToken }}</span>
            <span class="text-text-secondary">=</span>
            <span class="font-mono font-semibold text-brand-light">{{ topTwoRatio.diff.toFixed(2) }}</span>
          </div>
          <div class="mt-1 text-xs text-text-secondary">
            Difference of <span class="font-mono text-brand-light">{{ topTwoRatio.diff.toFixed(2) }}</span>
            → ratio of <strong class="text-text-primary"><span v-html="km(`e^{${topTwoRatio.diff.toFixed(2)}} \\approx ${topTwoRatio.ratio.toFixed(2)}`)"></span>×</strong>
          </div>
        </div>
      </div>
    </div>

    <!-- Try it callout -->
    <div class="rounded-lg border border-brand/30 bg-brand/5 p-4 text-sm text-text-secondary">
      <strong class="text-brand-light">Try it:</strong>
      Drag "fish"'s logit down below "ate"'s and watch the ratio flip. Then try setting
      all four logits to the same value &mdash; the ratio becomes 1.0&times; (equally likely).
      You can also drag logits into negative territory &mdash; that's valid too. Only
      the <em>differences</em> between logits matter, not whether they're positive or negative.
    </div>
  </div>
</template>
