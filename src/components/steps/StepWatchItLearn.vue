<script setup lang="ts">
import { ref, computed } from 'vue'
import { ToyModel, TRAINING_EXAMPLES, type Prediction } from '../../engine/toy-model'
import { TOKENS, TOKEN_COLORS } from '../../engine/types'
import Callout from '../ui/Callout.vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { LineChart as ELineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([ELineChart, GridComponent, TooltipComponent, CanvasRenderer])

// ── Model state ──────────────────────────────────────────────────────
let model = new ToyModel(42)
const learningRate = ref(0.5)
const stepCount = ref(0)
const isTraining = ref(false)

// Loss history: one entry per epoch (= 3 training steps)
const lossHistory = ref<number[]>([])
// Predictions after each epoch
const predictions = ref<Prediction[]>(model.predictAll())
// Average loss across all 3 examples
const avgLoss = computed(() => {
  const preds = predictions.value
  return preds.reduce((sum, p) => sum + p.loss, 0) / preds.length
})

// ── Training ─────────────────────────────────────────────────────────
async function train(epochs: number) {
  if (isTraining.value) return
  isTraining.value = true

  // Record initial state if first time
  if (lossHistory.value.length === 0) {
    lossHistory.value.push(avgLoss.value)
  }

  for (let epoch = 0; epoch < epochs; epoch++) {
    // One epoch = train on all 3 examples
    for (const example of TRAINING_EXAMPLES) {
      model.trainStep(example, learningRate.value)
    }
    stepCount.value += 3

    // Record metrics after each epoch
    const preds = model.predictAll()
    predictions.value = preds
    const loss = preds.reduce((sum, p) => sum + p.loss, 0) / preds.length
    lossHistory.value = [...lossHistory.value, loss]

    // Yield to UI every 5 epochs
    if (epoch % 5 === 4 || epoch === epochs - 1) {
      await new Promise(resolve => requestAnimationFrame(resolve))
    }
  }

  isTraining.value = false
}

function reset() {
  model = new ToyModel(42)
  stepCount.value = 0
  lossHistory.value = []
  predictions.value = model.predictAll()
  generatedTokens.value = []
}

// ── Generation ───────────────────────────────────────────────────────
const generatedTokens = ref<number[]>([])
const isGenerating = ref(false)

const generationContext = computed(() => {
  const base = [0] // start with "the"
  return [...base, ...generatedTokens.value]
})

const canGenerate = computed(() => {
  return generationContext.value.length < 4 && !isGenerating.value
})

const generationComplete = computed(() => {
  return generationContext.value.length >= 4
})

// Probabilities for current generation context
const generationProbs = ref<number[]>([])

async function generateNext() {
  if (!canGenerate.value) return
  isGenerating.value = true

  // Run forward pass on current context
  const context = generationContext.value
  model.forward(context)
  const probs = model.probs
  generationProbs.value = probs

  await new Promise(resolve => setTimeout(resolve, 400))

  // Sample from distribution
  const r = Math.random()
  let cumulative = 0
  let sampled = probs.length - 1
  for (let i = 0; i < probs.length; i++) {
    cumulative += probs[i]
    if (r < cumulative) {
      sampled = i
      break
    }
  }

  generatedTokens.value = [...generatedTokens.value, sampled]
  isGenerating.value = false
}

function resetGeneration() {
  generatedTokens.value = []
  generationProbs.value = []
}

// ── Color helpers ────────────────────────────────────────────────────
function probColor(p: number): string {
  if (p > 0.6) return '#34d399'
  if (p > 0.3) return '#fbbf24'
  return '#f87171'
}

function lossColor(loss: number): string {
  if (loss < 0.5) return 'text-positive'
  if (loss > 2) return 'text-negative'
  return 'text-warning'
}

