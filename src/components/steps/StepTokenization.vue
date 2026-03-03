<script setup lang="ts">
import { ref, computed } from 'vue'
import { TOKENS, TOKEN_COLORS } from '../../engine/types'

// A sample sentence using our vocabulary tokens
const sentenceWords = ['A', 'cat', 'sat', 'near', 'a', 'bird']
const wordIds: (number | null)[] = [null, 0, null, null, null, 3]
// null means not in our 4-token vocabulary

const highlightedIndex = ref<number | null>(null)

// Type-to-tokenize demo
const userInput = ref('cat fish bird dog')
const tokenizedInput = computed(() => {
  const words = userInput.value.toLowerCase().split(/\s+/).filter(Boolean)
  return words.map(word => {
    const idx = (TOKENS as readonly string[]).indexOf(word)
    return { word, id: idx >= 0 ? idx : null }
  })
})

function isVocabToken(index: number): boolean {
  return wordIds[index] !== null
}

function getTokenColor(index: number): string {
  const id = wordIds[index]
  if (id === null) return '#9e9bb0'
  return TOKEN_COLORS[id]
}

function getTokenId(index: number): string {
  const id = wordIds[index]
  if (id === null) return '...'
  return String(id)
}
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
              <th class="py-2 pl-6 text-left font-medium text-text-secondary">One-hot vector</th>
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
              <td class="py-3 pl-6 font-mono text-sm text-text-secondary">
                [<span
                  v-for="(_, i) in TOKENS"
                  :key="i"
                ><span :class="i === index ? 'font-bold text-positive' : 'text-text-secondary'">{{ i === index ? '1' : '0' }}</span><span v-if="i < TOKENS.length - 1">, </span></span>]
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="mt-2 text-xs text-text-secondary">
        Each token gets a unique integer ID. The one-hot vector is the target format the model learns
        to predict toward — a 1 in exactly one position.
      </p>
    </div>

    <!-- Sentence tokenization demo -->
    <div>
      <h3 class="mb-3 text-sm font-medium text-text-secondary">Tokenizing a sentence</h3>
      <div class="rounded-lg bg-surface-light p-4">
        <div class="mb-3 text-sm text-text-secondary">
          Sentence: <em class="text-text-primary">"A cat sat near a bird"</em>
        </div>

        <!-- Token chips -->
        <div class="flex flex-wrap gap-2">
          <div
            v-for="(word, index) in sentenceWords"
            :key="index"
            class="cursor-default rounded-lg border p-3 text-center transition-all duration-150"
            :style="{
              borderColor: highlightedIndex === index
                ? getTokenColor(index)
                : (isVocabToken(index) ? getTokenColor(index) + '50' : '#363254'),
              backgroundColor: highlightedIndex === index
                ? getTokenColor(index) + '20'
                : 'transparent',
              transform: highlightedIndex === index ? 'translateY(-2px)' : 'none',
              boxShadow: highlightedIndex === index
                ? `0 4px 12px ${getTokenColor(index)}30`
                : 'none',
            }"
            @mouseenter="highlightedIndex = index"
            @mouseleave="highlightedIndex = null"
          >
            <div class="font-mono font-semibold" :style="{ color: getTokenColor(index) }">
              {{ word }}
            </div>
            <div class="mt-1 text-xs">
              <span v-if="isVocabToken(index)" class="font-mono text-brand-light">
                ID {{ getTokenId(index) }}
              </span>
              <span v-else class="text-text-secondary">not vocab</span>
            </div>
          </div>
        </div>

        <!-- Token sequence representation -->
        <div class="mt-4 rounded bg-surface p-3">
          <div class="mb-2 text-xs text-text-secondary">Token ID sequence for model input:</div>
          <div class="flex flex-wrap items-center gap-1 font-mono text-sm">
            <span class="text-text-secondary">[</span>
            <template v-for="(word, index) in sentenceWords" :key="index">
              <span
                class="rounded px-1.5 py-0.5 transition-all duration-150"
                :style="{
                  color: highlightedIndex === index ? getTokenColor(index) : (isVocabToken(index) ? getTokenColor(index) : '#9e9bb0'),
                  fontWeight: isVocabToken(index) ? 'bold' : 'normal',
                  backgroundColor: highlightedIndex === index ? getTokenColor(index) + '25' : 'transparent',
                  outline: highlightedIndex === index ? `1px solid ${getTokenColor(index)}60` : 'none',
                }"
              >{{ isVocabToken(index) ? getTokenId(index) : '?' }}</span>
              <span v-if="index < sentenceWords.length - 1" class="text-text-secondary">,</span>
            </template>
            <span class="text-text-secondary">]</span>
          </div>
          <p class="mt-2 text-xs text-text-secondary">
            Hover over a token to highlight its position in the ID sequence.
            Words outside the vocabulary (shown as&nbsp;?) would get their own IDs in a real tokenizer.
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
        Words in our vocabulary (cat, dog, fish, bird) get integer IDs; others show as ?.
      </p>
    </div>

    <!-- Next-token prediction framing -->
    <div class="rounded-lg bg-surface-light p-4 text-sm">
      <strong class="text-text-primary">Training pair from this sentence:</strong>
      <div class="mt-3 flex flex-wrap items-center gap-2">
        <span class="text-text-secondary">Context:</span>
        <span
          v-for="(word, i) in sentenceWords.slice(0, -1)"
          :key="i"
          class="rounded bg-surface px-2 py-1 font-mono text-xs"
          :style="{ color: getTokenColor(i) }"
        >
          {{ word }}
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
          bird (ID 3)
        </span>
      </div>
    </div>

    <!-- Real-world scale note -->
    <div class="rounded-lg border border-brand/30 bg-brand/5 p-4 text-sm text-text-secondary">
      <strong class="text-brand-light">Real tokenizers:</strong>
      GPT-4 uses a vocabulary of ~100,000 tokens. Common words like "cat" get their own token.
      Rare or long words get split into smaller fragments:
      "tokenization" → ["token", "ization"]. This way the vocabulary stays manageable while
      still being able to represent any word. The model never sees raw text — only integer IDs.
    </div>
  </div>
</template>
