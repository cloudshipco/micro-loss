<script setup lang="ts">
import { ref, computed } from 'vue'
import katex from 'katex'
import { computeSoftmax } from '../../engine/softmax'

const km = (latex: string) => katex.renderToString(latex, { throwOnError: false, displayMode: false })
import { computeCrossEntropyLoss } from '../../engine/loss'
import { computeGradient } from '../../engine/gradient'
import { computeUpdate } from '../../engine/update'
import { initAdam, adamStep, DEFAULT_ADAM_CONFIG } from '../../engine/adam'
import { TOKENS, TOKEN_COLORS } from '../../engine/types'
import BarChart from '../charts/BarChart.vue'
import FormulaLegend from '../ui/FormulaLegend.vue'
import Callout from '../ui/Callout.vue'

const DEFAULT_LOGITS = [0.1, 0.5, 1.0, 2.0]
const TARGET_INDEX = 3 // fish

// SGD state
const sgdLogits = ref([...DEFAULT_LOGITS])
const sgdLossHistory = ref<number[]>([])

// Adam state
const adamLogits = ref([...DEFAULT_LOGITS])
const adamLossHistory = ref<number[]>([])
const adamState = ref(initAdam(4))

// Shared controls
const learningRate = ref(0.5)
const beta1 = ref(0.9)
const stepCount = ref(0)
const isTraining = ref(false)

// Per-parameter effective learning rates (from Adam)
const effectiveLRs = ref<number[]>([0, 0, 0, 0])

// Current probabilities for display
const sgdProbs = computed(() => computeSoftmax(sgdLogits.value).probabilities)
const adamProbs = computed(() => computeSoftmax(adamLogits.value).probabilities)
const sgdLoss = computed(() => computeCrossEntropyLoss(sgdProbs.value, TARGET_INDEX))
const adamLoss = computed(() => computeCrossEntropyLoss(adamProbs.value, TARGET_INDEX))

function reset() {
  sgdLogits.value = [...DEFAULT_LOGITS]
  adamLogits.value = [...DEFAULT_LOGITS]
  sgdLossHistory.value = []
  adamLossHistory.value = []
  adamState.value = initAdam(4)
  effectiveLRs.value = [0, 0, 0, 0]
  stepCount.value = 0
}

async function runSteps(totalSteps: number) {
  if (isTraining.value) return
  isTraining.value = true

  if (sgdLossHistory.value.length === 0) {
    sgdLossHistory.value.push(sgdLoss.value)
    adamLossHistory.value.push(adamLoss.value)
  }

  let sgd = [...sgdLogits.value]
  let adam = [...adamLogits.value]
  let state = { ...adamState.value }

  for (let i = 0; i < totalSteps; i++) {
    // SGD step
    const sgdSoftmax = computeSoftmax(sgd)
    const sgdGrad = computeGradient(sgdSoftmax.probabilities, TARGET_INDEX)
    const sgdResult = computeUpdate(sgd, sgdGrad.gradient, learningRate.value)
    const sgdLossVal = computeCrossEntropyLoss(sgdSoftmax.probabilities, TARGET_INDEX)

    // Adam step
    const adamSoftmax = computeSoftmax(adam)
    const adamGrad = computeGradient(adamSoftmax.probabilities, TARGET_INDEX)
    const adamResult = adamStep(adam, adamGrad.gradient, state, {
      ...DEFAULT_ADAM_CONFIG,
      lr: learningRate.value,
      beta1: beta1.value,
    })
    const adamLossVal = computeCrossEntropyLoss(adamSoftmax.probabilities, TARGET_INDEX)

    sgd = sgdResult.newLogits
    adam = adamResult.newParams
    state = adamResult.state
    effectiveLRs.value = adamResult.effectiveLR

    stepCount.value++
    sgdLossHistory.value = [...sgdLossHistory.value, sgdLossVal]
    adamLossHistory.value = [...adamLossHistory.value, adamLossVal]

    if (i % 5 === 4 || i === totalSteps - 1) {
      sgdLogits.value = [...sgd]
      adamLogits.value = [...adam]
      adamState.value = state
      await new Promise(resolve => requestAnimationFrame(resolve))
    }
  }

  sgdLogits.value = [...sgd]
  adamLogits.value = [...adam]
  adamState.value = state
  isTraining.value = false
}

