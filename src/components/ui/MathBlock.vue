<script setup lang="ts">
import { computed } from 'vue'
import katex from 'katex'

const props = defineProps<{
  latex?: string
  formula?: string
  size?: 'sm' | 'md' | 'lg'
}>()

const renderedKatex = computed(() => {
  if (!props.latex) return ''
  return katex.renderToString(props.latex, {
    throwOnError: false,
    displayMode: true,
  })
})
</script>

<template>
  <div
    class="inline-block rounded-lg bg-surface-light px-4 py-2"
    :class="{
      'text-sm': size === 'sm',
      'text-lg': size === 'md' || !size,
      'text-2xl': size === 'lg',
    }"
  >
    <!-- KaTeX rendering for LaTeX strings -->
    <div v-if="latex" v-html="renderedKatex" />
    <!-- Slot/formula fallback for hand-coded HTML math -->
    <template v-else>
      <slot>{{ formula }}</slot>
    </template>
  </div>
</template>
