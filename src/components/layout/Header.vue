<script setup lang="ts">
import { useTutorialState } from '../../composables/useTutorialState'

const state = useTutorialState()
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-surface-lighter bg-surface/90 backdrop-blur-md">
    <div class="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">
          <span class="text-brand-light">micro</span><span class="text-text-primary">Loss</span>
        </h1>
        <p class="text-sm text-text-secondary">Interactive softmax + cross-entropy tutorial</p>
      </div>
      <div class="flex gap-2">
        <button
          @click="state.resetLogits()"
          class="rounded-lg border border-surface-lighter bg-surface-light px-3 py-1.5 text-sm text-text-secondary transition hover:border-brand hover:text-text-primary"
        >
          Reset
        </button>
        <button
          @click="state.randomizeLogits()"
          class="rounded-lg border border-surface-lighter bg-surface-light px-3 py-1.5 text-sm text-text-secondary transition hover:border-brand hover:text-text-primary"
        >
          Randomize
        </button>
      </div>
    </div>
  </header>
</template>
