<script setup lang="ts">
import { ref } from 'vue'
import { TOKENS, TOKEN_COLORS } from '../../engine/types'
import Callout from '../ui/Callout.vue'

interface TrainingExample {
  context: string[]
  targetIndex: number
  note: string
}

const examples: TrainingExample[] = [
  { context: ['the'], targetIndex: 1, note: 'Given just "the", predict "cat"' },
  { context: ['the', 'cat'], targetIndex: 2, note: 'Given "the cat", predict "ate"' },
  { context: ['the', 'cat', 'ate'], targetIndex: 3, note: '"the cat ate fish" — our running example' },
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
    <Callout variant="info" title="The goal: predict the next token.">
      Given a sequence of tokens (the context), what comes next?
      Training data provides millions of examples with known answers.
    </Callout>

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

    <!-- Vocabulary options -->
    <div class="rounded-lg bg-surface-light p-4">
      <div class="mb-3 text-sm font-medium text-text-secondary">All vocabulary options — only one is correct:</div>
      <div class="grid grid-cols-4 gap-3">
        <div
          v-for="(token, index) in TOKENS"
          :key="token"
          class="rounded-lg border p-3 text-center transition-all duration-200"
          :style="{
            borderColor: index === currentExample.targetIndex
              ? TOKEN_COLORS[index]
              : TOKEN_COLORS[index] + '25',
            backgroundColor: index === currentExample.targetIndex
              ? TOKEN_COLORS[index] + '15'
              : TOKEN_COLORS[index] + '08',
            boxShadow: index === currentExample.targetIndex
              ? `0 0 12px ${TOKEN_COLORS[index]}25`
              : 'none',
          }"
        >
          <div
            class="font-mono text-lg font-bold transition-all duration-200"
            :style="{ color: TOKEN_COLORS[index], opacity: index === currentExample.targetIndex ? 1 : 0.5 }"
          >{{ token }}</div>
          <div class="mt-1 text-xs text-text-secondary">ID {{ index }}</div>
          <div
            class="mt-1.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium"
            :class="index === currentExample.targetIndex
              ? 'bg-positive/15 text-positive'
              : 'bg-surface-lighter/50 text-text-secondary'"
          >
            {{ index === currentExample.targetIndex ? '✓ correct' : '✗ wrong' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
