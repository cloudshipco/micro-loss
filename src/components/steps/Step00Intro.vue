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

    <!-- Conceptual ladder: what happened before the logits -->
    <div class="mx-auto max-w-2xl space-y-4 leading-relaxed text-text-secondary">
      <p class="text-center">
        But what has the network actually <em>done</em> with the word "The"? Here's the conceptual ladder:
      </p>

      <div class="space-y-3">
        <div class="flex items-start gap-3 rounded-lg bg-surface-light p-3">
          <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/20 text-xs font-bold text-brand-light">1</span>
          <div>
            <strong class="text-text-primary">Embed</strong> &mdash;
            The token "The" is converted into a vector of numbers (an <em>embedding</em>). This vector lives
            in a high-dimensional space where similar words sit near each other.
          </div>
        </div>

        <div class="flex items-start gap-3 rounded-lg bg-surface-light p-3">
          <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/20 text-xs font-bold text-brand-light">2</span>
          <div>
            <strong class="text-text-primary">Transform</strong> &mdash;
            This vector is repeatedly transformed through layers of the network. Each layer mixes
            and reshapes information, building a richer representation of the context. By the end,
            the network holds a vector that encodes: <em>"Given everything I've read so far,
            what should come next?"</em>
          </div>
        </div>

        <div class="flex items-start gap-3 rounded-lg bg-surface-light p-3">
          <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/20 text-xs font-bold text-brand-light">3</span>
          <div>
            <strong class="text-text-primary">Score</strong> &mdash;
            The final layer asks: <em>"How compatible is this context representation with each
            vocabulary word?"</em> It computes a similarity score for each word. These scores are
            the <strong class="text-brand-light">logits</strong>.
          </div>
        </div>
      </div>

      <p class="text-center">
        So logits aren't arbitrary numbers &mdash; they're <strong class="text-text-primary">compatibility
        scores</strong> between the current context and each possible next word. Now let's see how to
        turn them into probabilities, measure error, and learn.
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
