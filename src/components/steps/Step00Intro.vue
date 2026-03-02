<script setup lang="ts">
import { useTutorialState } from '../../composables/useTutorialState'

const state = useTutorialState()

const sentence = ['The', null, 'sat', 'on', 'the', 'mat']
</script>

<template>
  <section class="border-b border-surface-lighter py-12">
    <div class="mb-8 text-center">
      <h2 class="mb-2 text-2xl font-bold text-text-primary">The Scenario</h2>
      <p class="text-sm text-brand-light">A tiny language model is trying to predict a word</p>
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
        Imagine a tiny neural network reading the sentence above. It needs to predict the missing word.
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

    <div class="mx-auto max-w-2xl space-y-4 text-center leading-relaxed text-text-secondary">
      <p>
        The network has processed <em>"The"</em> through millions of parameters &mdash; layers of matrix multiplications,
        nonlinearities, and attention &mdash; and its very last layer has produced
        <strong class="text-text-primary">one raw number per vocabulary word</strong>.
        These numbers are called <strong class="text-brand-light">logits</strong>.
      </p>
      <p>
        But raw numbers aren't a prediction yet. We need to turn them into probabilities,
        measure how good the prediction is, and then improve it. That's the pipeline we'll
        trace step by step &mdash; from raw scores all the way to learning.
      </p>
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
