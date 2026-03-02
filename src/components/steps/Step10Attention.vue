<script setup lang="ts">
import { ref, computed } from 'vue'
import { computeSoftmax } from '../../engine/softmax'
import BarChart from '../charts/BarChart.vue'
import MathBlock from '../ui/MathBlock.vue'

const keys = ref([
  { label: 'The', vector: [1.0, 0.0] },
  { label: 'cat', vector: [0.0, 1.0] },
  { label: 'sat', vector: [0.5, 0.5] },
  { label: 'down', vector: [-0.5, 0.5] },
])

const query = ref([0.2, 0.8])

// QK^T dot products
const scores = computed(() =>
  keys.value.map(key =>
    key.vector.reduce((sum, val, i) => sum + val * query.value[i], 0)
  )
)

const attentionWeights = computed(() =>
  computeSoftmax(scores.value).probabilities
)

const keyLabels = computed(() => keys.value.map(k => k.label))
const colors = ['#6366f1', '#f59e0b', '#10b981', '#ef4444'] as const
</script>

<template>
  <div class="space-y-6">
    <MathBlock size="md">
      <span class="text-text-secondary">Attention = softmax(</span>
      <span class="text-brand-light">QK<sup>T</sup></span>
      <span class="text-text-secondary">)V</span>
    </MathBlock>

    <!-- Tie-back to the main tutorial -->
    <div class="rounded-lg border border-surface-lighter bg-surface-light/50 p-4 text-sm text-text-secondary">
      <strong class="text-text-primary">Two jobs, same math:</strong>
      You've now seen softmax do its first job: turning logits into <em>next-word probabilities</em>.
      Here's its second job: turning similarity scores into <em>attention weights</em>.
      The inputs are different (dot-product scores instead of network output logits), but the
      exponentiate-then-normalize machinery is identical.
    </div>

    <!-- Editable query vector -->
    <div class="rounded-lg bg-surface-light p-4">
      <h4 class="mb-3 text-sm font-medium text-text-secondary">Query vector Q</h4>
      <div class="flex items-center gap-4">
        <div v-for="(val, i) in query" :key="i" class="flex-1">
          <div class="mb-1 text-center text-xs text-text-secondary">q[{{ i }}]</div>
          <input
            type="range"
            :min="-2"
            :max="2"
            :step="0.1"
            :value="query[i]"
            @input="query[i] = parseFloat(($event.target as HTMLInputElement).value)"
            class="h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-lighter accent-brand"
          />
          <div class="mt-1 text-center font-mono text-sm text-brand-light">{{ query[i].toFixed(1) }}</div>
        </div>
      </div>
    </div>

    <!-- Score computation -->
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-surface-lighter text-text-secondary">
            <th class="py-2 text-left font-medium">Key token</th>
            <th class="py-2 text-right font-medium">K vector</th>
            <th class="py-2 text-right font-medium">Q&middot;K score</th>
            <th class="py-2 text-right font-medium">Attention weight</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(key, index) in keys"
            :key="key.label"
            class="border-b border-surface-lighter/50"
          >
            <td class="py-2 font-semibold" :style="{ color: colors[index] }">{{ key.label }}</td>
            <td class="py-2 text-right font-mono text-text-secondary">
              [{{ key.vector.map(v => v.toFixed(1)).join(', ') }}]
            </td>
            <td class="py-2 text-right font-mono text-brand-light">
              {{ scores[index].toFixed(3) }}
            </td>
            <td class="py-2 text-right font-mono font-bold" :style="{ color: colors[index] }">
              {{ (attentionWeights[index] * 100).toFixed(1) }}%
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <BarChart
      :labels="keyLabels"
      :values="attentionWeights"
      :colors="colors"
      title="Attention Weights"
      :precision="4"
      y-axis-label="weight"
    />

    <!-- Try it callout -->
    <div class="rounded-lg border border-brand/30 bg-brand/5 p-4 text-sm text-text-secondary">
      <strong class="text-brand-light">Try it:</strong>
      Set the query to [1.0, 0.0] &mdash; the attention will focus heavily on "The" (whose key vector
      is [1.0, 0.0]). Now try [0.0, 1.0] &mdash; attention shifts to "cat." The dot product measures
      alignment between query and key, and softmax converts those alignment scores into weights.
    </div>

    <!-- Summary -->
    <div class="rounded-lg border border-positive/30 bg-positive/5 p-4 text-sm text-text-secondary">
      <strong class="text-positive">Congratulations!</strong>
      You've traced the complete pipeline from raw logits to trained predictions, and seen softmax
      in both of its key roles. These aren't simplified toy versions &mdash; the exact same
      exponentiation, normalization, cross-entropy loss, and gradient descent you explored here
      run inside every modern language model, billions of times per forward pass.
    </div>
  </div>
</template>
