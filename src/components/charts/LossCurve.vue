<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { LineChart as ELineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, MarkPointComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([ELineChart, GridComponent, TooltipComponent, MarkPointComponent, CanvasRenderer])

const props = defineProps<{
  currentProbability: number
  currentLoss: number
}>()

// Generate the -log(p) curve
const curvePoints = computed(() => {
  const points: number[][] = []
  for (let p = 0.01; p <= 1.0; p += 0.01) {
    points.push([Math.round(p * 100) / 100, -Math.log(p)])
  }
  return points
})

const option = computed(() => ({
  tooltip: {
    trigger: 'axis' as const,
    backgroundColor: '#2a2740',
    borderColor: '#363254',
    textStyle: { color: '#e2e0ea' },
    formatter: (params: any) => {
      const item = params[0]
      return `p = ${Number(item.value[0]).toFixed(2)}<br/>Loss = ${Number(item.value[1]).toFixed(3)}`
    },
  },
  grid: { left: 60, right: 20, top: 20, bottom: 40 },
  xAxis: {
    type: 'value' as const,
    name: 'p (probability of target)',
    nameLocation: 'middle' as const,
    nameGap: 25,
    nameTextStyle: { color: '#9e9bb0' },
    min: 0,
    max: 1,
    axisLabel: { color: '#9e9bb0' },
    axisLine: { lineStyle: { color: '#363254' } },
    splitLine: { show: false },
  },
  yAxis: {
    type: 'value' as const,
    name: '-log(p)',
    nameTextStyle: { color: '#9e9bb0' },
    max: 5,
    axisLabel: { color: '#9e9bb0' },
    splitLine: { lineStyle: { color: '#363254', type: 'dashed' as const } },
  },
  series: [
    {
      type: 'line' as const,
      data: curvePoints.value,
      smooth: true,
      symbol: 'none',
      lineStyle: { color: '#6366f1', width: 2 },
      areaStyle: { color: { type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(99, 102, 241, 0.3)' }, { offset: 1, color: 'rgba(99, 102, 241, 0)' }] } },
    },
    {
      type: 'line' as const,
      data: [[props.currentProbability, props.currentLoss]],
      symbol: 'circle',
      symbolSize: 14,
      itemStyle: { color: '#f59e0b', borderColor: '#fff', borderWidth: 2 },
      label: {
        show: true,
        formatter: `Loss = ${props.currentLoss.toFixed(3)}`,
        position: 'top' as const,
        color: '#f59e0b',
        fontWeight: 'bold' as const,
      },
    },
  ],
}))
</script>

<template>
  <div class="h-64 w-full">
    <VChart :option="option" autoresize class="h-full w-full" />
  </div>
</template>
