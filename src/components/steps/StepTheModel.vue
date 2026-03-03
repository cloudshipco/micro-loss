<script setup lang="ts">
import { ref, computed } from 'vue'
import { TOKENS, TOKEN_COLORS } from '../../engine/types'
import { PARAMETER_GROUPS, TOTAL_PARAMETERS, SCALE_COMPARISONS, MODEL_CONFIG, randomInitMatrix } from '../../engine/model-config'

const trained = ref(false)

// Untrained: arbitrary numbers that happen to look random
// Trained: our running example values where cat wins
const untrainedScores = [1.3, -0.7, 2.1, -1.4]
const trainedScores   = [2.0,  1.0, 0.5,  0.1]

const scores = computed(() => trained.value ? trainedScores : untrainedScores)

// Normalise bar widths relative to max absolute value for display
const maxAbs = computed(() => Math.max(...scores.value.map(Math.abs), 1))
function barWidth(score: number): number {
  return Math.round((Math.abs(score) / maxAbs.value) * 100)
}

// Random initialization heatmap
const heatmapMatrix = ref(randomInitMatrix(MODEL_CONFIG.vocabSize, MODEL_CONFIG.nEmbed))

function reinitialize() {
  heatmapMatrix.value = randomInitMatrix(MODEL_CONFIG.vocabSize, MODEL_CONFIG.nEmbed)
}

function heatmapColor(val: number): string {
  // Map value to color: negative = blue, zero = dark, positive = orange
  const clamped = Math.max(-0.06, Math.min(0.06, val))
  const t = (clamped + 0.06) / 0.12 // 0..1
  if (t < 0.5) {
    const intensity = Math.round((1 - t * 2) * 255)
    return `rgb(${Math.round(intensity * 0.4)}, ${Math.round(intensity * 0.4)}, ${intensity})`
  } else {
    const intensity = Math.round((t * 2 - 1) * 255)
    return `rgb(${intensity}, ${Math.round(intensity * 0.6)}, ${Math.round(intensity * 0.15)})`
  }
}

