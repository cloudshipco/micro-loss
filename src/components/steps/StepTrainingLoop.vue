<script setup lang="ts">
import { ref, computed } from 'vue'
import { computeSoftmax } from '../../engine/softmax'
import { computeCrossEntropyLoss } from '../../engine/loss'
import { computeGradient } from '../../engine/gradient'
import { computeUpdate } from '../../engine/update'
import { initAdam, adamStep, DEFAULT_ADAM_CONFIG } from '../../engine/adam'
import { TOKENS, TOKEN_COLORS } from '../../engine/types'
import BarChart from '../charts/BarChart.vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { LineChart as ELineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([ELineChart, GridComponent, TooltipComponent, CanvasRenderer])

const DEFAULT_LOGITS = [0.1, 0.5, 1.0, 2.0]

// Training examples: context → target (from repeating "the cat ate fish")
const TRAINING_EXAMPLES = [
  { context: 'the cat ate', target: 3, targetWord: 'fish' },
  { context: 'cat ate fish', target: 0, targetWord: 'the' },
  { context: 'ate fish the', target: 1, targetWord: 'cat' },
  { context: 'fish the cat', target: 2, targetWord: 'ate' },
  { context: 'the cat', target: 2, targetWord: 'ate' },
  { context: 'ate fish', target: 0, targetWord: 'the' },
]

const useMultiExample = ref(false)
const useAdamOptimizer = ref(false)

const currentLogits = ref([...DEFAULT_LOGITS])
const learningRate = ref(0.5)
const lossHistory = ref<number[]>([])
const stepCount = ref(0)
const isTraining = ref(false)
const adamState = ref(initAdam(4))

// Generated output log: snapshots at checkpoints
const outputLog = ref<{ step: number; tokens: string[]; loss: number }[]>([])

const currentTargetIndex = computed(() => {
  if (!useMultiExample.value) return 3
  return TRAINING_EXAMPLES[stepCount.value % TRAINING_EXAMPLES.length].target
})

const currentProbs = computed(() =>
  computeSoftmax(currentLogits.value).probabilities
)

const currentLoss = computed(() =>
  computeCrossEntropyLoss(currentProbs.value, currentTargetIndex.value)
)

const labels = computed(() => [...TOKENS])

// Sample a token from a probability distribution
function sampleToken(probs: number[]): number {
  const r = Math.random()
  let cumulative = 0
  for (let i = 0; i < probs.length; i++) {
    cumulative += probs[i]
    if (r < cumulative) return i
  }
  return probs.length - 1
}

function generateSample(logits: number[]): string[] {
  const probs = computeSoftmax(logits).probabilities
  return Array.from({ length: 4 }, () => TOKENS[sampleToken(probs)])
}

function reset() {
  currentLogits.value = [...DEFAULT_LOGITS]
  lossHistory.value = []
  outputLog.value = []
  stepCount.value = 0
  adamState.value = initAdam(4)
}

async function runSteps(totalSteps: number) {
  if (isTraining.value) return
  isTraining.value = true

  if (lossHistory.value.length === 0) {
    lossHistory.value.push(currentLoss.value)
    outputLog.value.push({
      step: 0,
      tokens: generateSample(currentLogits.value),
      loss: currentLoss.value,
    })
  }

  let logits = [...currentLogits.value]
  let state = { ...adamState.value }

  for (let i = 0; i < totalSteps; i++) {
    const targetIdx = useMultiExample.value
      ? TRAINING_EXAMPLES[(stepCount.value) % TRAINING_EXAMPLES.length].target
      : 3

    const softmaxResult = computeSoftmax(logits)
    const loss = computeCrossEntropyLoss(softmaxResult.probabilities, targetIdx)
    const gradResult = computeGradient(softmaxResult.probabilities, targetIdx)

    if (useAdamOptimizer.value) {
      const adamResult = adamStep(logits, gradResult.gradient, state, {
        ...DEFAULT_ADAM_CONFIG,
        lr: learningRate.value,
      })
      logits = adamResult.newParams
      state = adamResult.state
    } else {
      const updateResult = computeUpdate(logits, gradResult.gradient, learningRate.value)
      logits = updateResult.newLogits
    }

    stepCount.value++
    lossHistory.value = [...lossHistory.value, loss]

    // Log output at checkpoints
    if (stepCount.value === 1 || stepCount.value % 10 === 0 || i === totalSteps - 1) {
      const sample = generateSample(logits)
      const sampleLoss = computeCrossEntropyLoss(computeSoftmax(logits).probabilities, 3)
      outputLog.value = [...outputLog.value, { step: stepCount.value, tokens: sample, loss: sampleLoss }]
    }

    if (i % 5 === 4 || i === totalSteps - 1) {
      currentLogits.value = [...logits]
      adamState.value = state
      await new Promise(resolve => requestAnimationFrame(resolve))
    }
  }

  currentLogits.value = [...logits]
  adamState.value = state
  isTraining.value = false
}

const lossChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis' as const,
    backgroundColor: '#2a2740',
    borderColor: '#363254',
    textStyle: { color: '#e2e0ea', fontSize: 12 },
    formatter: (params: any) => {
      const item = params[0]
      return `Step ${item.dataIndex}: Loss = ${Number(item.value).toFixed(4)}`
    },
  },
  grid: { left: 50, right: 16, top: 16, bottom: 36 },
  xAxis: {
    type: 'category' as const,
    data: lossHistory.value.map((_: number, i: number) => i),
    name: 'training step',
    nameLocation: 'middle' as const,
    nameGap: 22,
    nameTextStyle: { color: '#9e9bb0', fontSize: 11 },
    axisLabel: { color: '#9e9bb0', fontSize: 10 },
    axisLine: { lineStyle: { color: '#363254' } },
  },
  yAxis: {
    type: 'value' as const,
    name: 'loss',
    nameTextStyle: { color: '#9e9bb0', fontSize: 11 },
    axisLabel: { color: '#9e9bb0', fontSize: 10 },
    splitLine: { lineStyle: { color: '#363254', type: 'dashed' as const } },
    min: 0,
  },
  series: [{
    type: 'line' as const,
    data: lossHistory.value,
    smooth: true,
    symbol: 'none',
    lineStyle: { color: '#6366f1', width: 2.5 },
    areaStyle: {
      color: {
        type: 'linear' as const,
        x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: 'rgba(99,102,241,0.35)' },
          { offset: 1, color: 'rgba(99,102,241,0)' },
        ],
      },
    },
  }],
}))
</script>

