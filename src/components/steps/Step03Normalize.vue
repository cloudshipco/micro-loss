<script setup lang="ts">
import { computed, ref } from 'vue'
import { createTutorialState, provideTutorialState } from '../../composables/useTutorialState'
import BarChart from '../charts/BarChart.vue'
import PieChart from '../charts/PieChart.vue'

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
        :y-min="0"
        :y-max="1"
      />
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
        division. This is why masking in attention works: setting a logit to <strong>&minus;&infin;</strong>
        effectively removes that token from consideration, because e<sup>&minus;&infin;</sup> = 0.
      </p>
    </div>

    <!-- Competition insight -->
    <div class="rounded-lg border border-surface-lighter bg-surface-light/50 p-4 text-sm text-text-secondary">
      <strong class="text-text-primary">Key insight &mdash; softmax enforces competition:</strong>
      The probabilities always sum to exactly 1.0 — check the pie chart. Every token's probability
      comes at the expense of the others. Go back to Step 6 and raise just "cat"'s logit &mdash;
      watch how the other tokens' probabilities shrink. Softmax redistributes belief: there's a fixed
      amount of probability to go around, and the tokens are competing for it.
    </div>
  </div>
</template>
