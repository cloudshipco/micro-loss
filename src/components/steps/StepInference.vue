<script setup lang="ts">
import { ref, computed } from 'vue'
import { computeSoftmax } from '../../engine/softmax'
import { TOKENS, TOKEN_COLORS } from '../../engine/types'
import BarChart from '../charts/BarChart.vue'

// Logits representing a well-trained model — fish strongly preferred
const baseLogits = [0.1, 0.4, 0.8, 3.5]
const temperature = ref(1.0)

// Start with a seed context
const seedContext = ['the', 'cat', 'ate']
const generatedTokens = ref<number[]>([])
const lastSampledIndex = ref<number | null>(null)
const isAnimating = ref(false)

const currentContext = computed(() => [
  ...seedContext,
  ...generatedTokens.value.map(i => TOKENS[i]),
])

const temperedLogits = computed(() =>
  baseLogits.map(z => z / temperature.value)
)

const probabilities = computed(() =>
  computeSoftmax(temperedLogits.value).probabilities
)

// Sample from a discrete probability distribution
function sampleFromDistribution(probs: number[]): number {
  const r = Math.random()
  let cumulative = 0
  for (let i = 0; i < probs.length; i++) {
    cumulative += probs[i]
    if (r < cumulative) return i
  }
  return probs.length - 1
}

async function generateNextToken() {
  if (isAnimating.value) return
  isAnimating.value = true
  lastSampledIndex.value = null

  // Brief pause to show the "thinking" state
  await new Promise(resolve => setTimeout(resolve, 300))

  const sampledIndex = sampleFromDistribution(probabilities.value)
  lastSampledIndex.value = sampledIndex
  generatedTokens.value = [...generatedTokens.value, sampledIndex]

  isAnimating.value = false
}

function reset() {
  generatedTokens.value = []
  lastSampledIndex.value = null
}

function getLossColor(p: number): string {
  if (p > 0.5) return '#34d399'
  if (p > 0.2) return '#fbbf24'
  return '#f87171'
}
</script>

<template>
  <div class="space-y-6">
    <!-- Growing sequence display -->
    <div class="rounded-lg bg-surface-light p-5">
      <div class="mb-2 text-xs font-medium uppercase tracking-wider text-text-secondary">Generated sequence</div>
      <div class="flex flex-wrap items-center gap-2 min-h-[2.5rem]">
        <!-- Seed context -->
        <span
          v-for="(token, i) in seedContext"
          :key="`seed-${i}`"
          class="rounded bg-surface px-2.5 py-1 font-mono text-sm text-text-secondary"
        >
          {{ token }}
        </span>

        <!-- Generated tokens -->
        <span
          v-for="(tokenIndex, i) in generatedTokens"
          :key="`gen-${i}`"
          class="rounded px-2.5 py-1 font-mono text-sm font-bold transition-all duration-300"
          :class="i === generatedTokens.length - 1 && lastSampledIndex !== null ? 'scale-110' : ''"
          :style="{
            color: TOKEN_COLORS[tokenIndex],
            backgroundColor: TOKEN_COLORS[tokenIndex] + '25',
            border: `1px solid ${TOKEN_COLORS[tokenIndex]}50`,
          }"
        >
          {{ TOKENS[tokenIndex] }}
        </span>

        <!-- Thinking indicator -->
        <span v-if="isAnimating" class="animate-pulse text-text-secondary">...</span>

        <!-- Cursor -->
        <span v-else-if="!isAnimating" class="h-5 w-0.5 animate-pulse bg-brand-light" />
      </div>
    </div>

    <!-- Temperature control -->
    <div class="rounded-lg bg-surface-light p-4">
      <div class="flex items-center justify-between">
        <h4 class="text-sm font-medium text-text-secondary">Temperature &tau;</h4>
        <span class="font-mono text-sm text-brand-light">{{ temperature.toFixed(2) }}</span>
      </div>
      <input
        type="range"
        min="0.1"
        max="3.0"
        step="0.05"
        v-model.number="temperature"
        class="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-lighter accent-brand"
      />
      <div class="mt-1 flex justify-between text-xs text-text-secondary">
        <span>0.1 (deterministic)</span>
        <span>3.0 (very random)</span>
      </div>
    </div>

    <!-- Probability distribution -->
    <BarChart
      :labels="[...TOKENS]"
      :values="probabilities"
      :colors="TOKEN_COLORS"
      title="Sampling distribution"
      :precision="3"
      y-axis-label="probability"
      :y-min="0"
      :y-max="1"
    />

    <!-- Token probabilities -->
    <div class="grid grid-cols-4 gap-3">
      <div
        v-for="(token, index) in TOKENS"
        :key="token"
        class="rounded-lg bg-surface-light p-3 text-center"
        :class="lastSampledIndex === index ? 'ring-2 ring-brand' : ''"
      >
        <div class="font-mono font-semibold" :style="{ color: TOKEN_COLORS[index] }">{{ token }}</div>
        <div
          class="mt-1 font-mono text-lg font-bold"
          :style="{ color: getLossColor(probabilities[index]) }"
        >
          {{ (probabilities[index] * 100).toFixed(1) }}%
        </div>
        <div class="mt-1 text-xs text-text-secondary">
          chance of being sampled
        </div>
      </div>
    </div>

    <!-- Generation controls -->
    <div class="flex flex-wrap items-center gap-3">
      <button
        @click="generateNextToken"
        :disabled="isAnimating"
        class="rounded-lg bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
      >
        {{ isAnimating ? 'Sampling...' : 'Generate next token' }}
      </button>
      <button
        v-if="generatedTokens.length > 0"
        @click="reset"
        :disabled="isAnimating"
        class="rounded-lg border border-surface-lighter bg-surface-light px-4 py-3 text-sm text-text-secondary transition hover:border-brand hover:text-text-primary disabled:opacity-50"
      >
        Reset
      </button>
      <span v-if="generatedTokens.length > 0" class="text-sm text-text-secondary">
        {{ generatedTokens.length }} token{{ generatedTokens.length === 1 ? '' : 's' }} generated
      </span>
    </div>

    <!-- How sampling works -->
    <div class="rounded-lg bg-surface-light p-4 text-sm text-text-secondary">
      <strong class="text-text-primary">Sampling vs. argmax:</strong>
      <p class="mt-2">
        At low temperature, the model nearly always picks "fish" (highest probability). Always
        picking the single most likely token is called <strong>greedy decoding</strong> — "greedy"
        because it takes the locally best choice at every step without considering what comes
        next. It's predictable but can produce repetitive text. At higher temperatures,
        lower-probability tokens get a real chance to be sampled, making the output more varied.
      </p>
    </div>

    <!-- What this means -->
    <div class="rounded-lg border border-positive/30 bg-positive/5 p-4 text-sm text-text-secondary">
      <strong class="text-positive">This is how every LLM generates text.</strong>
      When you send a message to ChatGPT or Claude, this exact process runs for every token
      in the reply — often hundreds of autoregressive steps to generate a full response.
      The next step bridges our toy model to the real thing.
    </div>
  </div>
</template>
