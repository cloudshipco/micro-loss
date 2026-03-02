<script setup lang="ts">
import { computed } from 'vue'
import { useTutorialState } from '../../composables/useTutorialState'
import MathBlock from '../ui/MathBlock.vue'
import ValueDisplay from '../ui/ValueDisplay.vue'

const state = useTutorialState()

const targetToken = computed(() => state.tokens[state.targetIndex.value])
const targetLogit = computed(() => state.logits.value[state.targetIndex.value])
</script>

<template>
  <div class="space-y-6">
    <MathBlock size="md">
      <span class="text-text-secondary">L = </span>
      <span class="text-negative">&minus;z<sub>y</sub></span>
      <span class="text-text-secondary"> + </span>
      <span class="text-warning">log &Sigma; e<sup>z<sub>j</sub></sup></span>
    </MathBlock>

    <!-- Concrete substitution -->
    <div class="rounded-lg bg-surface-light p-4">
      <h4 class="mb-3 text-sm font-medium text-text-secondary">Substituting current values:</h4>
      <div class="space-y-2 font-mono text-sm">
        <div>
          <span class="text-text-secondary">L = &minus;</span>
          <span class="text-negative">z<sub>{{ targetToken }}</sub></span>
          <span class="text-text-secondary"> + log(</span>
          <span v-for="(token, index) in state.tokens" :key="token">
            <span class="text-text-secondary">e<sup><span :style="{ color: state.tokenColors[index] }">{{ state.logits.value[index].toFixed(1) }}</span></sup></span>
            <span v-if="index < state.tokens.length - 1" class="text-text-secondary"> + </span>
          </span>
          <span class="text-text-secondary">)</span>
        </div>
        <div>
          <span class="text-text-secondary">L = &minus;(</span>
          <span class="text-negative">{{ targetLogit.toFixed(2) }}</span>
          <span class="text-text-secondary">) + log(</span>
          <span class="text-warning">{{ state.softmaxResult.value.sumExp.toFixed(2) }}</span>
          <span class="text-text-secondary">)</span>
        </div>
        <div>
          <span class="text-text-secondary">L = </span>
          <span class="text-negative">{{ (-targetLogit).toFixed(3) }}</span>
          <span class="text-text-secondary"> + </span>
          <span class="text-warning">{{ state.lossDetailed.value.logSumExp.toFixed(3) }}</span>
          <span class="text-text-secondary"> = </span>
          <span class="font-bold" :style="{ color: state.loss.value > 2 ? '#f87171' : state.loss.value > 0.5 ? '#fbbf24' : '#34d399' }">
            {{ state.loss.value.toFixed(3) }}
          </span>
        </div>
      </div>
    </div>

    <div class="grid gap-4 sm:grid-cols-3">
      <div class="rounded-lg bg-surface-light p-4 text-center">
        <div class="text-xs uppercase tracking-wider text-text-secondary">&minus;z<sub>y</sub> (raise correct)</div>
        <div class="mt-2 font-mono text-2xl font-bold text-negative">
          {{ (-targetLogit).toFixed(3) }}
        </div>
        <div class="mt-1 text-xs text-text-secondary">
          target logit: {{ targetToken }} = {{ targetLogit.toFixed(2) }}
        </div>
      </div>
      <div class="flex items-center justify-center text-3xl text-text-secondary">+</div>
      <div class="rounded-lg bg-surface-light p-4 text-center">
        <div class="text-xs uppercase tracking-wider text-text-secondary">log &Sigma; e<sup>z<sub>j</sub></sup> (suppress all)</div>
        <div class="mt-2 font-mono text-2xl font-bold text-warning">
          {{ state.lossDetailed.value.logSumExp.toFixed(3) }}
        </div>
      </div>
    </div>

    <div class="flex justify-center">
      <ValueDisplay
        label="Total Loss"
        :value="state.loss.value"
        :precision="4"
        :color="state.loss.value > 2 ? '#f87171' : state.loss.value > 0.5 ? '#fbbf24' : '#34d399'"
        size="lg"
      />
    </div>

    <div class="rounded-lg border border-surface-lighter bg-surface-light/50 p-4 text-sm text-text-secondary">
      <strong class="text-text-primary">Key insight &mdash; two forces at work:</strong>
      <ol class="mt-2 list-inside list-decimal space-y-1">
        <li><span class="text-negative">&minus;z<sub>y</sub></span> &mdash; Increasing the correct token's logit directly reduces loss</li>
        <li><span class="text-warning">log &Sigma; e<sup>z<sub>j</sub></sup></span> &mdash; But all logits contribute to this competitor term. Lowering competitors also helps.</li>
      </ol>
      <p class="mt-2">
        The optimal strategy isn't to make the target logit infinitely large &mdash; it's to make it
        large <em>relative</em> to the others. A target logit of 10 with competitors at 0 gives the
        same loss as a target of 110 with competitors at 100.
      </p>
    </div>
  </div>
</template>
