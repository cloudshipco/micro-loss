<script setup lang="ts">
import { ref, computed } from 'vue'
import katex from 'katex'
import { createTutorialState, provideTutorialState } from '../../composables/useTutorialState'

const km = (latex: string) => katex.renderToString(latex, { throwOnError: false, displayMode: false })
import { useAnimatedUpdate } from '../../composables/useAnimatedUpdate'
import { computeSoftmax } from '../../engine/softmax'
import { computeCrossEntropyLoss } from '../../engine/loss'
import { computeGradient } from '../../engine/gradient'
import { computeUpdate } from '../../engine/update'
import BarChart from '../charts/BarChart.vue'
import LearningRateSlider from '../ui/LearningRateSlider.vue'
import FormulaLegend from '../ui/FormulaLegend.vue'
import ValueDisplay from '../ui/ValueDisplay.vue'
import Callout from '../ui/Callout.vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { LineChart as ELineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([ELineChart, GridComponent, TooltipComponent, CanvasRenderer])

const state = createTutorialState()
provideTutorialState(state)
const { isAnimating, beforeLoss, afterLoss, animateStep } = useAnimatedUpdate(state)

const labels = computed(() => [...state.tokens])

const updatePreview = computed(() =>
  state.gradient.value.map(g => -state.learningRate.value * g)
)

// Multi-step training
const lossHistory = ref<number[]>([])
const trainStepCount = ref(0)
const isTraining = ref(false)

function resetTraining() {
  lossHistory.value = []
  trainStepCount.value = 0
  state.resetLogits()
}

async function trainMultipleSteps(totalSteps = 20) {
  if (isTraining.value) return
  isTraining.value = true

  // Record initial loss
  if (lossHistory.value.length === 0) {
    lossHistory.value.push(state.loss.value)
  }

  let currentLogits = [...state.logits.value]
  const targetIdx = state.targetIndex.value
  const lr = state.learningRate.value

  for (let i = 0; i < totalSteps; i++) {
    // Compute forward pass
    const softmaxResult = computeSoftmax(currentLogits)
    const loss = computeCrossEntropyLoss(softmaxResult.probabilities, targetIdx)
    const gradResult = computeGradient(softmaxResult.probabilities, targetIdx)
    const updateResult = computeUpdate(currentLogits, gradResult.gradient, lr)

    currentLogits = updateResult.newLogits

    trainStepCount.value++
    lossHistory.value = [...lossHistory.value, loss]

    // Update the actual state every few steps for visual feedback
    if (i % 4 === 3 || i === totalSteps - 1) {
      state.logits.value = [...currentLogits]
      await new Promise(resolve => requestAnimationFrame(resolve))
    }
  }

  // Final update
  state.logits.value = [...currentLogits]
  lossHistory.value = [...lossHistory.value, state.loss.value]

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
      return `Step ${item.dataIndex}<br/>Loss: ${Number(item.value).toFixed(4)}`
    },
  },
  grid: { left: 50, right: 16, top: 12, bottom: 32 },
  xAxis: {
    type: 'category' as const,
    data: lossHistory.value.map((_: number, i: number) => i),
    name: 'step',
    nameLocation: 'middle' as const,
    nameGap: 18,
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
  series: [
    {
      type: 'line' as const,
      data: lossHistory.value,
      smooth: true,
      symbol: 'none',
      lineStyle: { color: '#6366f1', width: 2 },
      areaStyle: {
        color: {
          type: 'linear' as const,
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(99, 102, 241, 0.3)' },
            { offset: 1, color: 'rgba(99, 102, 241, 0)' },
          ],
        },
      },
    },
  ],
}))
</script>