function formatParam(n: number): string {
  if (n >= 1e12) return `${(n / 1e12).toFixed(1)}T`
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(0)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`
  return String(n)
}
</script>

<template>
  <div class="space-y-6">

    <!-- Model as input → output function -->
    <div class="rounded-lg bg-surface-light p-5">
      <div class="mb-4 text-sm font-medium text-text-secondary">The model as a function</div>

      <div class="flex flex-col items-center gap-4 md:flex-row md:items-stretch">

        <!-- Input side -->
        <div class="flex-1 rounded-lg border border-surface-lighter bg-surface p-4">
          <div class="mb-2 text-xs font-medium uppercase tracking-wider text-text-secondary">Input</div>
          <div class="text-xs text-text-secondary mb-3">A sequence of token IDs</div>
          <div class="flex flex-wrap gap-1.5">
            <span v-for="word in ['On', 'the', 'mat', 'sat', 'a']" :key="word"
              class="rounded bg-surface-light px-2 py-1 font-mono text-sm text-text-primary">
              {{ word }}
            </span>
          </div>
        </div>

        <div class="flex items-center justify-center text-2xl text-text-secondary">
          <span class="md:hidden">&darr;</span>
          <span class="hidden md:block">&rarr;</span>
        </div>

        <!-- The model box -->
        <div class="flex flex-col items-center justify-center rounded-lg border border-surface-lighter bg-surface p-4 md:w-44">
          <div class="text-3xl">⚙️</div>
          <div class="mt-2 text-sm font-semibold text-text-primary text-center">The Model</div>
          <div class="mt-2 rounded bg-surface-light px-2 py-1 text-center text-xs text-text-secondary">
            <span class="font-mono text-brand-light">{{ TOTAL_PARAMETERS }}</span><br>parameters
          </div>
        </div>

        <div class="flex items-center justify-center text-2xl text-text-secondary">
          <span class="md:hidden">&darr;</span>
          <span class="hidden md:block">&rarr;</span>
        </div>

        <!-- Output side -->
        <div class="flex-1 rounded-lg border border-surface-lighter bg-surface p-4">
          <div class="mb-2 text-xs font-medium uppercase tracking-wider text-text-secondary">Output</div>
          <div class="text-xs text-text-secondary mb-3">One score per vocabulary word</div>
          <div class="space-y-1.5">
            <div v-for="(token, i) in TOKENS" :key="token"
              class="flex items-center gap-2 text-sm font-mono">
              <span class="w-10 font-semibold" :style="{ color: TOKEN_COLORS[i] }">{{ token }}</span>
              <div class="flex-1 h-4 bg-surface-lighter rounded-sm overflow-hidden">
                <div
                  class="h-full rounded-sm transition-all duration-500"
                  :style="{
                    width: barWidth(scores[i]) + '%',
                    backgroundColor: TOKEN_COLORS[i] + '80',
                    marginLeft: scores[i] < 0 ? 'auto' : undefined,
                  }"
                />
              </div>
              <span class="w-14 text-right tabular-nums"
                :class="trained ? 'text-brand-light' : 'text-text-secondary'">
                {{ scores[i].toFixed(1) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Before / after training toggle -->
    <div class="rounded-lg bg-surface-light p-4">
      <div class="mb-3 text-sm font-medium text-text-secondary">Parameters start random — training makes them useful</div>
      <div class="flex gap-3">
        <button
          @click="trained = false"
          class="flex-1 rounded-lg border py-2.5 text-sm font-medium transition"
          :class="!trained
            ? 'border-brand bg-brand/10 text-brand-light'
            : 'border-surface-lighter bg-surface text-text-secondary hover:border-brand/50'"
        >
          Before training
        </button>
        <button
          @click="trained = true"
          class="flex-1 rounded-lg border py-2.5 text-sm font-medium transition"
          :class="trained
            ? 'border-positive bg-positive/10 text-positive'
            : 'border-surface-lighter bg-surface text-text-secondary hover:border-positive/50'"
        >
          After training
        </button>
      </div>
      <p class="mt-3 text-xs text-text-secondary">
        <span v-if="!trained">
          The model hasn't learned anything yet. The scores are essentially arbitrary —
          fish scores highest even though "cat" is the correct answer. This is what a
          freshly initialised model looks like.
        </span>
        <span v-else>
          After many training steps, the scores reflect the context. "Cat" now scores
          highest for <em>"On the mat sat a ___"</em>. The model has learned a useful
          pattern — not because it was programmed to, but because gradient descent adjusted
          the parameters until it got better at predicting correctly.
        </span>
      </p>
    </div>

    <!-- What parameters actually are -->
    <div class="rounded-lg border border-surface-lighter bg-surface-light/50 p-4 text-sm text-text-secondary">
      <strong class="text-text-primary">What parameters actually are:</strong>
      Concretely, a parameter is a single floating-point number — something like
      <span class="font-mono text-brand-light">0.3471</span> — stored in memory.
      The model contains billions of these numbers organised into matrices.
      During the forward pass, those matrices multiply and add with the input data
      to produce the output scores. During training, each parameter is nudged up or
      down by a tiny amount. That nudging, applied billions of times across billions
      of parameters, is what produces a model that can write coherent text.
    </div>

    <!-- Parameter inventory table -->
    <div class="rounded-lg bg-surface-light p-4">
      <h4 class="mb-3 text-sm font-medium text-text-secondary">
        Parameter inventory for our micro-model
      </h4>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-surface-lighter text-text-secondary">
              <th class="py-2 text-left font-medium">Group</th>
              <th class="py-2 text-right font-medium">Dimensions</th>
              <th class="py-2 text-right font-medium">Count</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="group in PARAMETER_GROUPS"
              :key="group.name"
              class="border-b border-surface-lighter/50"
            >
              <td class="py-2">
                <div class="font-medium text-text-primary">{{ group.name }}</div>
                <div class="text-xs text-text-secondary">{{ group.description }}</div>
              </td>
              <td class="py-2 text-right font-mono text-xs text-text-secondary">
                {{ group.dimensions }}
              </td>
              <td class="py-2 text-right font-mono text-brand-light">
                {{ group.count }}
              </td>
            </tr>
            <tr class="border-t-2 border-brand/30">
              <td class="py-2 font-semibold text-text-primary">Total</td>
              <td />
              <td class="py-2 text-right font-mono font-bold text-brand-light">
                {{ TOTAL_PARAMETERS }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Scale comparison -->
    <div class="rounded-lg bg-surface-light p-4">
      <h4 class="mb-3 text-sm font-medium text-text-secondary">Same architecture, different scale</h4>
      <div class="space-y-2">
        <div
          v-for="model in SCALE_COMPARISONS"
          :key="model.name"
          class="flex items-center gap-3"
        >
          <span class="w-24 text-sm font-medium" :style="{ color: model.color }">{{ model.name }}</span>
          <div class="flex-1 h-5 bg-surface-lighter rounded-sm overflow-hidden">
            <div
              class="h-full rounded-sm transition-all duration-500"
              :style="{
                width: Math.max(Math.log10(model.params) / Math.log10(2e12) * 100, 2) + '%',
                backgroundColor: model.color + '80',
              }"
            />
          </div>
          <span class="w-16 text-right font-mono text-sm text-text-secondary">
            {{ formatParam(model.params) }}
          </span>
        </div>
      </div>
      <p class="mt-3 text-xs text-text-secondary">
        Log scale. The architecture is structurally identical — same types of matrices,
        same operations. Only the dimensions differ. Our model has {{ TOTAL_PARAMETERS }} parameters;
        GPT-4 has roughly two trillion. Same math, vastly different scale.
      </p>
    </div>

    <!-- Random initialization heatmap -->
    <div class="rounded-lg bg-surface-light p-4">
      <div class="mb-3 flex items-center justify-between">
        <h4 class="text-sm font-medium text-text-secondary">
          Random initialization: Token Embedding matrix
          <span class="text-xs text-text-secondary/60">
            ({{ MODEL_CONFIG.vocabSize }} &times; {{ MODEL_CONFIG.nEmbed }})
          </span>
        </h4>
        <button
          @click="reinitialize"
          class="rounded-lg border border-surface-lighter bg-surface px-3 py-1.5 text-xs text-text-secondary transition hover:border-brand hover:text-text-primary"
        >
          Reinitialize
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="text-xs">
          <thead>
            <tr>
              <th class="py-1 pr-2 text-left font-medium text-text-secondary" />
              <th
                v-for="col in MODEL_CONFIG.nEmbed"
                :key="col"
                class="w-14 py-1 text-center font-mono text-text-secondary/50"
              >
                d{{ col - 1 }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, ri) in heatmapMatrix" :key="ri">
              <td class="py-0.5 pr-2 font-semibold" :style="{ color: TOKEN_COLORS[ri] }">
                {{ TOKENS[ri] }}
              </td>
              <td
                v-for="(val, ci) in row"
                :key="ci"
                class="w-14 py-0.5 text-center font-mono transition-colors duration-200"
                :style="{ backgroundColor: heatmapColor(val), color: '#e2e0ea' }"
              >
                {{ val >= 0 ? '+' : '' }}{{ val.toFixed(3) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="mt-3 text-xs text-text-secondary">
        Each cell is one parameter — a random number drawn from a Gaussian distribution
        with standard deviation 0.02. Click "Reinitialize" to see a fresh set.
        Before training, these numbers are meaningless. After training, each row encodes
        what the model has learned about that token's "meaning."
      </p>
    </div>

  </div>
</template>
