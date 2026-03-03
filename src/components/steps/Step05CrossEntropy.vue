<script setup lang="ts">
import { computed } from 'vue'
import { createTutorialState, provideTutorialState } from '../../composables/useTutorialState'
import LossCurve from '../charts/LossCurve.vue'
import ValueDisplay from '../ui/ValueDisplay.vue'

const state = createTutorialState()
provideTutorialState(state)

const targetProb = computed(() => state.probabilities.value[state.targetIndex.value])
const targetToken = computed(() => state.tokens[state.targetIndex.value])

// Reference points for the loss curve
const referencePoints = [
  { prob: 0.9, loss: -Math.log(0.9), label: 'Confident & right' },
  { prob: 0.5, loss: -Math.log(0.5), label: 'Coin flip' },
  { prob: 0.1, loss: -Math.log(0.1), label: 'Mostly wrong' },
  { prob: 0.01, loss: -Math.log(0.01), label: 'Catastrophically wrong' },
]
</script>

<template>
  <div class="space-y-6">
    <!-- Concrete calculation -->
    <div class="rounded-lg bg-surface-light p-4">
      <h4 class="mb-2 text-sm font-medium text-text-secondary">Current calculation:</h4>
      <div class="font-mono text-lg">
        <span class="text-text-secondary">−log(</span>
        <span class="text-brand-light">p(<span :style="{ color: state.tokenColors[state.targetIndex.value] }">{{ targetToken }}</span>)</span>
        <span class="text-text-secondary">) = −log(</span>
        <span class="text-brand-light">{{ targetProb.toFixed(4) }}</span>
        <span class="text-text-secondary">) = </span>
        <span
          class="font-bold"
          :style="{ color: state.loss.value > 2 ? '#f87171' : state.loss.value > 0.5 ? '#fbbf24' : '#34d399' }"
        >{{ state.loss.value.toFixed(4) }}</span>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-8">
      <ValueDisplay
        label="Target probability"
        :value="targetProb"
        :precision="4"
        color="#6366f1"
      />
      <div class="text-3xl text-text-secondary">&rarr;</div>
      <ValueDisplay
        label="Loss  −log(p)"
        :value="state.loss.value"
        :precision="4"
        :color="state.loss.value > 2 ? '#f87171' : state.loss.value > 0.5 ? '#fbbf24' : '#34d399'"
        size="lg"
      />
    </div>

    <LossCurve
      :current-probability="targetProb"
      :current-loss="state.loss.value"
    />

    <!-- Reference points comparison -->
    <div class="rounded-lg bg-surface-light p-4">
      <h4 class="mb-3 text-sm font-medium text-text-secondary">Loss at different confidence levels:</h4>
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div
          v-for="point in referencePoints"
          :key="point.prob"
          class="rounded-md bg-surface p-3 text-center"
        >
          <div class="text-xs text-text-secondary">{{ point.label }}</div>
          <div class="mt-1 font-mono text-sm text-brand-light">p = {{ point.prob }}</div>
          <div
            class="mt-1 font-mono text-lg font-bold"
            :style="{ color: point.loss > 2 ? '#f87171' : point.loss > 0.5 ? '#fbbf24' : '#34d399' }"
          >
            {{ point.loss.toFixed(3) }}
          </div>
        </div>
      </div>
    </div>

    <p class="text-sm text-text-secondary">
      The yellow dot shows where we are on the curve. Move the logit sliders above to watch it slide along
      −log(p). Notice the punishing asymmetry: the curve is gentle near p=1 but shoots to infinity near p=0.
    </p>
  </div>
</template>
