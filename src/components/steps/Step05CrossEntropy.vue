<script setup lang="ts">
import { computed } from 'vue'
import { createTutorialState, provideTutorialState } from '../../composables/useTutorialState'
import katex from 'katex'
import LossCurve from '../charts/LossCurve.vue'
import PieChart from '../charts/PieChart.vue'
import LogitSliders from '../ui/LogitSliders.vue'
import DeepDive from '../ui/DeepDive.vue'

const km = (latex: string) => katex.renderToString(latex, { throwOnError: false, displayMode: false })

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

    <DeepDive title="Why 'cross-entropy'?">
      <p>The name comes from information theory (Claude Shannon, 1948). It measures the cost of using
        one distribution (the model's prediction <span v-html="km('p')"></span>) to represent events
        that actually follow another distribution (the truth <span v-html="km('y')"></span>). The worse
        <span v-html="km('p')"></span> matches <span v-html="km('y')"></span>, the higher the cost.
        This is <em>not</em> symmetric — it specifically penalises the model for being wrong about
        reality, not the other way around.</p>
    </DeepDive>

    <DeepDive title="Why -log and not something simpler?">
      <p class="mb-3">Why <span v-html="km('-\\log')"></span> and not something simpler like
        <span v-html="km('1 - p')"></span>? Compare the two at different confidence levels:</p>
      <table class="w-full text-sm border-collapse mb-3">
        <thead>
          <tr class="text-left text-text-secondary">
            <th class="pb-2 pr-4"><span v-html="km('p_{\\text{target}}')"></span></th>
            <th class="pb-2 pr-4"><span v-html="km('1 - p')"></span></th>
            <th class="pb-2 pr-4"><span v-html="km('-\\log(p)')"></span></th>
            <th class="pb-2">Meaning</th>
          </tr>
        </thead>
        <tbody class="font-mono">
          <tr class="border-t border-surface-lighter">
            <td class="py-1.5 pr-4 text-positive font-bold">1.00</td>
            <td class="py-1.5 pr-4">0.00</td>
            <td class="py-1.5 pr-4 text-positive font-bold">0.00</td>
            <td class="py-1.5 font-sans text-text-secondary">Perfect prediction</td>
          </tr>
          <tr class="border-t border-surface-lighter">
            <td class="py-1.5 pr-4">0.90</td>
            <td class="py-1.5 pr-4">0.10</td>
            <td class="py-1.5 pr-4">0.11</td>
            <td class="py-1.5 font-sans text-text-secondary">Confident and correct</td>
          </tr>
          <tr class="border-t border-surface-lighter">
            <td class="py-1.5 pr-4">0.50</td>
            <td class="py-1.5 pr-4">0.50</td>
            <td class="py-1.5 pr-4">0.69</td>
            <td class="py-1.5 font-sans text-text-secondary">Coin flip</td>
          </tr>
          <tr class="border-t border-surface-lighter">
            <td class="py-1.5 pr-4">0.01</td>
            <td class="py-1.5 pr-4">0.99</td>
            <td class="py-1.5 pr-4 text-negative font-bold">4.61</td>
            <td class="py-1.5 font-sans text-text-secondary">Confident and wrong</td>
          </tr>
          <tr class="border-t border-surface-lighter">
            <td class="py-1.5 pr-4 text-negative font-bold">0.00</td>
            <td class="py-1.5 pr-4">1.00</td>
            <td class="py-1.5 pr-4 text-negative font-bold"><span v-html="km('\\infty')"></span></td>
            <td class="py-1.5 font-sans text-text-secondary">Completely wrong</td>
          </tr>
        </tbody>
      </table>
      <p class="mb-3">With <span v-html="km('1 - p')"></span>, going from "coin flip" to "confident and wrong" only
        doubles the penalty (0.50 → 0.99). With <span v-html="km('-\\log')"></span>, it jumps nearly
        7× (0.69 → 4.61). The logarithm penalises low-confidence predictions far more steeply — which
        is exactly what training needs, because a model that's confident and wrong has the most to fix.</p>
      <p class="mb-3"><strong class="text-text-primary">Reading the table:</strong> a helpful identity is
        <span v-html="km('-\\log(0.5) = \\ln(2) \\approx 0.693')"></span>.</p>
      <p>A coin-flip prediction costs about 0.69 — the loss when the model assigns equal probability
        to two options. Halving the probability again adds another <span v-html="km('\\ln(2)')"></span>
        to the loss: <span v-html="km('-\\log(0.25) \\approx 1.39')"></span>,
        <span v-html="km('-\\log(0.125) \\approx 2.08')"></span>, and so on.
        Each halving adds exactly 0.693.</p>
    </DeepDive>
  </div>
</template>