<template>
  <div class="space-y-6">
    <!-- Overview -->
    <div class="rounded-lg border border-surface-lighter bg-surface-light/50 p-4 text-sm text-text-secondary">
      <strong class="text-text-primary">The full loop:</strong>
      Real training isn't a single gradient step — it's millions of repetitions.
      Each iteration: compute logits → softmax → loss → gradient → update logits → repeat.
      Watch the loss curve fall as the model learns to predict "fish" from the example context.
    </div>

    <!-- Controls row: learning rate + toggles -->
    <div class="grid gap-4 md:grid-cols-2">
      <div class="rounded-lg bg-surface-light p-4">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-medium text-text-secondary">Learning rate &eta;</h4>
          <span class="font-mono text-sm text-brand-light">{{ learningRate.toFixed(2) }}</span>
        </div>
        <input
          type="range"
          min="0.05"
          max="2.0"
          step="0.05"
          v-model.number="learningRate"
          class="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-lighter accent-brand"
        />
        <div class="mt-1 flex justify-between text-xs text-text-secondary">
          <span>0.05 (slow)</span>
          <span>2.0 (fast / may oscillate)</span>
        </div>
      </div>
      <div class="space-y-3 rounded-lg bg-surface-light p-4">
        <label class="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            v-model="useMultiExample"
            class="h-4 w-4 rounded border-surface-lighter accent-brand"
          />
          <span class="text-sm text-text-secondary">
            <strong class="text-text-primary">Multi-example training</strong>
            <span class="block text-xs">Cycle through all {{ TRAINING_EXAMPLES.length }} training examples</span>
          </span>
        </label>
        <label class="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            v-model="useAdamOptimizer"
            class="h-4 w-4 rounded border-surface-lighter accent-brand"
          />
          <span class="text-sm text-text-secondary">
            <strong class="text-text-primary">Use Adam optimizer</strong>
            <span class="block text-xs">Momentum + adaptive learning rates</span>
          </span>
        </label>
      </div>
    </div>

    <!-- Training controls -->
    <div class="flex flex-wrap items-center gap-3">
      <button
        @click="runSteps(1)"
        :disabled="isTraining"
        class="rounded-lg border border-brand/50 bg-brand/10 px-4 py-2.5 text-sm font-semibold text-brand-light transition hover:bg-brand/20 disabled:opacity-50"
      >
        Run 1 step
      </button>
      <button
        @click="runSteps(10)"
        :disabled="isTraining"
        class="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
      >
        {{ isTraining ? 'Training...' : 'Run 10 steps' }}
      </button>
      <button
        @click="runSteps(100)"
        :disabled="isTraining"
        class="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
      >
        Run 100 steps
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
        &mdash; Loss: <span class="font-mono" :class="currentLoss < 0.5 ? 'text-positive' : currentLoss > 2 ? 'text-negative' : 'text-warning'">{{ currentLoss.toFixed(4) }}</span>
      </div>
    </div>

    <!-- Loss curve -->
    <div v-if="lossHistory.length > 1" class="space-y-2">
      <h4 class="text-sm font-medium text-text-secondary">Loss over training steps</h4>
      <div class="h-52 w-full">
        <VChart :option="lossChartOption" autoresize class="h-full w-full" />
      </div>
    </div>

    <!-- Generated output evolution -->
    <div v-if="outputLog.length > 0" class="rounded-lg bg-surface-light p-4">
      <h4 class="mb-3 text-sm font-medium text-text-secondary">
        Output evolution: "the cat ate ___"
      </h4>
      <div class="max-h-48 space-y-1 overflow-y-auto pr-2">
        <div
          v-for="entry in outputLog"
          :key="entry.step"
          class="flex items-center gap-3 rounded px-2 py-1 text-sm"
          :class="entry.step === 0 ? 'bg-surface' : ''"
        >
          <span class="w-16 shrink-0 font-mono text-xs text-text-secondary">
            step {{ entry.step }}
          </span>
          <div class="flex gap-1">
            <span
              v-for="(token, ti) in entry.tokens"
              :key="ti"
              class="rounded px-1.5 py-0.5 font-mono text-xs font-semibold"
              :style="{
                color: TOKEN_COLORS[TOKENS.indexOf(token as typeof TOKENS[number])],
                backgroundColor: TOKEN_COLORS[TOKENS.indexOf(token as typeof TOKENS[number])] + '20',
              }"
            >{{ token }}</span>
          </div>
          <span class="ml-auto font-mono text-xs" :class="entry.loss < 0.5 ? 'text-positive' : entry.loss > 2 ? 'text-negative' : 'text-text-secondary'">
            {{ entry.loss.toFixed(3) }}
          </span>
        </div>
      </div>
      <p class="mt-2 text-xs text-text-secondary">
        Each row samples 4 tokens from the current distribution. Early on the output is random;
        as training progresses, the model increasingly predicts "fish" for this context.
      </p>
    </div>

    <!-- Logits and probabilities side by side -->
    <div class="grid gap-6 md:grid-cols-2">
      <div>
        <h4 class="mb-2 text-sm font-medium text-text-secondary">Current logits</h4>
        <BarChart
          :labels="labels"
          :values="currentLogits"
          :colors="TOKEN_COLORS"
          :precision="3"
          y-axis-label="logit"
          :y-min="-2"
          :y-max="8"
        />
      </div>
      <div>
        <h4 class="mb-2 text-sm font-medium text-text-secondary">Current probabilities</h4>
        <BarChart
          :labels="labels"
          :values="currentProbs"
          :colors="TOKEN_COLORS"
          :precision="3"
          y-axis-label="probability"
          :y-min="0"
          :y-max="1"
        />
      </div>
    </div>

    <!-- Current state summary -->
    <div class="grid grid-cols-4 gap-3">
      <div
        v-for="(token, index) in TOKENS"
        :key="token"
        class="rounded-lg bg-surface-light p-3 text-center"
        :class="index === currentTargetIndex ? 'ring-1 ring-positive/40' : ''"
      >
        <div class="font-mono font-semibold" :style="{ color: TOKEN_COLORS[index] }">{{ token }}</div>
        <div v-if="index === currentTargetIndex" class="text-xs text-positive">target ✓</div>
        <div class="mt-1 font-mono text-sm text-text-primary">{{ (currentProbs[index] * 100).toFixed(1) }}%</div>
      </div>
    </div>

    <!-- Insights -->
    <div class="rounded-lg border border-brand/30 bg-brand/5 p-4 text-sm text-text-secondary">
      <strong class="text-brand-light">Try it:</strong>
      Click "Run 100 steps" and watch the loss curve drop sharply at first, then flatten.
      Notice how "fish" (the target) gains probability while the others fall.
      Then reset and try learning rate 2.0 — at high learning rates, the loss may oscillate or explode
      rather than converge. This is why choosing a good learning rate matters so much.
    </div>
  </div>
</template>