// ── Loss curve chart ─────────────────────────────────────────────────
const lossChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis' as const,
    backgroundColor: '#2a2740',
    borderColor: '#363254',
    textStyle: { color: '#e2e0ea', fontSize: 12 },
    formatter: (params: any) => {
      const item = params[0]
      return `Epoch ${item.dataIndex}: Loss = ${Number(item.value).toFixed(4)}`
    },
  },
  grid: { left: 50, right: 16, top: 16, bottom: 36 },
  xAxis: {
    type: 'category' as const,
    data: lossHistory.value.map((_: number, i: number) => i),
    name: 'epoch',
    nameLocation: 'middle' as const,
    nameGap: 22,
    nameTextStyle: { color: '#9e9bb0', fontSize: 11 },
    axisLabel: { color: '#9e9bb0', fontSize: 10 },
    axisLine: { lineStyle: { color: '#363254' } },
  },
  yAxis: {
    type: 'value' as const,
    name: 'avg loss',
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
    lineStyle: { color: '#f87171', width: 2.5 },
    areaStyle: {
      color: {
        type: 'linear' as const,
        x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: 'rgba(248,113,113,0.35)' },
          { offset: 1, color: 'rgba(248,113,113,0)' },
        ],
      },
    },
  }],
}))
</script>

