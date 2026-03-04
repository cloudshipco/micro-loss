<script setup lang="ts">
import katex from 'katex'
import { createTutorialState, provideTutorialState } from '../../composables/useTutorialState'
import GradientArrows from '../ui/GradientArrows.vue'
import FormulaLegend from '../ui/FormulaLegend.vue'
import Callout from '../ui/Callout.vue'

const km = (latex: string) => katex.renderToString(latex, { throwOnError: false, displayMode: false })

const state = createTutorialState()
provideTutorialState(state)
</script>

<template>
  <div class="space-y-6">
    <FormulaLegend
      latex="\textcolor{#f87171}{\nabla_z L} = \textcolor{#34d399}{p} - \textcolor{#fbbf24}{y}"
      :symbols="[
        { symbol: '\\nabla_z L', label: 'gradient of loss w.r.t. logits', color: '#f87171' },
        { symbol: 'p', label: 'predicted probabilities', color: '#34d399' },
        { symbol: 'y', label: 'target (one-hot vector)', color: '#fbbf24' },
      ]"
    />

    <!-- Intuitive derivation -->
    <Callout variant="subtle">
      <template #default>
        <strong class="text-text-primary">Why <span v-html="km('p - y')"></span>?</strong>
        <p class="mt-2">
          The gradient measures: "if I nudge this logit up a tiny bit, how much does the loss change?"
          For the <strong class="text-positive">correct token</strong>, making its logit bigger increases
          its probability and decreases the loss &mdash; so the gradient is negative (= go up to improve).
          For <strong class="text-negative">wrong tokens</strong>, making their logits bigger steals
          probability from the correct answer and increases the loss &mdash; so the gradient is positive
          (= go down to improve).
        </p>
        <p class="mt-2">
          The magnitude is proportional to probability: a wrong token with 30% probability gets pushed
          down 3x harder than one with 10%. The model focuses its effort on the biggest offenders.
        </p>
      </template>
    </Callout>

    <!-- Gradient table -->
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-surface-lighter text-text-secondary">
            <th class="py-2 text-left font-medium">Token</th>
            <th class="py-2 text-right font-medium">p (predicted)</th>
            <th class="py-2 text-center font-medium">&minus;</th>
            <th class="py-2 text-right font-medium">y (target)</th>
            <th class="py-2 text-center font-medium">=</th>
            <th class="py-2 text-right font-medium">Gradient</th>
            <th class="py-2 pl-4 text-left font-medium">Effect</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(token, index) in state.tokens"
            :key="token"
            class="border-b border-surface-lighter/50"
          >
            <td class="py-2 font-semibold" :style="{ color: state.tokenColors[index] }">
              {{ token }}
              <span v-if="state.targetIndex.value === index" class="ml-1 text-xs text-positive">(target)</span>
            </td>
            <td class="py-2 text-right font-mono text-brand-light">
              {{ state.probabilities.value[index].toFixed(4) }}
            </td>
            <td class="py-2 text-center text-text-secondary">&minus;</td>
            <td class="py-2 text-right font-mono" :class="state.oneHotTarget.value[index] === 1 ? 'text-positive font-bold' : 'text-text-secondary'">
              {{ state.oneHotTarget.value[index] }}
            </td>
            <td class="py-2 text-center text-text-secondary">=</td>
            <td class="py-2 text-right font-mono font-bold" :class="state.gradient.value[index] < 0 ? 'text-positive' : 'text-negative'">
              {{ state.gradient.value[index] >= 0 ? '+' : '' }}{{ state.gradient.value[index].toFixed(4) }}
            </td>
            <td class="py-2 pl-4 text-xs" :class="state.gradient.value[index] < 0 ? 'text-positive' : 'text-negative'">
              {{ state.gradient.value[index] < 0 ? '↑ push logit up' : '↓ push logit down' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <GradientArrows />

    <Callout title="Key insight:">
      The gradient for the correct token is <span class="text-positive" v-html="km('p - 1')"></span> (always negative, pushing its logit up).
      For all other tokens it's just <span class="text-negative" v-html="km('p')"></span> (always positive, pushing logits down in proportion to how much probability they captured).
      The entire gradient is just the gap between prediction and truth — <strong v-html="km('p - y')"></strong>.
    </Callout>
  </div>
</template>
