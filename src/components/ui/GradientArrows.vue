<script setup lang="ts">
import { computed } from 'vue'
import { useTutorialState } from '../../composables/useTutorialState'

const state = useTutorialState()

const maxAbsGrad = computed(() =>
  Math.max(...state.gradient.value.map(Math.abs), 0.01)
)

function arrowLength(gradValue: number): number {
  return (Math.abs(gradValue) / maxAbsGrad.value) * 60
}
</script>

<template>
  <svg viewBox="0 0 400 200" class="w-full max-w-md">
    <g v-for="(token, index) in state.tokens" :key="token">
      <text
        :x="50 + index * 90"
        y="100"
        text-anchor="middle"
        class="fill-text-secondary text-sm"
        font-size="14"
      >
        {{ token }}
      </text>

      <!-- Arrow -->
      <g :transform="`translate(${50 + index * 90}, 80)`">
        <!-- Shaft -->
        <line
          x1="0"
          :y1="0"
          x2="0"
          :y2="state.gradient.value[index] > 0 ? arrowLength(state.gradient.value[index]) : -arrowLength(state.gradient.value[index])"
          :stroke="state.gradient.value[index] > 0 ? '#f87171' : '#34d399'"
          stroke-width="3"
          stroke-linecap="round"
        />
        <!-- Arrowhead -->
        <polygon
          v-if="Math.abs(state.gradient.value[index]) > 0.01"
          :points="state.gradient.value[index] > 0
            ? `-6,${arrowLength(state.gradient.value[index]) - 8} 6,${arrowLength(state.gradient.value[index]) - 8} 0,${arrowLength(state.gradient.value[index])}`
            : `-6,${-arrowLength(state.gradient.value[index]) + 8} 6,${-arrowLength(state.gradient.value[index]) + 8} 0,${-arrowLength(state.gradient.value[index])}`"
          :fill="state.gradient.value[index] > 0 ? '#f87171' : '#34d399'"
        />
      </g>

      <!-- Gradient value -->
      <text
        :x="50 + index * 90"
        :y="state.gradient.value[index] > 0 ? 80 + arrowLength(state.gradient.value[index]) + 20 : 80 - arrowLength(state.gradient.value[index]) - 10"
        text-anchor="middle"
        :fill="state.gradient.value[index] > 0 ? '#f87171' : '#34d399'"
        font-size="12"
        font-family="monospace"
      >
        {{ state.gradient.value[index] >= 0 ? '+' : '' }}{{ state.gradient.value[index].toFixed(3) }}
      </text>
    </g>

    <!-- Legend -->
    <text x="200" y="190" text-anchor="middle" fill="#9e9bb0" font-size="11">
      ↑ push logit up (target)  ↓ push logit down (competitors)
    </text>
  </svg>
</template>
