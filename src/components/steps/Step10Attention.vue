<script setup lang="ts">
import { ref, computed } from 'vue'
import { computeSoftmax } from '../../engine/softmax'
import BarChart from '../charts/BarChart.vue'
import FormulaLegend from '../ui/FormulaLegend.vue'
import Callout from '../ui/Callout.vue'

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

const attentionSymbols = [
  { symbol: 'Q', label: 'query vectors ("what am I looking for?")', color: '#93c5fd' },
  { symbol: 'K', label: 'key vectors ("what do I contain?")', color: '#34d399' },
  { symbol: 'V', label: 'value vectors ("what do I contribute?")', color: '#fbbf24' },
]
</script>

<template>
  <div class="space-y-6">
    <FormulaLegend
      latex="\text{Attention} = \text{softmax}(\textcolor{#93c5fd}{Q}\textcolor{#34d399}{K}^T)\textcolor{#fbbf24}{V}"
      :symbols="attentionSymbols"
    />

    <!-- Tie-back to the main tutorial -->
    <Callout title="Two jobs, same math:">
      You've now seen softmax do its first job: turning logits into <em>next-token probabilities</em>.
      Here's its second job: turning similarity scores into <em>attention weights</em> — values that
      control how much each token in the context contributes to the output at a given position.
      The inputs are different (dot-product scores instead of model output logits), but the
      exponentiate-then-normalize machinery is identical.
    </Callout>

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
    <Callout variant="brand" title="Try it:">
      Set the query to [1.0, 0.0] &mdash; the attention will focus heavily on "The" (whose key vector
      is [1.0, 0.0]). Now try [0.0, 1.0] &mdash; attention shifts to "cat." The dot product measures
      alignment between query and key, and softmax converts those alignment scores into weights.
    </Callout>

    <!-- Scope note -->
    <Callout title="Scope note:">
      The attention mechanism's internals are beyond this tutorial's main scope &mdash; this step
      is a brief illustration of how softmax is reused in a second role. The same
      exponentiate-then-normalize pipeline you learned for next-token prediction appears here,
      just with different inputs.
    </Callout>
  </div>
</template>
