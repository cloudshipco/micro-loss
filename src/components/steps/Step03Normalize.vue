<script setup lang="ts">
import { computed, ref } from 'vue'
import katex from 'katex'
import { createTutorialState, provideTutorialState } from '../../composables/useTutorialState'
import LogitSliders from '../ui/LogitSliders.vue'
import PieChart from '../charts/PieChart.vue'
import FormulaLegend from '../ui/FormulaLegend.vue'
import Callout from '../ui/Callout.vue'

const km = (latex: string) => katex.renderToString(latex, { throwOnError: false, displayMode: false })

const state = createTutorialState()
provideTutorialState(state)
const labels = computed(() => [...state.tokens])

// Track probabilities before and after shift to prove invariance
const shiftAmount = ref(0)

function shiftAllLogits(delta: number) {
  shiftAmount.value += delta
  for (let i = 0; i < state.tokens.length; i++) {
    state.setLogit(i, state.logits.value[i] + delta)
  }
}
</script>

<template>
  <div class="space-y-4">
    <FormulaLegend
      latex="\textcolor{#34d399}{p_i} = e^{\textcolor{#93c5fd}{z_i}} \,/\, \textstyle\sum_j \, e^{\textcolor{#93c5fd}{z_j}}"
      :symbols="[
        { symbol: 'p_i', label: 'probability for token i', color: '#34d399' },
        { symbol: 'z_i', label: 'logit for token i', color: '#93c5fd' },
        { symbol: 'e', label: 'Euler\'s number (≈ 2.718)', color: '#e2e0ea' },
        { symbol: '\\textstyle\\sum_j', label: 'sum over all tokens j', color: '#e2e0ea' },
      ]"
    />
    <LogitSliders />
    <!-- Step-by-step computation -->
    <div class="rounded-lg bg-surface-light p-4">
      <h4 class="mb-3 text-sm font-medium text-text-secondary">Full computation with current values:</h4>
      <div class="space-y-2 font-mono text-sm">
        <div v-for="(token, index) in state.tokens" :key="token" class="flex items-center gap-2">
          <span class="w-10 text-right" :style="{ color: state.tokenColors[index] }">{{ token }}</span>
          <span class="text-text-secondary">:</span>
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

    <!-- Logits → probabilities side by side with doughnut -->
    <div class="grid gap-6 md:grid-cols-2">
      <!-- Logit and probability values -->
      <div class="space-y-2">
        <div class="grid grid-cols-[auto_1fr_1fr] gap-x-4 gap-y-2 text-sm">
          <div />
          <div class="text-xs font-medium text-text-secondary">logit</div>
          <div class="text-xs font-medium text-text-secondary">probability</div>
          <template v-for="(token, index) in state.tokens" :key="token">
            <span class="font-mono font-semibold" :style="{ color: state.tokenColors[index] }">{{ token }}</span>
            <span class="font-mono text-text-secondary">{{ state.logits.value[index] >= 0 ? '+' : '' }}{{ state.logits.value[index].toFixed(2) }}</span>
            <span class="font-mono font-bold" :style="{ color: state.tokenColors[index] }">{{ (state.probabilities.value[index] * 100).toFixed(1) }}%</span>
          </template>
        </div>
      </div>

      <!-- Doughnut chart -->
      <PieChart
        :labels="labels"
        :values="state.probabilities.value"
        :colors="state.tokenColors"
      />
    </div>

    <!-- Translation invariance demo -->
    <div class="rounded-lg bg-surface-light p-4">
      <h4 class="mb-3 text-sm font-medium text-text-secondary">Shift experiment: only relative differences matter</h4>
      <div class="flex flex-wrap items-center gap-3">
        <button
          @click="shiftAllLogits(-5)"
          class="rounded-lg border border-surface-lighter bg-surface px-3 py-1.5 text-sm text-text-secondary transition hover:border-brand hover:text-text-primary"
        >
          All logits &minus;5
        </button>
        <button
          @click="shiftAllLogits(-1)"
          class="rounded-lg border border-surface-lighter bg-surface px-3 py-1.5 text-sm text-text-secondary transition hover:border-brand hover:text-text-primary"
        >
          All logits &minus;1
        </button>
        <button
          @click="shiftAllLogits(+1)"
          class="rounded-lg border border-surface-lighter bg-surface px-3 py-1.5 text-sm text-text-secondary transition hover:border-brand hover:text-text-primary"
        >
          All logits +1
        </button>
        <button
          @click="shiftAllLogits(+5)"
          class="rounded-lg border border-surface-lighter bg-surface px-3 py-1.5 text-sm text-text-secondary transition hover:border-brand hover:text-text-primary"
        >
          All logits +5
        </button>
        <button
          @click="shiftAmount = 0; state.resetLogits()"
          class="rounded-lg border border-surface-lighter bg-surface px-3 py-1.5 text-sm text-text-secondary transition hover:border-brand hover:text-text-primary"
        >
          Reset
        </button>
        <span v-if="shiftAmount !== 0" class="text-sm text-text-secondary">
          (shifted {{ shiftAmount > 0 ? '+' : '' }}{{ shiftAmount.toFixed(0) }} total)
        </span>
      </div>
      <p class="mt-3 text-sm text-text-secondary">
        The probabilities don't change! Shifting all logits by the same amount cancels out in the
        division. This means you can effectively remove a token from consideration by giving it
        an extremely negative logit, because <span v-html="km('e^{\\text{(very negative)}}')"></span> is essentially 0.
      </p>
    </div>

    <!-- Competition insight -->
    <Callout title="Key insight &mdash; softmax enforces competition:">
      The probabilities always sum to exactly 1.0 — check the chart. Every token's probability
      comes at the expense of the others. Try raising just one token's logit &mdash;
      watch how the other tokens' probabilities shrink. Softmax redistributes belief: there's a fixed
      amount of probability to go around, and the tokens are competing for it.
    </Callout>
  </div>
</template>
