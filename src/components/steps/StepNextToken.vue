<script setup lang="ts">
import { TOKENS, TOKEN_COLORS } from '../../engine/types'
import { EXAMPLE_CONTEXT_VECTOR } from '../../engine/model-config'

const exampleLogits = [0.1, 0.5, 1.0, 2.0]

const contextVectorPreview = EXAMPLE_CONTEXT_VECTOR
</script>

<template>
  <div class="space-y-6">

    <!-- Context vector reminder -->
    <div class="rounded-lg border border-surface-lighter bg-surface-light/50 p-4 text-sm text-text-secondary">
      At the end of the forward pass you have a <strong class="text-text-primary">context vector</strong>
      — a long list of numbers summarising the context <em>"the cat ate"</em>.
      The question now is: how do we turn that single vector into one score per vocabulary token?
    </div>

    <!-- The dot product step -->
    <div class="rounded-lg bg-surface-light p-5">
      <div class="mb-1 text-sm font-medium text-text-secondary">The vocabulary comparison</div>
      <div class="mb-4 text-xs text-text-secondary">
        Each vocabulary token has its own learned vector — a
        <strong class="text-text-primary">vocabulary embedding</strong>.
        The model computes a <strong class="text-text-primary">dot product</strong> between the
        context vector and each vocabulary embedding to get one score per token.
      </div>

      <div class="flex flex-col items-center gap-4 md:flex-row md:items-start">

        <!-- Context vector -->
        <div class="rounded-lg border border-surface-lighter bg-surface p-4 text-center md:w-40">
          <div class="mb-2 text-xs font-medium uppercase tracking-wider text-text-secondary">Context vector <em>h</em></div>
          <div class="space-y-0.5 font-mono text-xs text-text-secondary">
            <div v-for="(val, i) in contextVectorPreview" :key="i">{{ val.toFixed(2) }}</div>
            <div class="text-text-secondary opacity-50">(8 in our micro-model; 768+ in production)</div>
          </div>
          <div class="mt-2 text-xs text-text-secondary">Summary of the context</div>
        </div>

        <!-- Dot product operation label -->
        <div class="flex flex-col items-center justify-center gap-2 self-center">
          <div class="hidden text-xl text-text-secondary md:block">&rarr;</div>
          <div class="rounded-lg border border-brand/40 bg-brand/5 px-3 py-2 text-center text-xs text-brand-light">
            dot product<br>with each<br>vocab vector
          </div>
          <div class="hidden text-xl text-text-secondary md:block">&rarr;</div>
        </div>

        <!-- Per-word scores -->
        <div class="flex-1">
          <div class="mb-2 text-xs font-medium uppercase tracking-wider text-text-secondary">One score per token</div>
          <div class="space-y-2">
            <div
              v-for="(token, i) in TOKENS"
              :key="token"
              class="flex items-center gap-3 rounded-lg border border-surface-lighter bg-surface px-4 py-2.5 font-mono text-sm"
            >
              <span class="w-10 font-semibold" :style="{ color: TOKEN_COLORS[i] }">{{ token }}</span>
              <span class="flex-1 text-xs text-text-secondary">
                <em>h</em> &middot; <em>w</em><sub>{{ token }}</sub>
              </span>
              <span class="text-text-secondary">=</span>
              <span class="w-10 text-right font-bold text-brand-light">{{ exampleLogits[i].toFixed(1) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Why dot products measure compatibility -->
    <div class="rounded-lg bg-surface-light p-4 text-sm text-text-secondary">
      <strong class="text-text-primary">Why a dot product measures compatibility:</strong>
      <p class="mt-2">
        A dot product multiplies each pair of corresponding numbers from two vectors and sums
        the results. If the context vector and a vocabulary vector have large values in the same
        positions — meaning they are "pointing in similar directions" in the model's learned space —
        the sum is large. If they point in opposite directions, the sum is small or negative.
      </p>
      <p class="mt-2">
        Training gradually steers the context vector for <em>"the cat ate"</em> to
        point in a similar direction to the vocabulary vector for "fish", and away from "the",
        "cat", and "ate". The dot product is the mechanism that converts that geometric
        alignment into a number.
      </p>
    </div>

    <!-- What these scores are NOT -->
    <div class="rounded-lg border border-surface-lighter bg-surface-light/50 p-4 text-sm text-text-secondary">
      <strong class="text-text-primary">These scores are not probabilities.</strong>
      They can be any real number — positive, negative, large, or small — and they don't
      sum to anything in particular. The name for these raw scores is
      <strong class="text-text-primary">logits</strong>. The next step explains the name
      and what properties they have.
    </div>

  </div>
</template>
