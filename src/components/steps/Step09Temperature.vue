<script setup lang="ts">
import { computed } from 'vue'
import { createTutorialState, provideTutorialState } from '../../composables/useTutorialState'
import TemperatureSlider from '../ui/TemperatureSlider.vue'
import BarChart from '../charts/BarChart.vue'
import FormulaLegend from '../ui/FormulaLegend.vue'
import Callout from '../ui/Callout.vue'

const state = createTutorialState()
provideTutorialState(state)
const labels = computed(() => [...state.tokens])
</script>

<template>
  <div class="space-y-6">
    <FormulaLegend
      latex="\textcolor{#34d399}{p_i} = e^{\textcolor{#93c5fd}{z_i} \,/\, \textcolor{#f87171}{\tau}} \,/\, \textstyle\sum_j \, e^{\textcolor{#93c5fd}{z_j} \,/\, \textcolor{#f87171}{\tau}}"
      :symbols="[
        { symbol: 'p_i', label: 'probability for token i', color: '#34d399' },
        { symbol: 'z_i', label: 'logit for token i', color: '#93c5fd' },
        { symbol: '\\tau', label: 'temperature (scaling factor)', color: '#f87171' },
      ]"
    />
    <TemperatureSlider />

    <div class="grid gap-6 md:grid-cols-2">
      <div>
        <h4 class="mb-2 text-center text-sm font-medium text-text-secondary">&tau; = 1.0 (Normal)</h4>
        <BarChart
          :labels="labels"
          :values="state.probabilities.value"
          :colors="state.tokenColors"
          :precision="4"
          y-axis-label="probability"
          :y-min="0"
          :y-max="1"
        />
      </div>
      <div>
        <h4 class="mb-2 text-center text-sm font-medium text-text-secondary">
          &tau; = {{ state.temperature.value.toFixed(2) }}
        </h4>
        <BarChart
          :labels="labels"
          :values="state.temperedSoftmax.value.probabilities"
          :colors="state.tokenColors"
          :precision="4"
          y-axis-label="probability"
          :y-min="0"
          :y-max="1"
        />
      </div>
    </div>

    <!-- Tempered stats -->
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div
        v-for="(token, index) in state.tokens"
        :key="token"
        class="rounded-lg bg-surface-light p-3 text-center"
      >
        <div class="text-xs text-text-secondary">{{ token }}</div>
        <div class="mt-1 font-mono text-sm" :style="{ color: state.tokenColors[index] }">
          <span class="text-text-secondary">{{ (state.probabilities.value[index] * 100).toFixed(1) }}%</span>
          <span class="text-text-secondary"> &rarr; </span>
          <span class="font-bold">{{ (state.temperedSoftmax.value.probabilities[index] * 100).toFixed(1) }}%</span>
        </div>
      </div>
    </div>

    <Callout title="Temperature effects:">
      <ul class="mt-2 list-inside list-disc space-y-1">
        <li><strong>&tau; &rarr; 0:</strong> Distribution becomes peaked (argmax), model is "confident"</li>
        <li><strong>&tau; = 1:</strong> Standard softmax</li>
        <li><strong>&tau; &rarr; &infin;:</strong> Distribution approaches uniform, model is "uncertain"</li>
      </ul>
    </Callout>

    <!-- Real-world context -->
    <Callout variant="brand" title="In practice:">
      Setting <code class="rounded bg-surface-light px-1.5 py-0.5 text-xs">temperature=0.2</code>
      makes the model pick its top choice almost deterministically &mdash; great for factual queries and code.
      Setting <code class="rounded bg-surface-light px-1.5 py-0.5 text-xs">temperature=1.0</code> or higher lets
      lower-ranked tokens have a real chance of being sampled &mdash; producing more creative, surprising, and
      occasionally nonsensical text. The math you're playing with right now is happening billions of times
      per second inside these models.
    </Callout>
  </div>
</template>
