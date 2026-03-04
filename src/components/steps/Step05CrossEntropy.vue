<script setup lang="ts">
import { computed } from 'vue'
import { createTutorialState, provideTutorialState } from '../../composables/useTutorialState'
import LossCurve from '../charts/LossCurve.vue'
import PieChart from '../charts/PieChart.vue'
import LogitSliders from '../ui/LogitSliders.vue'

const labels = computed(() => [...state.tokens])

const state = createTutorialState()
provideTutorialState(state)

const targetProb = computed(() => state.probabilities.value[state.targetIndex.value])
const targetToken = computed(() => state.tokens[state.targetIndex.value])
</script>

<template>
  <div class="space-y-5">
    <!-- Logit sliders + probability doughnut -->
    <div class="grid gap-6 md:grid-cols-2">
      <div>
        <h4 class="mb-3 text-sm font-medium text-text-secondary">Adjust logits</h4>
        <LogitSliders />
      </div>
      <div>
        <h4 class="mb-3 text-sm font-medium text-text-secondary">Probabilities (via softmax)</h4>
        <PieChart
          :labels="labels"
          :values="state.probabilities.value"
          :colors="state.tokenColors"
        />
      </div>
    </div>

    <!-- Calculation: formula + live values -->
    <div class="rounded-lg bg-surface-light p-4">
      <p class="mb-2 text-xs text-text-secondary">
        The correct token is <strong :style="{ color: state.tokenColors[state.targetIndex.value] }">{{ targetToken }}</strong> —
        the loss penalises the model for how far its prediction falls short of 100% confidence:
      </p>
      <div class="font-mono text-lg">
        <span class="text-text-primary font-semibold">Loss</span>
        <span class="text-text-secondary"> = −log(p</span><sub class="text-text-secondary" :style="{ color: state.tokenColors[state.targetIndex.value] }">{{ targetToken }}</sub><span class="text-text-secondary">)</span>
        <span class="text-text-secondary"> = −log(</span>
        <span class="text-brand-light">{{ targetProb.toFixed(4) }}</span>
        <span class="text-text-secondary">) = </span>
        <span
          class="text-2xl font-bold"
          :style="{ color: state.loss.value > 2 ? '#f87171' : state.loss.value > 0.5 ? '#fbbf24' : '#34d399' }"
        >{{ state.loss.value.toFixed(4) }}</span>
      </div>
    </div>

    <!-- Loss curve -->
    <LossCurve
      :current-probability="targetProb"
      :current-loss="state.loss.value"
    />

    <p class="text-sm text-text-secondary">
      The yellow dot shows where the model currently sits on the curve. Drag the logit sliders
      to watch it move — notice how steeply the loss rises as the probability drops toward zero.
    </p>
  </div>
</template>
