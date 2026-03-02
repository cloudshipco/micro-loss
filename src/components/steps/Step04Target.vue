<script setup lang="ts">
import { useTutorialState } from '../../composables/useTutorialState'
import TokenSelector from '../ui/TokenSelector.vue'

const state = useTutorialState()
</script>

<template>
  <div class="space-y-6">
    <!-- Running example context -->
    <div class="rounded-lg border border-surface-lighter bg-surface-light/50 p-4 text-sm text-text-secondary">
      <strong class="text-brand-light">Running example:</strong>
      In our sentence <em>"The <strong class="text-text-primary">{{ state.tokens[state.targetIndex.value] }}</strong>
      sat on the mat"</em>, the correct next word after "The" is
      <strong class="text-text-primary">"{{ state.tokens[state.targetIndex.value] }}"</strong>.
      Click a different token below to see how the loss changes in the next step.
    </div>

    <TokenSelector />

    <!-- One-hot visualization -->
    <div class="rounded-lg bg-surface-light p-4">
      <h4 class="mb-2 text-sm font-medium text-text-secondary">
        One-hot target y vs. network prediction p
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
    <div class="rounded-lg border border-brand/30 bg-brand/5 p-4 text-sm text-text-secondary">
      <strong class="text-brand-light">Try it:</strong>
      Click "bird" as the target. Since the network gave "bird" the lowest probability
      (because its logit was the lowest at −1.0), the gap between prediction and target
      is now large. The loss in the next step will be much higher — the network is being
      punished for a bad prediction.
    </div>
  </div>
</template>
