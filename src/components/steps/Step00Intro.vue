<script setup lang="ts">
import { useTutorialState } from '../../composables/useTutorialState'

const state = useTutorialState()

const sentence = ['On', 'the', 'mat', 'sat', 'a', null]
</script>

<template>
  <section class="border-b border-surface-lighter py-12">
    <div class="mb-8 text-center">
      <h2 class="mb-2 text-2xl font-bold text-text-primary">The Scenario</h2>
      <p class="text-sm text-brand-light">How does a language model turn raw scores into a prediction?</p>
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
        A language model has read this sentence left to right and needs to predict the next word.
        Its vocabulary is just <strong class="text-text-primary">4 tokens</strong>:
      </p>
    </div>

    <!-- Token chips -->
    <div class="my-6 flex flex-wrap items-center justify-center gap-3">
      <div
        v-for="(token, index) in state.tokens"
        :key="token"
        class="flex items-center gap-2 rounded-full px-5 py-2.5 text-lg font-bold"
        :style="{
          backgroundColor: state.tokenColors[index] + '20',
          color: state.tokenColors[index],
          border: `2px solid ${state.tokenColors[index]}40`,
        }"
      >
        {{ token }}
      </div>
    </div>

    <div class="mx-auto max-w-2xl space-y-4 leading-relaxed text-text-secondary">
      <p class="text-center">
        The model has produced a raw score for each word &mdash; how strongly it thinks that word
        comes next. But raw scores aren't a prediction. How do they become probabilities?
        How do we measure whether the prediction is good? And how does the model improve?
      </p>

      <!-- What this tutorial covers -->
      <div class="rounded-lg border border-surface-lighter bg-surface-light/50 p-4 text-sm">
        <strong class="text-text-primary">This tutorial covers:</strong>
        <span class="text-text-secondary">
          the pipeline from raw scores to learning &mdash; softmax, cross-entropy loss, gradients,
          and gradient descent. No prior machine learning knowledge needed.
        </span>
      </div>

      <div class="rounded-lg border border-surface-lighter bg-surface-light/50 p-4 text-sm">
        <strong class="text-text-primary">This tutorial does not cover:</strong>
        <span class="text-text-secondary">
          how the model produced those scores in the first place (embeddings, attention layers,
          transformer architecture). We start where the model's internal computation ends &mdash;
          at the raw output scores.
        </span>
      </div>
    </div>

    <!-- Pipeline preview -->
    <div class="mt-8 flex flex-wrap items-center justify-center gap-2 text-sm font-medium">
      <span class="rounded-md bg-surface-light px-3 py-1.5 text-text-secondary">Logits</span>
      <span class="text-text-secondary">&rarr;</span>
      <span class="rounded-md bg-surface-light px-3 py-1.5 text-text-secondary">e<sup>z</sup></span>
      <span class="text-text-secondary">&rarr;</span>
      <span class="rounded-md bg-surface-light px-3 py-1.5 text-text-secondary">Softmax</span>
      <span class="text-text-secondary">&rarr;</span>
      <span class="rounded-md bg-surface-light px-3 py-1.5 text-text-secondary">Loss</span>
      <span class="text-text-secondary">&rarr;</span>
      <span class="rounded-md bg-surface-light px-3 py-1.5 text-text-secondary">Gradient</span>
      <span class="text-text-secondary">&rarr;</span>
      <span class="rounded-md bg-surface-light px-3 py-1.5 text-text-secondary">Update</span>
    </div>
  </section>
</template>
