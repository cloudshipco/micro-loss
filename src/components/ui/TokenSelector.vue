<script setup lang="ts">
import { useTutorialState } from '../../composables/useTutorialState'

const state = useTutorialState()
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap gap-3">
      <button
        v-for="(token, index) in state.tokens"
        :key="token"
        @click="state.setTargetIndex(index)"
        class="rounded-lg border-2 px-5 py-2.5 text-sm font-semibold transition"
        :class="state.targetIndex.value === index
          ? 'border-brand bg-brand/20 text-brand-light'
          : 'border-surface-lighter bg-surface-light text-text-secondary hover:border-surface-lighter hover:text-text-primary'"
        :style="state.targetIndex.value === index
          ? { borderColor: state.tokenColors[index], backgroundColor: state.tokenColors[index] + '20', color: state.tokenColors[index] }
          : {}"
      >
        {{ token }}
      </button>
    </div>

    <!-- One-hot display -->
    <div class="flex gap-4 font-mono text-sm">
      <span class="text-text-secondary">y =</span>
      <span class="text-text-secondary">[</span>
      <span
        v-for="(token, index) in state.tokens"
        :key="token"
        class="w-6 text-center font-bold"
        :class="state.targetIndex.value === index ? 'text-brand-light' : 'text-text-secondary'"
      >
        {{ state.targetIndex.value === index ? '1' : '0' }}
      </span>
      <span class="text-text-secondary">]</span>
    </div>
  </div>
</template>
