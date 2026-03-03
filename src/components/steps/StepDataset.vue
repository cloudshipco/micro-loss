<script setup lang="ts">
import { ref } from 'vue'
import { TOKENS, TOKEN_COLORS } from '../../engine/types'

interface TrainingExample {
  context: string[]
  targetIndex: number
  note: string
}

const examples: TrainingExample[] = [
  { context: ['the', 'cat', 'ate'], targetIndex: 3, note: '"the cat ate fish" — our running example' },
  { context: ['cat', 'ate', 'fish'], targetIndex: 0, note: 'The sentence loops: "…fish the cat ate fish…"' },
  { context: ['ate', 'fish', 'the'], targetIndex: 1, note: 'Continuing the loop: "…the cat…"' },
  { context: ['fish', 'the', 'cat'], targetIndex: 2, note: 'And again: "…cat ate…"' },
  { context: ['the', 'cat'], targetIndex: 2, note: 'Shorter context, same pattern: "the cat ate"' },
  { context: ['ate', 'fish'], targetIndex: 0, note: '"ate fish the" — predicting the article' },
]

const currentIndex = ref(0)
const currentExample = ref(examples[0])

function showExample(index: number) {
  currentIndex.value = index
  currentExample.value = examples[index]
}

function prev() {
  showExample((currentIndex.value - 1 + examples.length) % examples.length)
}

function next() {
  showExample((currentIndex.value + 1) % examples.length)
}
</script>

<template>
  <div class="space-y-6">
    <!-- What a language model does -->
    <div class="rounded-lg border border-surface-lighter bg-surface-light/50 p-4 text-sm text-text-secondary">
      <strong class="text-text-primary">The goal: predict the next word.</strong>
      Given a sequence of words (the context), what comes next?
      Training data provides millions of examples with known answers.
    </div>

    <!-- Training example card -->
    <div class="rounded-lg bg-surface-light p-6">
      <div class="mb-2 text-xs uppercase tracking-wider text-text-secondary">
        Training example {{ currentIndex + 1 }} of {{ examples.length }}
      </div>

      <!-- Context tokens -->
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <span class="text-sm text-text-secondary">Context:</span>
        <span
          v-for="(token, i) in currentExample.context"
          :key="i"
          class="rounded bg-surface px-2 py-1 font-mono text-sm text-text-primary"
        >
          {{ token }}
        </span>
        <span class="font-mono text-text-secondary">___</span>
      </div>

      <!-- Target label -->
      <div class="flex items-center gap-4">
        <span class="text-sm text-text-secondary">Correct next token:</span>
        <span
          class="rounded-lg px-4 py-2 font-mono text-lg font-bold"
          :style="{
            color: TOKEN_COLORS[currentExample.targetIndex],
            backgroundColor: TOKEN_COLORS[currentExample.targetIndex] + '20',
            border: `1px solid ${TOKEN_COLORS[currentExample.targetIndex]}40`
          }"
        >
          {{ TOKENS[currentExample.targetIndex] }}
        </span>
        <span class="text-xs text-text-secondary">{{ currentExample.note }}</span>
      </div>
    </div>

    <!-- Navigation -->
    <div class="flex items-center justify-between">
      <button
        @click="prev"
        class="rounded-lg border border-surface-lighter bg-surface px-4 py-2 text-sm text-text-secondary transition hover:border-brand hover:text-text-primary"
      >
        &larr; Prev example
      </button>
      <div class="flex gap-2">
        <button
          v-for="(_, i) in examples"
          :key="i"
          @click="showExample(i)"
          class="h-2 w-2 rounded-full transition"
          :class="i === currentIndex ? 'bg-brand' : 'bg-surface-lighter hover:bg-brand/50'"
        />
      </div>
      <button
        @click="next"
        class="rounded-lg border border-surface-lighter bg-surface px-4 py-2 text-sm text-text-secondary transition hover:border-brand hover:text-text-primary"
      >
        Next example &rarr;
      </button>
    </div>

    <!-- Wrong options -->
    <div class="rounded-lg bg-surface-light p-4">
      <div class="mb-3 text-sm font-medium text-text-secondary">All vocabulary options — only one is correct:</div>
      <div class="grid grid-cols-4 gap-3">
        <div
          v-for="(token, index) in TOKENS"
          :key="token"
          class="rounded-lg p-3 text-center transition"
          :class="index === currentExample.targetIndex
            ? 'ring-1'
            : 'opacity-50'"
          :style="index === currentExample.targetIndex ? {
            backgroundColor: TOKEN_COLORS[index] + '20',
            ringColor: TOKEN_COLORS[index]
          } : {}"
        >
          <div class="font-mono font-semibold" :style="{ color: TOKEN_COLORS[index] }">{{ token }}</div>
          <div class="mt-1 text-xs text-text-secondary">ID {{ index }}</div>
          <div class="mt-1 text-xs font-medium" :class="index === currentExample.targetIndex ? 'text-positive' : 'text-negative'">
            {{ index === currentExample.targetIndex ? '✓ correct' : '✗ wrong' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Scale note -->
    <div class="rounded-lg border border-brand/30 bg-brand/5 p-4 text-sm text-text-secondary">
      <strong class="text-brand-light">Simplified vocabulary:</strong>
      We're using just 4 tokens (the, cat, ate, fish) throughout this tutorial for visual clarity.
      Real models like GPT-4 have vocabularies of <strong class="text-text-primary">~100,000 tokens</strong>
      — words, word-pieces, punctuation, and special characters. The math is identical; only the scale differs.
    </div>
  </div>
</template>
