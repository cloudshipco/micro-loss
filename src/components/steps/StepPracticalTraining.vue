<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { LineChart as ELineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import Callout from '../ui/Callout.vue'

use([ELineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])

// Synthetic train/val loss curves that diverge after epoch ~30
const trainLoss = computed(() => {
  const points: number[][] = []
  for (let e = 0; e <= 60; e++) {
    // Exponential decay with a small floor
    const loss = 2.0 * Math.exp(-0.08 * e) + 0.05 + 0.02 * Math.sin(e * 0.3)
    points.push([e, Math.max(0.03, loss)])
  }
  return points
})

const valLoss = computed(() => {
  const points: number[][] = []
  for (let e = 0; e <= 60; e++) {
    // Follows training loss initially, then diverges upward
    const base = 2.0 * Math.exp(-0.06 * e) + 0.1
    const overfit = e > 25 ? 0.012 * (e - 25) ** 1.3 : 0
    const noise = 0.03 * Math.sin(e * 0.5 + 1)
    points.push([e, Math.max(0.08, base + overfit + noise)])
  }
  return points
})

const chartOption = computed(() => ({
  tooltip: {
    trigger: 'axis' as const,
    backgroundColor: '#2a2740',
    borderColor: '#363254',
    textStyle: { color: '#e2e0ea' },
    formatter: (params: any) => {
      const items = Array.isArray(params) ? params : [params]
      const epoch = Math.round(Number(items[0].value[0]))
      const lines = [`Epoch ${epoch}`]
      for (const item of items) {
        lines.push(`${item.marker} ${item.seriesName}: ${Number(item.value[1]).toFixed(3)}`)
      }
      return lines.join('<br/>')
    },
  },
  legend: {
    textStyle: { color: '#9e9bb0' },
    top: 0,
  },
  grid: { left: 55, right: 20, top: 35, bottom: 40 },
  xAxis: {
    type: 'value' as const,
    name: 'Epoch',
    nameLocation: 'middle' as const,
    nameGap: 25,
    nameTextStyle: { color: '#9e9bb0' },
    min: 0,
    max: 60,
    axisLabel: { color: '#9e9bb0' },
    axisLine: { lineStyle: { color: '#363254' } },
    splitLine: { show: false },
  },
  yAxis: {
    type: 'value' as const,
    name: 'Loss',
    nameTextStyle: { color: '#9e9bb0' },
    min: 0,
    axisLabel: { color: '#9e9bb0' },
    splitLine: { lineStyle: { color: '#363254', type: 'dashed' as const } },
  },
  series: [
    {
      name: 'Training loss',
      type: 'line' as const,
      data: trainLoss.value,
      smooth: true,
      symbol: 'none',
      lineStyle: { color: '#6366f1', width: 2 },
    },
    {
      name: 'Validation loss',
      type: 'line' as const,
      data: valLoss.value,
      smooth: true,
      symbol: 'none',
      lineStyle: { color: '#f87171', width: 2, type: 'dashed' as const },
    },
  ],
}))
</script>

<template>
  <div class="space-y-6">

    <!-- Data splits -->
    <div class="rounded-lg bg-surface-light p-5">
      <h4 class="mb-3 text-sm font-medium text-text-secondary">The data split</h4>
      <div class="flex gap-1 rounded-lg overflow-hidden h-8 mb-3">
        <div class="bg-brand/60 flex items-center justify-center text-xs font-semibold text-white" style="width: 70%">
          Training (70%)
        </div>
        <div class="bg-[#f59e0b]/60 flex items-center justify-center text-xs font-semibold text-white" style="width: 15%">
          Val (15%)
        </div>
        <div class="bg-[#f87171]/60 flex items-center justify-center text-xs font-semibold text-white" style="width: 15%">
          Test (15%)
        </div>
      </div>
      <p class="text-sm text-text-secondary">
        Real training never uses all the data for learning. The dataset is split into three parts:
        <strong class="text-text-primary">training</strong> data that the model learns from,
        <strong class="text-text-primary">validation</strong> data used to monitor progress during training
        (the model never learns from this), and
        <strong class="text-text-primary">test</strong> data held back until the very end to measure
        final performance. The exact proportions vary — 70/15/15 is typical.
      </p>
    </div>

    <!-- Overfitting explanation + chart -->
    <div class="rounded-lg bg-surface-light p-5">
      <h4 class="mb-3 text-sm font-medium text-text-secondary">Why hold data back?</h4>
      <p class="mb-4 text-sm text-text-secondary">
        If you only measured loss on the training data, a model could appear perfect — it simply
        memorises every example. This is called <strong class="text-text-primary">overfitting</strong>:
        the model performs well on data it has seen but poorly on anything new. The validation set
        catches this because the model has never trained on it.
      </p>
      <p class="mb-4 text-sm text-text-secondary">
        The chart below shows a classic overfitting signature: training loss keeps falling, but
        validation loss eventually <em>rises</em>. The point where they diverge is where the model
        starts memorising rather than learning general patterns. In practice, training is often stopped
        when validation loss begins to increase — a technique called <strong class="text-text-primary">early stopping</strong>.
      </p>
    </div>

    <!-- Loss divergence chart -->
    <div class="rounded-lg bg-surface-light p-4">
      <div class="h-64 w-full">
        <VChart :option="chartOption" autoresize class="h-full w-full" />
      </div>
      <p class="mt-3 text-xs text-text-secondary">
        Synthetic example. Around epoch 30, validation loss starts climbing while training loss
        continues to fall — the hallmark of overfitting.
      </p>
    </div>

    <Callout variant="brand" title="Our toy model:">
      With only 268 parameters and 3 training examples, our tutorial model is too small to
      meaningfully overfit. But at real scale — billions of parameters, trillions of tokens —
      these techniques are essential. Every production model uses validation monitoring, and most
      use some form of early stopping or regularisation to prevent overfitting.
    </Callout>
  </div>
</template>