<template>
  <div class="space-y-6">
    <!-- Controls -->
    <div class="grid gap-4 md:grid-cols-2">
      <!-- Learning rate slider -->
      <div class="rounded-lg bg-surface-light p-4">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-medium text-text-secondary">Learning rate</h4>
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
          <span>2.0 (fast)</span>
        </div>
      </div>

      <!-- Status -->
      <div class="flex flex-col justify-center rounded-lg bg-surface-light p-4">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <div class="text-xs text-text-secondary">Training steps</div>
            <div class="font-mono text-lg text-text-primary">{{ stepCount }}</div>
          </div>
          <div>
            <div class="text-xs text-text-secondary">Average loss</div>
            <div class="font-mono text-lg" :class="lossColor(avgLoss)">
              {{ avgLoss.toFixed(4) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Training buttons -->
    <div class="flex flex-wrap items-center gap-3">
      <button
        @click="train(10)"
        :disabled="isTraining"
        class="rounded-lg border border-brand/50 bg-brand/10 px-4 py-2.5 text-sm font-semibold text-brand-light transition hover:bg-brand/20 disabled:opacity-50"
      >
        Train 10 epochs
      </button>
      <button
        @click="train(50)"
        :disabled="isTraining"
        class="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
      >
        {{ isTraining ? 'Training...' : 'Train 50 epochs' }}
      </button>
      <button
        @click="train(200)"
        :disabled="isTraining"
        class="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
      >
        Train 200 epochs
      </button>
      <button
        @click="reset"
        :disabled="isTraining"
        class="rounded-lg border border-surface-lighter bg-surface-light px-4 py-2.5 text-sm text-text-secondary transition hover:border-brand hover:text-text-primary disabled:opacity-50"
      >
        Reset
      </button>
    </div>

    <!-- Loss curve -->
    <div v-if="lossHistory.length > 1" class="space-y-2">
      <h4 class="text-sm font-medium text-text-secondary">Loss over training</h4>
      <div class="h-52 w-full">
        <VChart :option="lossChartOption" autoresize class="h-full w-full" />
      </div>
    </div>

    <!-- Predictions table -->
    <div class="space-y-2">
      <h4 class="text-sm font-medium text-text-secondary">Predictions on training examples</h4>
      <div class="space-y-2">
        <div
          v-for="(pred, i) in predictions"
          :key="i"
          class="flex items-center gap-4 rounded-lg bg-surface-light px-4 py-3"
        >
          <!-- Context -->
          <div class="flex items-center gap-1.5 shrink-0">
            <span
              v-for="tokenId in pred.context"
              :key="tokenId"
              class="rounded bg-surface px-2 py-0.5 font-mono text-xs"
              :style="{ color: TOKEN_COLORS[tokenId] }"
            >{{ TOKENS[tokenId] }}</span>
            <span class="text-text-secondary">&rarr;</span>
          </div>

          <!-- Target and probability -->
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <span
              class="font-mono text-sm font-bold"
              :style="{ color: TOKEN_COLORS[pred.target] }"
            >{{ TOKENS[pred.target] }}</span>
            <div class="flex-1 min-w-0">
              <div class="h-2 rounded-full bg-surface overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :style="{
                    width: `${Math.min(pred.targetProb * 100, 100)}%`,
                    backgroundColor: probColor(pred.targetProb),
                  }"
                />
              </div>
            </div>
            <span
              class="font-mono text-sm font-bold shrink-0"
              :style="{ color: probColor(pred.targetProb) }"
            >{{ (pred.targetProb * 100).toFixed(1) }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Generation section -->
    <div class="rounded-lg border border-surface-lighter bg-surface-light p-5 space-y-4">
      <h4 class="text-sm font-medium text-text-primary">Generate text</h4>
      <p class="text-sm text-text-secondary">
        After training, use the model to generate tokens autoregressively — the same process described in the previous step.
      </p>

      <!-- Generated sequence -->
      <div class="flex flex-wrap items-center gap-2 min-h-[2.5rem]">
        <!-- Always starts with "the" -->
        <span
          class="rounded bg-surface px-2.5 py-1 font-mono text-sm"
          :style="{ color: TOKEN_COLORS[0] }"
        >the</span>

        <!-- Generated tokens -->
        <span
          v-for="(tokenId, i) in generatedTokens"
          :key="i"
          class="rounded px-2.5 py-1 font-mono text-sm font-bold transition-all duration-300"
          :style="{
            color: TOKEN_COLORS[tokenId],
            backgroundColor: TOKEN_COLORS[tokenId] + '25',
            border: `1px solid ${TOKEN_COLORS[tokenId]}50`,
          }"
        >{{ TOKENS[tokenId] }}</span>

        <!-- Thinking indicator -->
        <span v-if="isGenerating" class="animate-pulse text-text-secondary">...</span>

        <!-- Cursor -->
        <span v-else-if="canGenerate" class="h-5 w-0.5 animate-pulse bg-brand-light" />

        <!-- Done -->
        <span v-else-if="generationComplete" class="text-xs text-positive font-medium">
          complete
        </span>
      </div>

      <!-- Generation controls -->
      <div class="flex flex-wrap items-center gap-3">
        <button
          @click="generateNext"
          :disabled="!canGenerate"
          class="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
        >
          {{ isGenerating ? 'Sampling...' : 'Generate next token' }}
        </button>
        <button
          v-if="generatedTokens.length > 0"
          @click="resetGeneration"
          :disabled="isGenerating"
          class="rounded-lg border border-surface-lighter bg-surface px-4 py-2.5 text-sm text-text-secondary transition hover:border-brand hover:text-text-primary disabled:opacity-50"
        >
          Reset generation
        </button>
      </div>

      <!-- Show probabilities during generation -->
      <div v-if="generationProbs.length > 0 && generatedTokens.length > 0" class="grid grid-cols-4 gap-2">
        <div
          v-for="(token, index) in TOKENS"
          :key="token"
          class="rounded bg-surface p-2 text-center"
          :class="generatedTokens[generatedTokens.length - 1] === index ? 'ring-1 ring-brand' : ''"
        >
          <div class="font-mono text-xs font-semibold" :style="{ color: TOKEN_COLORS[index] }">{{ token }}</div>
          <div
            class="mt-0.5 font-mono text-sm font-bold"
            :style="{ color: probColor(generationProbs[index]) }"
          >{{ (generationProbs[index] * 100).toFixed(1) }}%</div>
        </div>
      </div>
    </div>

    <!-- Callouts -->
    <Callout variant="brand" title="Try it:">
      Click "Train 200 epochs" and watch the loss fall and the prediction bars fill up.
      Once all three predictions are above 90%, try generating — a well-trained model
      should reproduce "the cat ate fish" reliably. Then reset and try a very high
      learning rate (2.0) to see what happens when training diverges.
    </Callout>

    <Callout variant="subtle" title="Why this works:">
      This model has {{ ToyModel.PARAM_COUNT }} parameters — tiny, but enough to memorise
      three training examples. Real language models use the same algorithm on billions of
      parameters and trillions of examples. The principles are identical; only the scale
      and architecture complexity differ.
    </Callout>
  </div>
</template>
