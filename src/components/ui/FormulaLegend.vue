<script setup lang="ts">
import { computed } from 'vue'
import katex from 'katex'

const props = defineProps<{
  latex: string
  symbols: { symbol: string; label: string; color: string }[]
}>()

const renderedFormula = computed(() =>
  katex.renderToString(props.latex, { throwOnError: false, displayMode: true })
)

const renderedSymbols = computed(() =>
  props.symbols.map((s) => ({
    ...s,
    html: katex.renderToString(`\\textcolor{${s.color}}{${s.symbol}}`, {
      throwOnError: false,
      displayMode: false,
    }),
  }))
)
</script>

<template>
  <div class="flex flex-col rounded-lg bg-surface-light md:flex-row">
    <!-- Formula -->
    <div class="flex items-center justify-center px-6 py-5 md:flex-1" v-html="renderedFormula" />

    <!-- Divider -->
    <div class="mx-4 hidden border-l border-surface-lighter md:block" />
    <div class="mx-6 border-t border-surface-lighter md:hidden" />

    <!-- Legend -->
    <div class="flex flex-col justify-center gap-1.5 px-6 py-4 md:py-5">
      <div
        v-for="entry in renderedSymbols"
        :key="entry.symbol"
        class="flex items-baseline gap-2 text-sm text-text-secondary"
      >
        <span v-html="entry.html" />
        <span>&mdash;</span>
        <span>{{ entry.label }}</span>
      </div>
    </div>
  </div>
</template>
