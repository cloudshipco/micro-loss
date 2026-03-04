<script setup lang="ts">
import { computed } from 'vue'
import { useTutorialState } from '../../composables/useTutorialState'

const state = useTutorialState()

const maxAbsGrad = computed(() =>
  Math.max(...state.gradient.value.map(Math.abs), 0.01)
)

const MAX_ARROW = 60

function arrowLength(gradValue: number): number {
  return (Math.abs(gradValue) / maxAbsGrad.value) * MAX_ARROW
}

// Layout: arrows grow from a shared baseline.
// Upward arrows go above; downward arrows go below.
// Token labels sit below the max possible downward extent.
const BASELINE = 80 // y where arrows originate
const LABEL_Y = BASELINE + MAX_ARROW + 22 // always below longest downward arrow
const VALUE_OFFSET = 14 // gap between arrow tip and value text
</script>

<template>
  <svg viewBox="0 0 400 230" class="w-full max-w-md">
    <g v-for="(token, index) in state.tokens" :key="token">
      <!-- Token label — always at fixed y below all arrows -->
      <text
        :x="50 + index * 90"
        :y="LABEL_Y"
        text-anchor="middle"
        class="fill-text-secondary"
        font-size="14"
      >
        {{ token }}
      </text>

      <!-- Arrow: positive gradient → points down (push logit down), negative → up -->
      <g :transform="`translate(${50 + index * 90}, ${BASELINE})`">
        <!-- Shaft -->
        <line
          x1="0"
          y1="0"
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

      <!-- Gradient value — sits just beyond the arrow tip -->
      <text
        :x="50 + index * 90"
        :y="state.gradient.value[index] > 0
          ? BASELINE + arrowLength(state.gradient.value[index]) + VALUE_OFFSET
          : BASELINE - arrowLength(state.gradient.value[index]) - VALUE_OFFSET + 4"
        text-anchor="middle"
        :fill="state.gradient.value[index] > 0 ? '#f87171' : '#34d399'"
        font-size="12"
        font-family="monospace"
      >
        {{ state.gradient.value[index] >= 0 ? '+' : '' }}{{ state.gradient.value[index].toFixed(3) }}
      </text>
    </g>

    <!-- Legend -->
    <text x="200" y="220" text-anchor="middle" fill="#9e9bb0" font-size="11">
      ↑ push logit up (target)  ↓ push logit down (competitors)
    </text>
  </svg>
</template>
