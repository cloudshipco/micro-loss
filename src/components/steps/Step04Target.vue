<script setup lang="ts">
import { createTutorialState, provideTutorialState } from '../../composables/useTutorialState'
import TokenSelector from '../ui/TokenSelector.vue'
import FormulaLegend from '../ui/FormulaLegend.vue'
import Callout from '../ui/Callout.vue'

const state = createTutorialState()
provideTutorialState(state)
</script>

<template>
  <div class="space-y-6">
    <FormulaLegend
      latex="\textcolor{#fbbf24}{y_i} = \begin{cases} 1 & \text{if } i = \text{target} \\ 0 & \text{otherwise} \end{cases}"
      :symbols="[
        { symbol: 'y_i', label: 'target value for token i', color: '#fbbf24' },
      ]"
    />

    <!-- Running example context -->
    <Callout title="Running example:">
      In our sentence <em>"the cat ate <strong class="text-text-primary">{{ state.tokens[state.targetIndex.value] }}</strong>"</em>,
      the correct next word after "ate" is
      <strong class="text-text-primary">"{{ state.tokens[state.targetIndex.value] }}"</strong>.
      Click a different token below to see how the loss changes in the next step.
    </Callout>

    <TokenSelector />

    <!-- One-hot visualization -->
    <div class="rounded-lg bg-surface-light p-4">
      <h4 class="mb-2 text-sm font-medium text-text-secondary">
        One-hot target y vs. model prediction p
      </h4>
      <div class="grid grid-cols-4 gap-2 text-center">
        <div
          v-for="(token, index) in state.tokens"
          :key="token"
          class="rounded-md bg-surface py-2"
        >
          <div class="text-xs text-text-secondary">{{ token }}</div>
          <div class="mt-1 font-mono text-sm">
            <span class="text-brand-light">{{ (state.probabilities.value[index] * 100).toFixed(1) }}%</span>
            <span class="text-text-secondary"> vs </span>
            <span :class="state.targetIndex.value === index ? 'text-positive font-bold' : 'text-text-secondary'">
              {{ state.targetIndex.value === index ? '100%' : '0%' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Try it callout -->
    <Callout variant="brand" title="Try it:">
      Click "the" as the target. Since the model gave "the" the lowest probability
      (because its logit was the lowest), the gap between prediction and target is now
      large. The loss in the next step will be much higher &mdash; the model is being
      punished for a bad prediction.
    </Callout>
  </div>
</template>
