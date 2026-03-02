<script setup lang="ts">
import { computed } from 'vue'
import { useTutorialState } from '../../composables/useTutorialState'
import LogitSliders from '../ui/LogitSliders.vue'
import BarChart from '../charts/BarChart.vue'

const state = useTutorialState()
const labels = computed(() => [...state.tokens])
</script>

<template>
  <div class="space-y-6">
    <!-- Concrete example callout -->
    <div class="rounded-lg border border-surface-lighter bg-surface-light/50 p-4 text-sm">
      <strong class="text-brand-light">Running example:</strong>
      <span class="text-text-secondary">
        The network computed scores for <em>"The ___"</em>:
      </span>
      <span
        v-for="(token, index) in state.tokens"
        :key="token"
        class="ml-2 font-mono"
        :style="{ color: state.tokenColors[index] }"
      >
        {{ token }} → {{ state.logits.value[index].toFixed(1) }}<span v-if="index < state.tokens.length - 1" class="text-text-secondary">,</span>
      </span>
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <div>
        <h3 class="mb-3 text-sm font-medium text-text-secondary">Adjust logits</h3>
        <LogitSliders />
      </div>
      <div>
        <BarChart
          :labels="labels"
          :values="state.logits.value"
          :colors="state.tokenColors"
          title="Raw Logits"
          :precision="1"
          y-axis-label="logit value"
        />
      </div>
    </div>

    <!-- Try it callout -->
    <div class="rounded-lg border border-brand/30 bg-brand/5 p-4 text-sm text-text-secondary">
      <strong class="text-brand-light">Try it:</strong>
      Drag "cat"'s logit down below "dog"'s. The bars swap order — but we still don't know the
      actual probabilities. Are the logits [2.0, 1.0] and [200.0, 100.0] different predictions?
      Without converting to probabilities, we can't tell. That's what the next steps solve.
    </div>
  </div>
</template>