<template>
  <div class="space-y-6">
    <FormulaLegend
      latex="\textcolor{#93c5fd}{z} \leftarrow \textcolor{#93c5fd}{z} - \textcolor{#6366f1}{\eta}(\textcolor{#34d399}{p} - \textcolor{#fbbf24}{y})"
      :symbols="[
        { symbol: 'z', label: 'logits (current scores)', color: '#93c5fd' },
        { symbol: '\\eta', label: 'learning rate', color: '#6366f1' },
        { symbol: 'p', label: 'predicted probabilities', color: '#34d399' },
        { symbol: 'y', label: 'target (one-hot)', color: '#fbbf24' },
      ]"
    />

    <LearningRateSlider />

    <!-- Update preview -->
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-surface-lighter text-text-secondary">
            <th class="py-2 text-left font-medium">Token</th>
            <th class="py-2 text-right font-medium">Current z</th>
            <th class="py-2 text-right font-medium" v-html="km('-\\eta \\cdot \\text{grad}')"></th>
            <th class="py-2 text-right font-medium">New z</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(token, index) in state.tokens"
            :key="token"
            class="border-b border-surface-lighter/50"
          >
            <td class="py-2 font-semibold" :style="{ color: state.tokenColors[index] }">
              {{ token }}
            </td>
            <td class="py-2 text-right font-mono text-text-primary">
              {{ state.logits.value[index].toFixed(3) }}
            </td>
            <td class="py-2 text-right font-mono" :class="updatePreview[index] > 0 ? 'text-positive' : 'text-negative'">
              {{ updatePreview[index] >= 0 ? '+' : '' }}{{ updatePreview[index].toFixed(3) }}
            </td>
            <td class="py-2 text-right font-mono font-bold text-brand-light">
              {{ (state.logits.value[index] + updatePreview[index]).toFixed(3) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Action buttons -->
    <div class="flex flex-wrap items-center gap-4">
      <button
        @click="animateStep()"
        :disabled="isAnimating || isTraining"
        class="rounded-lg bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
      >
        {{ isAnimating ? 'Applying...' : 'Apply Step' }}
      </button>

      <button
        @click="trainMultipleSteps(20)"
        :disabled="isAnimating || isTraining"
        class="rounded-lg border-2 border-brand bg-brand/10 px-6 py-3 font-semibold text-brand-light transition hover:bg-brand/20 disabled:opacity-50"
      >
        {{ isTraining ? 'Training...' : 'Train 20 Steps' }}
      </button>

      <button
        v-if="lossHistory.length > 0"
        @click="resetTraining()"
        :disabled="isAnimating || isTraining"
        class="rounded-lg border border-surface-lighter bg-surface-light px-4 py-3 text-sm text-text-secondary transition hover:border-brand hover:text-text-primary disabled:opacity-50"
      >
        Reset
      </button>

      <div v-if="beforeLoss !== null && afterLoss !== null && !isTraining" class="flex items-center gap-4 text-sm">
        <span class="text-text-secondary">Loss:</span>
        <span class="font-mono text-negative">{{ beforeLoss.toFixed(4) }}</span>
        <span class="text-text-secondary">&rarr;</span>
        <span class="font-mono text-positive">{{ afterLoss.toFixed(4) }}</span>
        <span class="text-positive">(&darr; {{ (beforeLoss - afterLoss).toFixed(4) }})</span>
      </div>
    </div>

    <!-- Loss history chart -->
    <div v-if="lossHistory.length > 1" class="space-y-2">
      <div class="flex items-center justify-between">
        <h4 class="text-sm font-medium text-text-secondary">Loss over training steps</h4>
        <span class="font-mono text-sm text-text-secondary">
          Step {{ trainStepCount }} &mdash; Loss: {{ lossHistory[lossHistory.length - 1].toFixed(4) }}
        </span>
      </div>
      <div class="h-48 w-full">
        <VChart :option="lossChartOption" autoresize class="h-full w-full" />
      </div>
    </div>

    <BarChart
      :labels="labels"
      :values="state.probabilities.value"
      :colors="state.tokenColors"
      title="Probabilities after update"
      :precision="4"
      y-axis-label="probability"
      :y-min="0"
      :y-max="1"
    />

    <!-- Try it callout -->
    <Callout variant="brand" title="Try it:">
      Click "Train 20 Steps" and watch the loss curve. It drops steeply at first (big easy gains)
      then flattens as the model approaches the optimum. Try adjusting the learning rate:
      too high (> 1.0) and the loss may oscillate; too low (< 0.1) and convergence is slow.
      This is gradient descent in action &mdash; the core algorithm behind all deep learning.
    </Callout>
  </div>
</template>
