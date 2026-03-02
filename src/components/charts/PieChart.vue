<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { PieChart as EPieChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([EPieChart, TooltipComponent, LegendComponent, CanvasRenderer])

const props = defineProps<{
  labels: string[]
  values: number[]
  colors: readonly string[]
}>()

const option = computed(() => ({
  tooltip: {
    trigger: 'item' as const,
    backgroundColor: '#2a2740',
    borderColor: '#363254',
    textStyle: { color: '#e2e0ea' },
    formatter: (params: any) =>
      `${params.name}: <strong>${(params.value * 100).toFixed(1)}%</strong>`,
  },
  series: [{
    type: 'pie' as const,
    radius: ['40%', '70%'],
    itemStyle: { borderRadius: 4, borderColor: '#1e1b2e', borderWidth: 2 },
    label: {
      color: '#e2e0ea',
      formatter: '{b}\n{d}%',
    },
    data: props.labels.map((label, i) => ({
      name: label,
      value: props.values[i],
      itemStyle: { color: props.colors[i] },
    })),
    animationDuration: 300,
  }],
}))
</script>

<template>
  <div class="h-64 w-full">
    <VChart :option="option" autoresize class="h-full w-full" />
  </div>
</template>
