<script setup lang="ts">
import { computed } from 'vue'
import katex from 'katex'
import { createTutorialState, provideTutorialState } from '../../composables/useTutorialState'
import MathBlock from '../ui/MathBlock.vue'
import ValueDisplay from '../ui/ValueDisplay.vue'

const km = (latex: string) => katex.renderToString(latex, { throwOnError: false, displayMode: false })

const state = createTutorialState()
provideTutorialState(state)

const targetToken = computed(() => state.tokens[state.targetIndex.value])
const targetLogit = computed(() => state.logits.value[state.targetIndex.value])
</script>

<template>
  <div class="space-y-6">
    <MathBlock latex="L = \color{#f87171}{-z_y} + \color{#f59e0b}{\log \sum e^{z_j}}" size="md" />

    <!-- Concrete substitution -->
    <div class="rounded-lg bg-surface-light p-4">
      <h4 class="mb-3 text-sm font-medium text-text-secondary">Substituting current values:</h4>
      <div class="space-y-2 font-mono text-sm">
        <div>
          <span class="text-text-secondary" v-html="km('L = -')"></span>
          <span class="text-negative" v-html="km(`z_{\\text{${targetToken}}}`)"></span>
          <span class="text-text-secondary"> + log(</span>
          <span v-for="(token, index) in state.tokens" :key="token">
            <span class="text-text-secondary" v-html="km(`e^{\\color{${state.tokenColors[index]}}{${state.logits.value[index].toFixed(1)}}}`)"></span>
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
        <div class="text-xs uppercase tracking-wider text-text-secondary"><span v-html="km('-z_y')"></span> (raise correct)</div>
        <div class="mt-2 font-mono text-2xl font-bold text-negative">
          {{ (-targetLogit).toFixed(3) }}
        </div>
        <div class="mt-1 text-xs text-text-secondary">
          target logit: {{ targetToken }} = {{ targetLogit.toFixed(2) }}
        </div>
      </div>
      <div class="flex items-center justify-center text-3xl text-text-secondary">+</div>
      <div class="rounded-lg bg-surface-light p-4 text-center">
        <div class="text-xs uppercase tracking-wider text-text-secondary"><span v-html="km('\\log \\sum e^{z_j}')"></span> (suppress all)</div>
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
      <strong class="text-text-primary">Only relative values matter:</strong>
      A target logit of 10 with competitors at 0 gives the
      same loss as a target of 110 with competitors at 100. The optimal strategy isn't to make the
      target logit infinitely large &mdash; it's to make it large <em>relative</em> to the others.
    </div>
  </div>
</template>
