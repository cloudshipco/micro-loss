<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { BarChart as EBarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, TitleComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([EBarChart, GridComponent, TooltipComponent, TitleComponent, CanvasRenderer])

const props = defineProps<{
  labels: string[]
  values: number[]
  colors: readonly string[]
  title?: string
  precision?: number
  yAxisLabel?: string
  yMin?: number
  yMax?: number
}>()

const option = computed(() => ({
  tooltip: {
    trigger: 'axis' as const,
    backgroundColor: '#2a2740',
    borderColor: '#363254',
    textStyle: { color: '#e2e0ea' },
    formatter: (params: any) => {
      const item = params[0]
      return `${item.name}: <strong>${Number(item.value).toFixed(props.precision ?? 2)}</strong>`
    },
  },
  grid: { left: 60, right: 20, top: props.title ? 40 : 20, bottom: 30 },
  ...(props.title ? { title: { text: props.title, left: 'center', textStyle: { color: '#e2e0ea', fontSize: 14, fontWeight: 500 } } } : {}),
  xAxis: {
    type: 'category' as const,
    data: props.labels,
    axisLabel: { color: '#9e9bb0' },
    axisLine: { lineStyle: { color: '#363254' } },
  },
  yAxis: {
    type: 'value' as const,
    axisLabel: { color: '#9e9bb0' },
    splitLine: { lineStyle: { color: '#363254', type: 'dashed' as const } },
    ...(props.yAxisLabel ? { name: props.yAxisLabel, nameTextStyle: { color: '#9e9bb0' } } : {}),
    ...(props.yMin !== undefined ? { min: props.yMin } : {}),
    ...(props.yMax !== undefined ? { max: props.yMax } : {}),
  },
  series: [{
    type: 'bar' as const,
    data: props.values.map((val, i) => ({
      value: val,
      itemStyle: { color: props.colors[i] },
    })),
    barWidth: '50%',
    animationDuration: 300,
  }],
}))
</script>

<template>
  <div class="h-64 w-full">
    <VChart :option="option" autoresize class="h-full w-full" />
  </div>
</template>
