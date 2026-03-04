<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { HeatmapChart, ScatterChart, LineChart as ELineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, VisualMapComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { computeSoftmax } from '../../engine/softmax'
import { computeCrossEntropyLoss } from '../../engine/loss'
import { computeGradient } from '../../engine/gradient'

use([HeatmapChart, ScatterChart, ELineChart, GridComponent, TooltipComponent, VisualMapComponent, CanvasRenderer])

const props = defineProps<{
  learningRate: number
}>()

// Grid parameters
const RANGE_MIN = -1
const RANGE_MAX = 7
const GRID_SIZE = 60
const CELL_STEP = (RANGE_MAX - RANGE_MIN) / GRID_SIZE

// Fixed logits for z_the and z_cat
const Z_THE = 0.1
const Z_CAT = 0.5
const TARGET_INDEX = 3 // 'fish'

// Token indices: 0=the, 1=cat, 2=ate, 3=fish
// x-axis = z_ate (index 2), y-axis = z_fish (index 3)

// Compute static loss grid (category indices for heatmap)
const heatmapData: [number, number, number][] = []
for (let yi = 0; yi < GRID_SIZE; yi++) {
  const zFish = RANGE_MIN + (yi + 0.5) * CELL_STEP
  for (let xi = 0; xi < GRID_SIZE; xi++) {
    const zAte = RANGE_MIN + (xi + 0.5) * CELL_STEP
    const logits = [Z_THE, Z_CAT, zAte, zFish]
    const { probabilities } = computeSoftmax(logits)
    const loss = computeCrossEntropyLoss(probabilities, TARGET_INDEX)
    heatmapData.push([xi, yi, loss])
  }
}

// Category labels (needed by ECharts but we hide them)
const axisCategories = Array.from({ length: GRID_SIZE }, (_, i) =>
  (RANGE_MIN + (i + 0.5) * CELL_STEP).toFixed(1)
)

// Convert real coordinates to category-space for the path overlay
function toCategory(coord: number): number {
  return (coord - RANGE_MIN) / CELL_STEP - 0.5
}

// Gradient descent path computation
function computePath(lr: number): { x: number; y: number; loss: number }[] {
  const steps: { x: number; y: number; loss: number }[] = []
  let zAte = 1.0
  let zFish = 2.0

  for (let i = 0; i <= 40; i++) {
    const logits = [Z_THE, Z_CAT, zAte, zFish]
    const { probabilities } = computeSoftmax(logits)
    const loss = computeCrossEntropyLoss(probabilities, TARGET_INDEX)
    steps.push({ x: zAte, y: zFish, loss })

    if (i < 40) {
      const { gradient } = computeGradient(probabilities, TARGET_INDEX)
      zAte -= lr * gradient[2]
      zFish -= lr * gradient[3]
    }
  }

  return steps
}

// Animation state
const currentStep = ref(0)
const isRunning = ref(false)
let animationTimer: ReturnType<typeof setInterval> | null = null

const path = computed(() => computePath(props.learningRate))

// Path data mapped to category-space so it aligns with the heatmap
const visibleTrail = computed(() =>
  path.value.slice(0, currentStep.value + 1).map(p => [toCategory(p.x), toCategory(p.y)])
)

const currentDot = computed(() => {
  const p = path.value[currentStep.value]
  return p ? [[toCategory(p.x), toCategory(p.y)]] : []
})

function startDescent() {
  stopDescent()
  currentStep.value = 0
  isRunning.value = true
  animationTimer = setInterval(() => {
    if (currentStep.value < path.value.length - 1) {
      currentStep.value++
    } else {
      stopDescent()
    }
  }, 80)
}

function stopDescent() {
  if (animationTimer !== null) {
    clearInterval(animationTimer)
    animationTimer = null
  }
  isRunning.value = false
}

function resetDescent() {
  stopDescent()
  currentStep.value = 0
}

onBeforeUnmount(() => stopDescent())

// Show clean integer labels at evenly spaced positions
const labelInterval = Math.round(1 / CELL_STEP) - 1 // show every ~1.0 unit

const chartOption = computed(() => ({
  tooltip: {
    trigger: 'item' as const,
    backgroundColor: '#2a2740',
    borderColor: '#363254',
    textStyle: { color: '#e2e0ea', fontSize: 12 },
    formatter: (params: any) => {
      if (params.seriesType === 'heatmap') {
        const zAte = axisCategories[params.data[0]]
        const zFish = axisCategories[params.data[1]]
        return `z<sub>ate</sub> = ${zAte}<br/>z<sub>fish</sub> = ${zFish}<br/>Loss = ${params.data[2].toFixed(3)}`
      }
      if (params.seriesType === 'scatter') {
        const p = path.value[currentStep.value]
        if (p) {
          return `z<sub>ate</sub> = ${p.x.toFixed(3)}<br/>z<sub>fish</sub> = ${p.y.toFixed(3)}<br/>Loss = ${p.loss.toFixed(3)}`
        }
      }
      return ''
    },
  },
  grid: {
    left: 40,
    right: 70,
    top: 12,
    bottom: 32,
  },
  xAxis: {
    type: 'category' as const,
    data: axisCategories,
    gridIndex: 0,
    axisLine: { lineStyle: { color: '#363254' } },
    axisTick: { show: false },
    axisLabel: {
      color: '#9e9bb0',
      fontSize: 10,
      interval: labelInterval,
      formatter: (val: string) => Math.round(Number(val)).toString(),
    },
    name: 'z_ate',
    nameLocation: 'middle' as const,
    nameGap: 20,
    nameTextStyle: { color: '#9e9bb0', fontSize: 12 },
  },
  yAxis: {
    type: 'category' as const,
    data: axisCategories,
    gridIndex: 0,
    axisLine: { lineStyle: { color: '#363254' } },
    axisTick: { show: false },
    axisLabel: {
      color: '#9e9bb0',
      fontSize: 10,
      interval: labelInterval,
      formatter: (val: string) => Math.round(Number(val)).toString(),
    },
    name: 'z_fish',
    nameTextStyle: { color: '#9e9bb0', fontSize: 12 },
  },
  visualMap: {
    min: 0,
    max: 8,
    calculable: false,
    orient: 'vertical' as const,
    right: 0,
    top: 'center' as const,
    itemHeight: 140,
    text: ['high', 'low'],
    textStyle: { color: '#9e9bb0', fontSize: 10 },
    inRange: {
      color: ['#1e1b4b', '#312e81', '#4338ca', '#7c3aed', '#c026d3', '#e11d48', '#f97316', '#fbbf24'],
    },
  },
  series: [
    // Heatmap (background loss surface)
    {
      type: 'heatmap' as const,
      data: heatmapData,
      emphasis: {
        itemStyle: { borderColor: '#fff', borderWidth: 1 },
      },
    },
    // Trail line (uses category-space coordinates via scatter with lines)
    {
      type: 'line' as const,
      data: visibleTrail.value,
      symbol: 'none',
      lineStyle: { color: 'rgba(255, 255, 255, 0.7)', width: 2 },
      silent: true,
      z: 10,
    },
    // Current position dot
    {
      type: 'scatter' as const,
      data: currentDot.value,
      symbolSize: 14,
      itemStyle: {
        color: '#ffffff',
        borderColor: '#000',
        borderWidth: 2,
        shadowColor: 'rgba(0, 0, 0, 0.5)',
        shadowBlur: 6,
      },
      z: 20,
    },
  ],
}))
</script>

<template>
  <div class="space-y-3">
    <div class="h-80 w-full sm:h-96">
      <VChart :option="chartOption" autoresize class="h-full w-full" />
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <button
        v-if="!isRunning"
        @click="startDescent()"
        class="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
      >
        Run descent
      </button>
      <button
        v-else
        @click="stopDescent()"
        class="rounded-lg bg-negative/20 border border-negative px-4 py-2 text-sm font-semibold text-negative transition hover:bg-negative/30"
      >
        Pause
      </button>
      <button
        @click="resetDescent()"
        class="rounded-lg border border-surface-lighter bg-surface-light px-4 py-2 text-sm text-text-secondary transition hover:border-brand hover:text-text-primary"
      >
        Reset
      </button>
      <span v-if="currentStep > 0" class="text-sm text-text-secondary">
        Step {{ currentStep }} / {{ path.length - 1 }}
        &mdash; Loss: {{ path[currentStep].loss.toFixed(3) }}
      </span>
    </div>
  </div>
</template>
