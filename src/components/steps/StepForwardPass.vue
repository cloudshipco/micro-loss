<script setup lang="ts">
import { ref, computed } from 'vue'
import { TOKENS, TOKEN_COLORS } from '../../engine/types'
import {
  EXAMPLE_CONTEXT_TOKEN_IDS,
  EXAMPLE_EMBEDDING_MATRIX,
  EXAMPLE_CONTEXT_VECTOR,
} from '../../engine/model-config'

// Training document for the "positions" visualisation
const document = ['the', 'cat', 'ate', 'fish']
const highlightedPosition = ref(3)

function contextFor(targetIdx: number) {
  return document.slice(0, targetIdx)
}
function targetFor(targetIdx: number) {
  return document[targetIdx]
}

// Forward pass animation — uses concrete micro-model values
const stage = ref<0 | 1 | 2 | 3 | 4>(0)

// Example context: "the cat ate" → IDs [0, 1, 2]
const exampleTokens = EXAMPLE_CONTEXT_TOKEN_IDS.map(id => ({
  word: TOKENS[id],
  id,
  color: TOKEN_COLORS[id],
}))

// Embeddings looked up from the matrix
const exampleEmbeddings = EXAMPLE_CONTEXT_TOKEN_IDS.map(id => EXAMPLE_EMBEDDING_MATRIX[id])

// Post-layer transformed vectors (different from embeddings to show the layer did something)
const transformedVectors: number[][] = [
  [+0.031, -0.042, +0.018, +0.127, -0.056, +0.039, -0.013, +0.068],
  [+0.089, -0.105, +0.062, +0.283, -0.041, +0.148, -0.097, +0.051],
  [+0.412, -0.287, +0.153, +0.541, -0.098, +0.326, -0.215, +0.178],
]

const contextVector = EXAMPLE_CONTEXT_VECTOR

// SVG diagram constants
const diagramTokens = EXAMPLE_CONTEXT_TOKEN_IDS.map((id, pos) => ({
  word: TOKENS[id],
  id,
  pos,
  color: TOKEN_COLORS[id],
}))

// Format a number for display in the animation
function fmt(n: number): string {
  const s = n.toFixed(3)
  return n >= 0 ? '+' + s : s
}

