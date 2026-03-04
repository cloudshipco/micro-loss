<script setup lang="ts">
import { ref, computed } from 'vue'
import { TOKENS, TOKEN_COLORS } from '../../engine/types'
import Callout from '../ui/Callout.vue'

// A sample sequence using only our vocabulary tokens
const sentenceTokens = ['the', 'cat', 'ate', 'fish'] as const
const tokenIds = [0, 1, 2, 3]

const highlightedIndex = ref<number | null>(null)

// Type-to-tokenize demo
const userInput = ref('the cat ate fish')
const tokenizedInput = computed(() => {
  const words = userInput.value.toLowerCase().split(/\s+/).filter(Boolean)
  return words.map(word => {
    const idx = (TOKENS as readonly string[]).indexOf(word)
    return { word, id: idx >= 0 ? idx : null }
  })
})
</script>

<template>
  <div class="space-y-6">
    <!-- Vocabulary table -->
    <div>
      <h3 class="mb-3 text-sm font-medium text-text-secondary">Our 4-token vocabulary</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-surface-lighter">
              <th class="py-2 text-left font-medium text-text-secondary">Token</th>
              <th class="py-2 text-right font-medium text-text-secondary">Integer ID</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(token, index) in TOKENS"
              :key="token"
              class="border-b border-surface-lighter/50"
            >
              <td class="py-3">
                <span class="font-mono text-base font-semibold" :style="{ color: TOKEN_COLORS[index] }">
                  {{ token }}
                </span>
              </td>
              <td class="py-3 text-right font-mono text-brand-light">{{ index }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="mt-2 text-xs text-text-secondary">
        Each token gets a unique integer ID. This mapping is used to convert text into numbers and back again.
      </p>
    </div>

    <!-- Sentence tokenization demo -->
    <div>
      <h3 class="mb-3 text-sm font-medium text-text-secondary">Tokenizing a sequence</h3>
      <div class="rounded-lg bg-surface-light p-4">
        <div class="mb-3 text-sm text-text-secondary">
          Sequence: <em class="text-text-primary">"the cat ate fish"</em>
        </div>

        <!-- Token chips -->
        <div class="flex flex-wrap gap-2">
          <div
            v-for="(token, index) in sentenceTokens"
            :key="index"
            class="cursor-default rounded-lg border p-3 text-center transition-all duration-150"
            :style="{
              borderColor: highlightedIndex === index
                ? TOKEN_COLORS[tokenIds[index]]
                : TOKEN_COLORS[tokenIds[index]] + '50',
              backgroundColor: highlightedIndex === index
                ? TOKEN_COLORS[tokenIds[index]] + '20'
                : 'transparent',
              transform: highlightedIndex === index ? 'translateY(-2px)' : 'none',
              boxShadow: highlightedIndex === index
                ? `0 4px 12px ${TOKEN_COLORS[tokenIds[index]]}30`
                : 'none',
            }"
            @mouseenter="highlightedIndex = index"
            @mouseleave="highlightedIndex = null"
          >
            <div class="font-mono font-semibold" :style="{ color: TOKEN_COLORS[tokenIds[index]] }">
              {{ token }}
            </div>
            <div class="mt-1 text-xs">
              <span class="font-mono text-brand-light">ID {{ tokenIds[index] }}</span>
            </div>
          </div>
        </div>

        <!-- Token sequence representation -->
        <div class="mt-4 rounded bg-surface p-3">
          <div class="mb-2 text-xs text-text-secondary">Token ID sequence:</div>
          <div class="flex flex-wrap items-center gap-1 font-mono text-sm">
            <span class="text-text-secondary">[</span>
            <template v-for="(id, index) in tokenIds" :key="index">
              <span
                class="rounded px-1.5 py-0.5 font-bold transition-all duration-150"
                :style="{
                  color: highlightedIndex === index ? TOKEN_COLORS[id] : TOKEN_COLORS[id],
                  backgroundColor: highlightedIndex === index ? TOKEN_COLORS[id] + '25' : 'transparent',
                  outline: highlightedIndex === index ? `1px solid ${TOKEN_COLORS[id]}60` : 'none',
                }"
              >{{ id }}</span>
              <span v-if="index < tokenIds.length - 1" class="text-text-secondary">,</span>
            </template>
            <span class="text-text-secondary">]</span>
          </div>
          <p class="mt-2 text-xs text-text-secondary">
            Hover over a token to highlight its position in the ID sequence.
          </p>
        </div>
      </div>
    </div>

    <!-- Type-to-tokenize demo -->
    <div class="rounded-lg bg-surface-light p-4">
      <h3 class="mb-2 text-sm font-medium text-text-secondary">Try it: type to tokenize</h3>
      <input
        v-model="userInput"
        type="text"
        placeholder="Type words from our vocabulary..."
        class="w-full rounded-lg border border-surface-lighter bg-surface px-4 py-2.5 font-mono text-sm text-text-primary placeholder-text-secondary/50 outline-none transition focus:border-brand"
      />
      <div v-if="tokenizedInput.length > 0" class="mt-3 flex flex-wrap items-center gap-1.5">
        <span class="font-mono text-sm text-text-secondary">[</span>
        <template v-for="(tok, i) in tokenizedInput" :key="i">
          <span
            class="rounded px-2 py-0.5 font-mono text-sm font-semibold"
            :style="{
              color: tok.id !== null ? TOKEN_COLORS[tok.id] : '#9e9bb0',
              backgroundColor: tok.id !== null ? TOKEN_COLORS[tok.id] + '20' : 'transparent',
            }"
          >
            {{ tok.id !== null ? tok.id : '?' }}
          </span>
          <span v-if="i < tokenizedInput.length - 1" class="font-mono text-sm text-text-secondary">,</span>
        </template>
        <span class="font-mono text-sm text-text-secondary">]</span>
      </div>
      <p class="mt-2 text-xs text-text-secondary">
        Words in our vocabulary (the, cat, ate, fish) get integer IDs; others show as ?.
      </p>
    </div>

    <!-- Next-token prediction framing -->
    <div class="rounded-lg bg-surface-light p-4 text-sm">
      <strong class="text-text-primary">Training pair from this sequence:</strong>
      <div class="mt-3 flex flex-wrap items-center gap-2">
        <span class="text-text-secondary">Context:</span>
        <span
          v-for="(token, i) in sentenceTokens.slice(0, -1)"
          :key="i"
          class="rounded bg-surface px-2 py-1 font-mono text-xs"
          :style="{ color: TOKEN_COLORS[tokenIds[i]] }"
        >
          {{ token }}
        </span>
        <span class="text-text-secondary mx-2">&rarr;</span>
        <span class="text-text-secondary">Next token:</span>
        <span
          class="rounded px-3 py-1 font-mono font-bold"
          :style="{
            color: TOKEN_COLORS[3],
            backgroundColor: TOKEN_COLORS[3] + '20'
          }"
        >
          fish (ID 3)
        </span>
      </div>
    </div>

    <!-- Real-world scale note -->
    <Callout variant="brand" title="Real tokenizers:">
      GPT-4 uses a vocabulary of ~100,000 tokens. Common words like "cat" get their own token.
      Rare or long words get split into smaller fragments:
      "tokenization" → ["token", "ization"]. This way the vocabulary stays manageable while
      still being able to represent any word. Raw text is never used directly — only tokens represented as integer IDs.
    </Callout>
  </div>
</template>
