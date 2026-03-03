<script setup lang="ts">
import { ref } from 'vue'

// Training document for the "positions" visualisation
const document = ['On', 'the', 'mat', 'sat', 'a', 'cat']
const highlightedPosition = ref(5)

function contextFor(targetIdx: number) {
  return document.slice(0, targetIdx)
}
function targetFor(targetIdx: number) {
  return document[targetIdx]
}

// Forward pass animation
const stage = ref<0 | 1 | 2 | 3 | 4>(0)
// 0 = idle, 1 = token IDs, 2 = embeddings, 3 = layers, 4 = context vector

const stageLabels = ['', 'Token IDs enter', 'Converted to embeddings', 'Processed through layers', 'Context vector produced']

async function animate() {
  stage.value = 1
  await delay(800)
  stage.value = 2
  await delay(900)
  stage.value = 3
  await delay(1000)
  stage.value = 4
  await delay(1500)
  stage.value = 0
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
</script>

<template>
  <div class="space-y-6">

    <!-- One document → many positions -->
    <div class="rounded-lg bg-surface-light p-5">
      <div class="mb-1 text-sm font-medium text-text-secondary">One document — many prediction tasks</div>
      <div class="mb-4 text-xs text-text-secondary">
        Each token (except the first) is a training target. Click any word to see the
        context and target for that position.
      </div>

      <div class="flex flex-wrap items-end gap-2">
        <!-- First token: no context, can't be predicted -->
        <div class="flex flex-col items-center gap-1">
          <div class="rounded bg-surface px-3 py-1.5 font-mono text-sm text-text-secondary opacity-40">
            {{ document[0] }}
          </div>
          <div class="h-3" />
        </div>
        <!-- All other positions -->
        <div
          v-for="i in document.length - 1"
          :key="i"
          class="flex cursor-pointer flex-col items-center gap-1"
          @click="highlightedPosition = i"
        >
          <div
            class="rounded px-3 py-1.5 font-mono text-sm font-semibold transition-all duration-150"
            :class="highlightedPosition === i
              ? 'bg-brand text-white scale-105 shadow-lg shadow-brand/20'
              : 'bg-surface text-text-primary hover:bg-surface-lighter'"
          >
            {{ document[i] }}
          </div>
          <div class="text-xs transition-colors"
            :class="highlightedPosition === i ? 'text-brand-light' : 'text-text-secondary opacity-40'">
            ↑
          </div>
        </div>
      </div>

      <!-- Selected position breakdown -->
      <div class="mt-4 rounded-lg border border-surface-lighter bg-surface p-4 text-sm">
        <div class="mb-2 text-xs font-medium uppercase tracking-wider text-text-secondary">
          Prediction task at position {{ highlightedPosition }}
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-text-secondary text-xs">Context:</span>
          <span
            v-for="(token, i) in contextFor(highlightedPosition)"
            :key="i"
            class="rounded bg-surface-light px-2 py-0.5 font-mono text-sm text-text-primary"
          >{{ token }}</span>
          <span class="mx-1 text-text-secondary">&rarr;</span>
          <span class="text-text-secondary text-xs">Predict:</span>
          <span class="rounded bg-brand/20 px-2 py-0.5 font-mono text-sm font-bold text-brand-light">
            {{ targetFor(highlightedPosition) }}
          </span>
        </div>
        <p class="mt-2 text-xs text-text-secondary">
          The model sees the context (everything to the left) and must produce
          scores for every vocabulary word. Only one score — the target's — should be high.
          This document of {{ document.length }} tokens gives
          {{ document.length - 1 }} training examples.
        </p>
      </div>
    </div>

    <!-- What happens inside the forward pass -->
    <div class="rounded-lg bg-surface-light p-5">
      <div class="mb-1 text-sm font-medium text-text-secondary">Inside the forward pass</div>
      <div class="mb-4 text-xs text-text-secondary">
        Press animate to step through what happens when context tokens flow through the network.
      </div>

      <!-- Step pipeline -->
      <div class="space-y-3">

        <!-- Step 1: Token IDs -->
        <div class="flex items-start gap-3 rounded-lg border p-3 transition-all duration-300"
          :class="stage === 1 ? 'border-brand bg-brand/10' : 'border-surface-lighter bg-surface'">
          <div class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
            :class="stage === 1 ? 'bg-brand text-white' : 'bg-surface-lighter text-text-secondary'">1</div>
          <div>
            <div class="text-sm font-medium text-text-primary">Token IDs enter</div>
            <div class="mt-1 text-xs text-text-secondary">
              Integer IDs for each context word:
              <span class="font-mono text-brand-light">On→?, the→?, mat→?, sat→?, a→?</span>
              (out-of-vocab here, but each would be a number in a real model)
            </div>
          </div>
        </div>

        <!-- Step 2: Embeddings -->
        <div class="flex items-start gap-3 rounded-lg border p-3 transition-all duration-300"
          :class="stage === 2 ? 'border-brand bg-brand/10' : 'border-surface-lighter bg-surface'">
          <div class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
            :class="stage === 2 ? 'bg-brand text-white' : 'bg-surface-lighter text-text-secondary'">2</div>
          <div>
            <div class="text-sm font-medium text-text-primary">Each ID becomes an embedding</div>
            <div class="mt-1 text-xs text-text-secondary">
              An <strong class="text-text-primary">embedding</strong> is a learned vector of numbers
              representing that token — for example, the ID for "cat" might map to a vector of 768 numbers.
              These are the model's internal representation of word meaning, learned during training.
            </div>
          </div>
        </div>

        <!-- Step 3: Transformer layers -->
        <div class="flex items-start gap-3 rounded-lg border p-3 transition-all duration-300"
          :class="stage === 3 ? 'border-brand bg-brand/10' : 'border-surface-lighter bg-surface'">
          <div class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
            :class="stage === 3 ? 'bg-brand text-white' : 'bg-surface-lighter text-text-secondary'">3</div>
          <div>
            <div class="text-sm font-medium text-text-primary">Embeddings pass through many layers</div>
            <div class="mt-1 text-xs text-text-secondary">
              Each layer transforms the vectors by mixing information across the token positions — letting
              each word's representation be influenced by the words around it.
              This is the part we treat as a black box.
              By the end, the representation of the final position has "seen" the whole context.
            </div>
          </div>
        </div>

        <!-- Step 4: Context vector -->
        <div class="flex items-start gap-3 rounded-lg border p-3 transition-all duration-300"
          :class="stage === 4 ? 'border-positive bg-positive/10' : 'border-surface-lighter bg-surface'">
          <div class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
            :class="stage === 4 ? 'bg-positive text-white' : 'bg-surface-lighter text-text-secondary'">4</div>
          <div>
            <div class="text-sm font-medium text-text-primary">A context vector emerges</div>
            <div class="mt-1 text-xs text-text-secondary">
              The output for the final position is a single vector — a long list of numbers
              that encodes everything the model has understood about the context
              <em>"On the mat sat a"</em>. This <strong class="text-text-primary">context vector</strong>
              is the summary the model passes forward to make its prediction.
            </div>
          </div>
        </div>
      </div>

      <!-- Animate button + status -->
      <div class="mt-4 flex items-center gap-4">
        <button
          @click="animate"
          :disabled="stage !== 0"
          class="rounded-lg border border-brand/50 bg-brand/10 px-5 py-2 text-sm font-medium text-brand-light transition hover:bg-brand/20 disabled:opacity-50"
        >
          Animate
        </button>
        <span v-if="stage > 0" class="text-sm text-brand-light transition-all">
          {{ stageLabels[stage] }}…
        </span>
      </div>
    </div>

    <!-- Bridge -->
    <div class="rounded-lg border border-brand/30 bg-brand/5 p-4 text-sm text-text-secondary">
      <strong class="text-brand-light">The context vector is not yet the output.</strong>
      It still needs to be compared against every vocabulary word to produce scores.
      That comparison — and the precise mechanism that does it — is the next step.
    </div>

  </div>
</template>
