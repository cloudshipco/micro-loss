<script setup lang="ts">
import type { StepDefinition } from '../../content/steps'
import MathBlock from '../ui/MathBlock.vue'

const props = defineProps<{
  step: StepDefinition
}>()
</script>

<template>
  <section class="border-b border-surface-lighter py-12 last:border-b-0">
    <div class="mb-6">
      <div class="mb-2 flex items-center gap-3">
        <span class="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
          {{ step.number }}
        </span>
        <h2 class="text-xl font-semibold text-text-primary">{{ step.title }}</h2>
      </div>
      <p class="text-sm font-medium text-brand-light">{{ step.subtitle }}</p>
      <div class="step-description mt-3 leading-relaxed text-text-secondary" v-html="step.description" />
      <div v-if="step.math" class="mt-4">
        <MathBlock :latex="step.math" size="md" />
      </div>
    </div>
    <div class="mt-6">
      <slot />
    </div>
  </section>
</template>
