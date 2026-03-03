<script setup lang="ts">
import { TOKENS, TOKEN_COLORS } from '../../engine/types'

const sentence = ['On', 'the', 'mat', 'sat', 'a', null]

const pipeline = [
  { label: 'Dataset' },
  { label: 'Tokens' },
  { label: 'Forward pass' },
  { label: 'Logits' },
  { label: 'Softmax' },
  { label: 'Loss' },
  { label: 'Backprop' },
  { label: 'Gradient' },
  { label: 'Adam' },
  { label: 'Training loop' },
  { label: 'Inference' },
]
</script>

<template>
  <section class="border-b border-surface-lighter py-12">
    <div class="mb-8 text-center">
      <h2 class="mb-2 text-2xl font-bold text-text-primary">How does a language model learn?</h2>
      <p class="text-sm text-brand-light">21 interactive steps from raw data to text generation</p>
    </div>

    <!-- The sentence with blank -->
    <div class="mb-8 flex flex-wrap items-center justify-center gap-2 text-2xl font-semibold tracking-wide">
      <template v-for="(word, index) in sentence" :key="index">
        <span v-if="word !== null" class="text-text-primary">{{ word }}</span>
        <span
          v-else
          class="inline-flex min-w-[5rem] items-center justify-center rounded-lg border-2 border-dashed border-brand bg-brand/10 px-3 py-1 text-brand-light"
        >
          ???
        </span>
      </template>
    </div>

    <!-- Explanation -->
    <div class="mx-auto max-w-2xl space-y-4 text-center leading-relaxed text-text-secondary">
      <p>
        A language model is trained to predict the next word in a sequence. We'll trace the complete
        journey: from raw training data all the way to generating new text — using a toy vocabulary
        of just <strong class="text-text-primary">4 tokens</strong>:
      </p>
    </div>

    <!-- Token chips -->
    <div class="my-6 flex flex-wrap items-center justify-center gap-3">
      <div
        v-for="(token, index) in TOKENS"
        :key="token"
        class="flex items-center gap-2 rounded-full px-5 py-2.5 text-lg font-bold"
        :style="{
          backgroundColor: TOKEN_COLORS[index] + '20',
          color: TOKEN_COLORS[index],
          border: `2px solid ${TOKEN_COLORS[index]}40`,
        }"
      >
        {{ token }}
      </div>
    </div>

    <div class="mx-auto max-w-2xl space-y-3 leading-relaxed text-text-secondary">
      <!-- What this tutorial covers -->
      <div class="rounded-lg border border-surface-lighter bg-surface-light/50 p-4 text-sm">
        <strong class="text-text-primary">This tutorial covers:</strong>
        <span class="text-text-secondary">
          the complete training pipeline — dataset, tokenization, forward pass, softmax,
          cross-entropy loss, backpropagation, gradients, the Adam optimizer, and autoregressive
          text generation. No prior machine learning knowledge needed.
        </span>
      </div>

      <div class="rounded-lg border border-surface-lighter bg-surface-light/50 p-4 text-sm">
        <strong class="text-text-primary">This tutorial does not cover:</strong>
        <span class="text-text-secondary">
          the internals of the transformer — embeddings, multi-head attention layers, positional
          encoding, or residual connections. We treat the model as a black box that outputs logits,
          and explain what happens to those logits from there.
        </span>
      </div>

      <div class="rounded-lg border border-brand/30 bg-brand/5 p-4 text-sm">
        <span class="text-text-secondary">
          Inspired by Andrej Karpathy's
          <a href="https://karpathy.github.io/2026/02/12/microgpt/" target="_blank" rel="noopener noreferrer"
            class="text-brand-light hover:underline">MicroGPT</a>
          — a complete GPT in 200 lines of Python.
        </span>
      </div>
    </div>

    <!-- Pipeline preview -->
    <div class="mt-8 flex flex-wrap items-center justify-center gap-1.5 text-xs font-medium">
      <template v-for="(stage, i) in pipeline" :key="stage.label">
        <span class="rounded-md bg-surface-light px-2.5 py-1.5 text-text-secondary">
          {{ stage.label }}
        </span>
        <span v-if="i < pipeline.length - 1" class="text-surface-lighter">&rarr;</span>
      </template>
    </div>
  </section>
</template>