async function animate() {
  stage.value = 1
  await delay(1000)
  stage.value = 2
  await delay(1200)
  stage.value = 3
  await delay(1200)
  stage.value = 4
  await delay(2000)
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
          scores for every vocabulary token. Only one score — the target's — should be high.
          This document of {{ document.length }} tokens gives
          {{ document.length - 1 }} training examples.
        </p>
      </div>
    </div>

    <!-- ─── SVG DATA-FLOW DIAGRAM ─── -->
    <div class="rounded-lg bg-surface-light p-5">
      <div class="mb-1 text-sm font-medium text-text-secondary">Forward pass data flow</div>
      <div class="mb-4 text-xs text-text-secondary">
        Context <em>"the cat ate"</em> enters the model. Each token ID looks up a row in the embedding matrix,
        then the layer transforms all vectors, and the final position's output becomes the context vector.
      </div>

      <div class="overflow-x-auto">
        <svg viewBox="0 0 760 290" class="min-w-[760px]" xmlns="http://www.w3.org/2000/svg">
          <!-- ── Token IDs column ── -->
          <text x="60" y="20" text-anchor="middle" fill="#9e9bb0" font-size="11" font-weight="600">Token IDs</text>

          <!-- Token ID boxes -->
          <rect x="20" y="40" width="80" height="32" rx="6" :fill="TOKEN_COLORS[0] + '20'" :stroke="TOKEN_COLORS[0]" stroke-width="1.5"/>
          <text x="60" y="61" text-anchor="middle" :fill="TOKEN_COLORS[0]" font-size="13" font-weight="600">the = 0</text>

          <rect x="20" y="90" width="80" height="32" rx="6" :fill="TOKEN_COLORS[1] + '20'" :stroke="TOKEN_COLORS[1]" stroke-width="1.5"/>
          <text x="60" y="111" text-anchor="middle" :fill="TOKEN_COLORS[1]" font-size="13" font-weight="600">cat = 1</text>

          <rect x="20" y="140" width="80" height="32" rx="6" :fill="TOKEN_COLORS[2] + '20'" :stroke="TOKEN_COLORS[2]" stroke-width="1.5"/>
          <text x="60" y="161" text-anchor="middle" :fill="TOKEN_COLORS[2]" font-size="13" font-weight="600">ate = 2</text>

          <!-- Position labels under token IDs -->
          <text x="60" y="85" text-anchor="middle" fill="#9e9bb0" font-size="9">pos 0</text>
          <text x="60" y="135" text-anchor="middle" fill="#9e9bb0" font-size="9">pos 1</text>
          <text x="60" y="185" text-anchor="middle" fill="#9e9bb0" font-size="9">pos 2</text>

          <!-- ── Embedding matrix ── -->
          <text x="240" y="20" text-anchor="middle" fill="#9e9bb0" font-size="11" font-weight="600">Embedding Matrix (4×8)</text>

          <!-- Matrix background -->
          <rect x="155" y="30" width="170" height="115" rx="6" fill="#1e1b2e" stroke="#363254" stroke-width="1"/>

          <!-- Row labels and highlights -->
          <!-- Row 0: the -->
          <rect x="157" y="33" width="166" height="24" rx="3" :fill="TOKEN_COLORS[0] + '15'"/>
          <text x="165" y="50" fill="#9e9bb0" font-size="9">0 the</text>
          <text x="200" y="50" fill="#e2e0ea" font-size="8.5" font-family="monospace">+.014 −.031 +.008 …</text>

          <!-- Row 1: cat -->
          <rect x="157" y="59" width="166" height="24" rx="3" :fill="TOKEN_COLORS[1] + '15'"/>
          <text x="165" y="76" fill="#9e9bb0" font-size="9">1 cat</text>
          <text x="200" y="76" fill="#e2e0ea" font-size="8.5" font-family="monospace">−.018 +.025 −.009 …</text>

          <!-- Row 2: ate -->
          <rect x="157" y="85" width="166" height="24" rx="3" :fill="TOKEN_COLORS[2] + '15'"/>
          <text x="165" y="102" fill="#9e9bb0" font-size="9">2 ate</text>
          <text x="200" y="102" fill="#e2e0ea" font-size="8.5" font-family="monospace">+.022 −.011 +.030 …</text>

          <!-- Row 3: fish (not in context — unhighlighted) -->
          <rect x="157" y="111" width="166" height="24" rx="3" fill="#1e1b2e"/>
          <text x="165" y="128" fill="#9e9bb0" font-size="9">3 fish</text>
          <text x="200" y="128" fill="#9e9bb0" font-size="8.5" font-family="monospace">−.009 +.016 −.024 …</text>

          <!-- ── Arrows from Token IDs to matrix rows ── -->
          <!-- the (ID=0, pos 0) → row 0 -->
          <path d="M 100 56 C 120 56, 135 45, 157 45" fill="none" :stroke="TOKEN_COLORS[0]" stroke-width="1.5" opacity="0.7"/>
          <!-- cat (ID=1, pos 1) → row 1 -->
          <path d="M 100 106 C 120 106, 135 69, 157 69" fill="none" :stroke="TOKEN_COLORS[1]" stroke-width="1.5" opacity="0.7"/>
          <!-- ate (ID=2, pos 2) → row 2 -->
          <path d="M 100 156 C 120 156, 135 97, 157 97" fill="none" :stroke="TOKEN_COLORS[2]" stroke-width="1.5" opacity="0.7"/>

          <!-- ── + Position embedding ── -->
          <text x="365" y="20" text-anchor="middle" fill="#9e9bb0" font-size="11" font-weight="600">+ Position</text>

          <rect x="340" y="36" width="50" height="24" rx="4" fill="#1e1b2e" stroke="#363254" stroke-width="1"/>
          <text x="365" y="52" text-anchor="middle" fill="#9e9bb0" font-size="9">+ pos 0</text>

          <rect x="340" y="66" width="50" height="24" rx="4" fill="#1e1b2e" stroke="#363254" stroke-width="1"/>
          <text x="365" y="82" text-anchor="middle" fill="#9e9bb0" font-size="9">+ pos 1</text>

          <rect x="340" y="96" width="50" height="24" rx="4" fill="#1e1b2e" stroke="#363254" stroke-width="1"/>
          <text x="365" y="112" text-anchor="middle" fill="#9e9bb0" font-size="9">+ pos 2</text>

          <!-- Arrows: matrix → position -->
          <line x1="325" y1="45" x2="340" y2="48" stroke="#363254" stroke-width="1"/>
          <line x1="325" y1="71" x2="340" y2="78" stroke="#363254" stroke-width="1"/>
          <line x1="325" y1="97" x2="340" y2="108" stroke="#363254" stroke-width="1"/>

          <!-- ── Layer (black box) ── -->
          <text x="480" y="20" text-anchor="middle" fill="#9e9bb0" font-size="11" font-weight="600">Layer 1</text>

          <rect x="425" y="30" width="110" height="115" rx="8" fill="none" stroke="#363254" stroke-width="2" stroke-dasharray="6 4"/>

          <text x="480" y="60" text-anchor="middle" fill="#9e9bb0" font-size="9" opacity="0.5">Attention</text>
          <line x1="445" y1="66" x2="515" y2="66" stroke="#363254" stroke-width="0.5" stroke-dasharray="3 3"/>
          <text x="480" y="82" text-anchor="middle" fill="#9e9bb0" font-size="9" opacity="0.5">Feedforward</text>
          <line x1="445" y1="88" x2="515" y2="88" stroke="#363254" stroke-width="0.5" stroke-dasharray="3 3"/>
          <text x="480" y="104" text-anchor="middle" fill="#9e9bb0" font-size="9" opacity="0.5">Norm</text>

          <text x="480" y="132" text-anchor="middle" fill="#9e9bb0" font-size="8" font-style="italic">(black box)</text>

          <!-- Arrows: position → layer -->
          <line x1="390" y1="48" x2="425" y2="55" stroke="#363254" stroke-width="1"/>
          <line x1="390" y1="78" x2="425" y2="78" stroke="#363254" stroke-width="1"/>
          <line x1="390" y1="108" x2="425" y2="100" stroke="#363254" stroke-width="1"/>

          <!-- ── Context vector (output) ── -->
          <text x="640" y="20" text-anchor="middle" fill="#9e9bb0" font-size="11" font-weight="600">Output Vectors</text>

          <!-- Faded vectors for pos 0 and pos 1 -->
          <rect x="580" y="36" width="120" height="24" rx="4" fill="#1e1b2e" stroke="#363254" stroke-width="1" opacity="0.3"/>
          <text x="640" y="52" text-anchor="middle" fill="#9e9bb0" font-size="9" opacity="0.3">pos 0 (not used)</text>

          <rect x="580" y="66" width="120" height="24" rx="4" fill="#1e1b2e" stroke="#363254" stroke-width="1" opacity="0.3"/>
          <text x="640" y="82" text-anchor="middle" fill="#9e9bb0" font-size="9" opacity="0.3">pos 1 (not used)</text>

          <!-- Context vector: pos 2 highlighted -->
          <rect x="580" y="96" width="120" height="24" rx="4" fill="#34d39920" stroke="#34d399" stroke-width="1.5"/>
          <text x="640" y="112" text-anchor="middle" fill="#34d399" font-size="9" font-weight="600">Context Vector ✓</text>

          <!-- Arrows: layer → outputs -->
          <line x1="535" y1="55" x2="580" y2="48" stroke="#363254" stroke-width="1" opacity="0.3"/>
          <line x1="535" y1="78" x2="580" y2="78" stroke="#363254" stroke-width="1" opacity="0.3"/>
          <line x1="535" y1="100" x2="580" y2="108" stroke="#34d399" stroke-width="1.5" opacity="0.7"/>

          <!-- ── Caption ── -->
          <text x="10" y="210" fill="#9e9bb0" font-size="10">
            <tspan x="10" dy="0" font-weight="600" fill="#e2e0ea">Embedding lookup:</tspan>
            <tspan> each token ID selects a row from the matrix — a table lookup, not a computation.</tspan>
          </text>
          <text x="10" y="228" fill="#9e9bb0" font-size="10">
            <tspan font-weight="600" fill="#e2e0ea">Position embeddings</tspan>
            <tspan> are added so the model knows word order (otherwise "the cat ate" = "ate cat the").</tspan>
          </text>
          <text x="10" y="246" fill="#9e9bb0" font-size="10">
            <tspan font-weight="600" fill="#e2e0ea">Only the final position</tspan>
            <tspan> produces the context vector — earlier positions' outputs are discarded.</tspan>
          </text>
        </svg>
      </div>
    </div>

    <!-- Position embedding explainer -->
    <div class="rounded-lg border border-surface-lighter bg-surface-light/50 p-4 text-sm text-text-secondary">
      <strong class="text-text-primary">How position embeddings work:</strong>
      The token embedding for "cat" is the same regardless of where "cat" appears in the sequence.
      Without position information, the model couldn't distinguish "the cat ate" from "ate the cat"
      — the same three vectors in a different order.
      <p class="mt-2">
        Position embeddings fix this: there's a separate learned vector for each position (pos 0, pos 1, pos 2, ...).
        The position vector is simply <strong class="text-text-primary">added</strong> to the token embedding:
        <span class="font-mono text-brand-light">input = token_embedding + position_embedding</span>.
        After this addition, two copies of "cat" at different positions have different vectors — the model now
        knows both <em>what</em> the token is and <em>where</em> it sits.
      </p>
    </div>

    <!-- ─── ENHANCED ANIMATION ─── -->
    <div class="rounded-lg bg-surface-light p-5">
      <div class="mb-1 text-sm font-medium text-text-secondary">Inside the forward pass</div>
      <div class="mb-4 text-xs text-text-secondary">
        Press animate to step through what happens when context tokens
        <span v-for="(t, i) in exampleTokens" :key="t.word">
          <span class="font-mono font-semibold" :style="{ color: t.color }">{{ t.word }}</span><span v-if="i < exampleTokens.length - 1">,
          </span>
        </span>
        flow through the model.
      </div>

      <!-- Step pipeline -->
      <div class="space-y-3">

        <!-- Stage 1: Token IDs -->
        <div class="flex items-start gap-3 rounded-lg border p-3 transition-all duration-300"
          :class="stage === 1 ? 'border-brand bg-brand/10' : 'border-surface-lighter bg-surface'">
          <div class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
            :class="stage === 1 ? 'bg-brand text-white' : 'bg-surface-lighter text-text-secondary'">1</div>
          <div>
            <div class="text-sm font-medium text-text-primary">Tokens enter as IDs</div>
            <div class="mt-1 text-xs text-text-secondary">
              Each context token, represented as an integer ID:
              <span v-for="(t, i) in exampleTokens" :key="t.word" class="font-mono">
                <span class="font-semibold" :style="{ color: t.color }">{{ t.word }}</span><span class="text-text-secondary">→{{ t.id }}</span><span v-if="i < exampleTokens.length - 1">,
                </span>
              </span>
            </div>
          </div>
        </div>

        <!-- Stage 2: Embedding lookup -->
        <div class="flex items-start gap-3 rounded-lg border p-3 transition-all duration-300"
          :class="stage === 2 ? 'border-brand bg-brand/10' : 'border-surface-lighter bg-surface'">
          <div class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
            :class="stage === 2 ? 'bg-brand text-white' : 'bg-surface-lighter text-text-secondary'">2</div>
          <div class="min-w-0 flex-1">
            <div class="text-sm font-medium text-text-primary">Embedding lookup</div>
            <div class="mt-1 text-xs text-text-secondary">
              Each ID looks up a row from the embedding matrix —
              <strong class="text-text-primary">a table lookup, not a calculation</strong>.
            </div>
            <div v-if="stage >= 2" class="mt-2 space-y-1 overflow-x-auto">
              <div v-for="(t, i) in exampleTokens" :key="t.word"
                class="flex items-center gap-2 rounded bg-surface/50 px-2 py-1">
                <span class="w-10 shrink-0 font-mono text-xs font-semibold" :style="{ color: t.color }">{{ t.word }}</span>
                <span class="font-mono text-[10px] leading-tight text-text-secondary whitespace-nowrap">
                  [<span v-for="(v, j) in exampleEmbeddings[i]" :key="j">{{ fmt(v) }}<span v-if="j < 7">, </span></span>]
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Stage 3: Layer transforms -->
        <div class="flex items-start gap-3 rounded-lg border p-3 transition-all duration-300"
          :class="stage === 3 ? 'border-brand bg-brand/10' : 'border-surface-lighter bg-surface'">
          <div class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
            :class="stage === 3 ? 'bg-brand text-white' : 'bg-surface-lighter text-text-secondary'">3</div>
          <div class="min-w-0 flex-1">
            <div class="text-sm font-medium text-text-primary">Layer transforms all vectors</div>
            <div class="mt-1 text-xs text-text-secondary">
              Attention, feedforward, and normalisation transform every vector.
              Information flows between positions — this is the black box.
            </div>
            <div v-if="stage >= 3" class="mt-2 space-y-1 overflow-x-auto">
              <div v-for="(t, i) in exampleTokens" :key="t.word"
                class="flex items-center gap-2 rounded bg-surface/50 px-2 py-1"
                :class="{ 'opacity-40': stage === 4 && i < exampleTokens.length - 1 }">
                <span class="w-10 shrink-0 font-mono text-xs font-semibold" :style="{ color: t.color }">{{ t.word }}</span>
                <span class="font-mono text-[10px] leading-tight text-text-secondary whitespace-nowrap">
                  [<span v-for="(v, j) in transformedVectors[i]" :key="j">{{ fmt(v) }}<span v-if="j < 7">, </span></span>]
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Stage 4: Context vector -->
        <div class="flex items-start gap-3 rounded-lg border p-3 transition-all duration-300"
          :class="stage === 4 ? 'border-positive bg-positive/10' : 'border-surface-lighter bg-surface'">
          <div class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
            :class="stage === 4 ? 'bg-positive text-white' : 'bg-surface-lighter text-text-secondary'">4</div>
          <div class="min-w-0 flex-1">
            <div class="text-sm font-medium text-text-primary">Context vector extracted</div>
            <div class="mt-1 text-xs text-text-secondary">
              The final position's vector is the <strong class="text-text-primary">context vector</strong>
              — earlier positions are discarded.
            </div>
            <div v-if="stage === 4" class="mt-2 overflow-x-auto">
              <div class="flex items-center gap-2 rounded border border-positive/30 bg-positive/5 px-2 py-1">
                <span class="shrink-0 text-xs font-semibold text-positive">context vector =</span>
                <span class="font-mono text-[10px] leading-tight text-positive whitespace-nowrap">
                  [<span v-for="(v, j) in contextVector" :key="j">{{ fmt(v) }}<span v-if="j < 7">, </span></span>]
                </span>
              </div>
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
        <span v-if="stage === 1" class="text-sm text-brand-light">Token IDs enter…</span>
        <span v-else-if="stage === 2" class="text-sm text-brand-light">Embedding lookup…</span>
        <span v-else-if="stage === 3" class="text-sm text-brand-light">Layer transforms vectors…</span>
        <span v-else-if="stage === 4" class="text-sm text-positive">Context vector produced</span>
      </div>
    </div>

    <!-- Bridge -->
    <div class="rounded-lg border border-brand/30 bg-brand/5 p-4 text-sm text-text-secondary">
      <strong class="text-brand-light">The context vector is not yet the output.</strong>
      It still needs to be compared against every vocabulary token to produce scores.
      That comparison — and the precise mechanism that does it — is the next step.
    </div>

  </div>
</template>