const labels = computed(() => [...TOKENS])

// Normalized effective LR bars for display
const maxEffectiveLR = computed(() => Math.max(...effectiveLRs.value, 0.001))
</script>

<template>
  <div class="space-y-6">

    <FormulaLegend
      latex="\textcolor{#93c5fd}{\theta} \leftarrow \textcolor{#93c5fd}{\theta} - \textcolor{#6366f1}{\alpha} \cdot \textcolor{#34d399}{\hat{m}} \,/\, (\sqrt{\textcolor{#fbbf24}{\hat{v}}} + \textcolor{#f87171}{\epsilon})"
      :symbols="[
        { symbol: '\\theta', label: 'parameters (logits, weights, etc.)', color: '#93c5fd' },
        { symbol: '\\alpha', label: 'learning rate', color: '#6366f1' },
        { symbol: '\\hat{m}', label: 'bias-corrected momentum', color: '#34d399' },
        { symbol: '\\hat{v}', label: 'bias-corrected second moment', color: '#fbbf24' },
        { symbol: '\\epsilon', label: 'stability constant (prevents division by zero)', color: '#f87171' },
      ]"
    />

    <!-- Controls -->
    <div class="grid gap-4 md:grid-cols-2">
      <div class="rounded-lg bg-surface-light p-4">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-medium text-text-secondary">Learning rate η</h4>
          <span class="font-mono text-sm text-brand-light">{{ learningRate.toFixed(2) }}</span>
        </div>
        <input
          type="range" min="0.05" max="2.0" step="0.05"
          v-model.number="learningRate"
          class="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-lighter accent-brand"
        />
        <div class="mt-1 flex justify-between text-xs text-text-secondary">
          <span>0.05</span>
          <span>2.0</span>
        </div>
      </div>
      <div class="rounded-lg bg-surface-light p-4">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-medium text-text-secondary">Momentum <span v-html="km('\\beta_1')"></span></h4>
          <span class="font-mono text-sm text-brand-light">{{ beta1.toFixed(2) }}</span>
        </div>
        <input
          type="range" min="0.0" max="0.99" step="0.01"
          v-model.number="beta1"
          class="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-lighter accent-brand"
        />
        <div class="mt-1 flex justify-between text-xs text-text-secondary">
          <span>0 (no momentum)</span>
          <span>0.99 (heavy)</span>
        </div>
      </div>
    </div>

    <!-- Training controls -->
    <div class="flex flex-wrap items-center gap-3">
      <button
        @click="runSteps(1)"
        :disabled="isTraining"
        class="rounded-lg border border-brand/50 bg-brand/10 px-4 py-2.5 text-sm font-semibold text-brand-light transition hover:bg-brand/20 disabled:opacity-50"
      >
        Step
      </button>
      <button
        @click="runSteps(10)"
        :disabled="isTraining"
        class="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
      >
        {{ isTraining ? 'Training...' : '10 steps' }}
      </button>
      <button
        @click="runSteps(50)"
        :disabled="isTraining"
        class="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
      >
        50 steps
      </button>
      <button
        @click="reset"
        :disabled="isTraining"
        class="rounded-lg border border-surface-lighter bg-surface-light px-4 py-2.5 text-sm text-text-secondary transition hover:border-brand hover:text-text-primary disabled:opacity-50"
      >
        Reset
      </button>
      <div v-if="stepCount > 0" class="text-sm text-text-secondary">
        Step <span class="font-mono text-text-primary">{{ stepCount }}</span>
      </div>
    </div>

    <!-- Side-by-side SGD vs Adam loss -->
    <div class="grid gap-6 md:grid-cols-2">
      <div>
        <div class="mb-2 flex items-center gap-2">
          <span class="h-2 w-4 rounded bg-text-secondary" />
          <h4 class="text-sm font-medium text-text-secondary">SGD</h4>
          <span class="font-mono text-xs" :class="sgdLoss < 0.5 ? 'text-positive' : 'text-text-secondary'">
            Loss: {{ sgdLoss.toFixed(4) }}
          </span>
        </div>
        <BarChart
          :labels="labels"
          :values="sgdProbs"
          :colors="TOKEN_COLORS"
          :precision="3"
          y-axis-label="probability"
          :y-min="0"
          :y-max="1"
        />
      </div>
      <div>
        <div class="mb-2 flex items-center gap-2">
          <span class="h-2 w-4 rounded bg-[#f59e0b]" />
          <h4 class="text-sm font-medium text-text-secondary">Adam</h4>
          <span class="font-mono text-xs" :class="adamLoss < 0.5 ? 'text-positive' : 'text-text-secondary'">
            Loss: {{ adamLoss.toFixed(4) }}
          </span>
        </div>
        <BarChart
          :labels="labels"
          :values="adamProbs"
          :colors="TOKEN_COLORS"
          :precision="3"
          y-axis-label="probability"
          :y-min="0"
          :y-max="1"
        />
      </div>
    </div>

    <!-- Per-parameter effective learning rates -->
    <div v-if="stepCount > 0" class="rounded-lg bg-surface-light p-4">
      <h4 class="mb-3 text-sm font-medium text-text-secondary">
        Adam's adaptive step size per token
      </h4>
      <div class="space-y-2">
        <div
          v-for="(token, i) in TOKENS"
          :key="token"
          class="flex items-center gap-3"
        >
          <span class="w-10 text-sm font-semibold" :style="{ color: TOKEN_COLORS[i] }">{{ token }}</span>
          <div class="flex-1 h-4 bg-surface-lighter rounded-sm overflow-hidden">
            <div
              class="h-full rounded-sm transition-all duration-300"
              :style="{
                width: (effectiveLRs[i] / maxEffectiveLR) * 100 + '%',
                backgroundColor: TOKEN_COLORS[i] + '80',
              }"
            />
          </div>
          <span class="w-16 text-right font-mono text-xs text-text-secondary">
            {{ effectiveLRs[i].toFixed(2) }}
          </span>
        </div>
      </div>
      <p class="mt-2 text-xs text-text-secondary">
        Adam automatically adjusts the effective step size for each parameter.
        Parameters with consistently large gradients get smaller steps to prevent
        overshooting; parameters with small gradients get relatively larger steps
        to keep making progress.
      </p>
    </div>

    <!-- How Adam works -->
    <Callout variant="subtle" title="Under the hood:">
      <div class="mt-2 space-y-2">
        <div class="flex items-start gap-2">
          <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-lighter text-xs font-bold text-text-secondary">1</span>
          <p><strong class="text-text-primary">Momentum</strong> (<span v-html="km('\\beta_1')"></span>): Keep a running average of past gradients. This smooths out noise — if the gradient has been consistently pushing left, keep going left even if one step says go right.</p>
        </div>
        <div class="flex items-start gap-2">
          <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-lighter text-xs font-bold text-text-secondary">2</span>
          <p><strong class="text-text-primary">Adaptive rates</strong> (<span v-html="km('\\beta_2')"></span>): Track how large gradients have been for each parameter. Divide the step by this history — large-gradient parameters automatically get smaller steps.</p>
        </div>
        <div class="flex items-start gap-2">
          <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-lighter text-xs font-bold text-text-secondary">3</span>
          <p><strong class="text-text-primary">Bias correction</strong>: Early in training, the running averages are biased toward zero (they started at zero). Adam corrects for this so the first few steps aren't artificially small.</p>
        </div>
      </div>
    </Callout>

    <!-- Try it callout -->
    <Callout variant="brand" title="Try it:">
      Set the learning rate to 2.0, reset, and run 50 steps. Watch SGD oscillate wildly while
      Adam stays smooth. Then try <span v-html="km('\\beta_1')"></span> = 0 (no momentum) — Adam still adapts per-parameter
      learning rates but loses the smoothing effect.
    </Callout>
  </div>
</template>
