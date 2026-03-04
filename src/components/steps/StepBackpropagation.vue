<script setup lang="ts">
import { computed } from 'vue'
import katex from 'katex'
import { useComputationGraph } from '../../composables/useComputationGraph'
import { TOKEN_COLORS } from '../../engine/types'
import FormulaLegend from '../ui/FormulaLegend.vue'
import Callout from '../ui/Callout.vue'
import DeepDive from '../ui/DeepDive.vue'

const km = (latex: string) => katex.renderToString(latex, { throwOnError: false, displayMode: false })

const DEFAULT_LOGITS = [0.1, 0.5, 1.0, 2.0]
const TARGET_INDEX = 3 // fish

const {
  mode,
  nodes,
  edges,
  stepForward,
  runFullForward,
  stepBackward,
  runFullBackward,
  reset,
  isForwardComplete,
  isBackwardComplete,
  graph,
} = useComputationGraph(DEFAULT_LOGITS, TARGET_INDEX)

// Chain rule derivation rows
const chainRuleRows = computed(() => {
  const g = graph.value
  const p = g.pTarget.data
  return [
    {
      labelHtml: km('\\partial L / \\partial \\log(p)'),
      formulaHtml: km('-1'),
      value: -1,
      description: `Derivative of ${km('-\\log(p)')} w.r.t. ${km('\\log(p)')}`,
    },
    {
      labelHtml: km('\\partial \\log(p) / \\partial p'),
      formulaHtml: km('1/p'),
      value: 1 / p,
      description: `Derivative of ${km('\\log(p)')} w.r.t. ${km('p')} = ${km(`1/${p.toFixed(4)}`)}`,
    },
    {
      labelHtml: km('\\partial p / \\partial z') + ' (for target)',
      formulaHtml: km('p(1-p)'),
      value: p * (1 - p),
      description: `Softmax derivative = ${km(`${p.toFixed(4)} \\times ${(1 - p).toFixed(4)}`)}`,
    },
    {
      labelHtml: km('\\partial L / \\partial z') + ' (chain rule)',
      formulaHtml: km('-1 \\times 1/p \\times p(1-p) = -(1-p) = p-1'),
      value: p - 1,
      description: `The clean result: ${km(`${p.toFixed(4)} - 1 = ${(p - 1).toFixed(4)}`)}`,
    },
  ]
})

function nodeColor(node: { highlighted: boolean; gradHighlighted: boolean }): string {
  if (node.gradHighlighted) return '#f59e0b'
  if (node.highlighted) return TOKEN_COLORS[TARGET_INDEX]
  return '#4a4660'
}

function edgeColor(edge: { highlighted: boolean; gradHighlighted: boolean }): string {
  if (edge.gradHighlighted) return '#f59e0b'
  if (edge.highlighted) return TOKEN_COLORS[TARGET_INDEX] + '80'
  return '#363254'
}

function getEdgePath(edge: { from: string; to: string }): string {
  const fromNode = nodes.value.find(n => n.id === edge.from)
  const toNode = nodes.value.find(n => n.id === edge.to)
  if (!fromNode || !toNode) return ''

  // Vertical relationship (same x): route from top/bottom center
  if (fromNode.x === toNode.x) {
    const goingUp = fromNode.y > toNode.y
    const y1 = goingUp ? fromNode.y - 28 : fromNode.y + 28
    const y2 = goingUp ? toNode.y + 28 : toNode.y - 28
    return `M ${fromNode.x} ${y1} L ${fromNode.x} ${y2}`
  }

  // Horizontal relationship: Bezier from right side to left side
  const x1 = fromNode.x + 40
  const y1 = fromNode.y
  const x2 = toNode.x - 40
  const y2 = toNode.y
  const cx1 = x1 + (x2 - x1) * 0.4
  const cx2 = x2 - (x2 - x1) * 0.4
  return `M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`
}
</script>

<template>
  <div class="space-y-6">

    <FormulaLegend
      latex="\textcolor{#34d399}{\frac{\partial L}{\partial z}} = \textcolor{#93c5fd}{\frac{\partial L}{\partial p}} \cdot \textcolor{#fbbf24}{\frac{\partial p}{\partial z}}"
      :symbols="[
        { symbol: '\\partial L / \\partial z', label: 'gradient w.r.t. logits (what we need)', color: '#34d399' },
        { symbol: '\\partial L / \\partial p', label: 'how loss changes with probabilities', color: '#93c5fd' },
        { symbol: '\\partial p / \\partial z', label: 'how probabilities change with logits', color: '#fbbf24' },
      ]"
    />

    <DeepDive title="The chain rule in detail">
      <p>Think of exchange rates: if £1 = $1.30 and $1 = ¥150, then £1 = 1.30 × 150 = ¥195.
        Each node in the computation graph is one "exchange" — backpropagation multiplies them
        together, link by link. The chain rule table below shows exactly this: each row is one
        local derivative (one exchange rate), and the final row is their product — the total
        gradient that reaches the logit.</p>
    </DeepDive>

    <!-- Computation graph SVG -->
    <div class="rounded-lg bg-surface-light p-4">
      <div class="mb-3 flex items-center justify-between">
        <h4 class="text-sm font-medium text-text-secondary">
          Computation graph
          <span class="ml-2 text-xs text-text-secondary/60">
            (target token: <span class="font-bold" :style="{ color: TOKEN_COLORS[3] }">fish</span>)
          </span>
        </h4>
        <div class="flex items-center gap-2 text-xs text-text-secondary">
          <span class="flex items-center gap-1">
            <span class="inline-block h-2 w-4 rounded" :style="{ backgroundColor: TOKEN_COLORS[TARGET_INDEX] }" />
            forward
          </span>
          <span class="flex items-center gap-1">
            <span class="inline-block h-2 w-4 rounded bg-[#f59e0b]" />
            backward
          </span>
        </div>
      </div>

      <div class="overflow-x-auto">
        <svg viewBox="0 0 700 240" class="w-full min-w-[600px]" style="max-height: 240px">
          <!-- Edges -->
          <g v-for="edge in edges" :key="`${edge.from}-${edge.to}`">
            <path
              :d="getEdgePath(edge)"
              fill="none"
              :stroke="edgeColor(edge)"
              :stroke-width="edge.highlighted || edge.gradHighlighted ? 2.5 : 1.5"
              class="transition-all duration-300"
            />
            <!-- Arrowhead approximation for backward -->
            <circle
              v-if="edge.gradHighlighted"
              :cx="nodes.find(n => n.id === edge.from)!.x + 40"
              :cy="nodes.find(n => n.id === edge.from)!.y"
              r="4"
              fill="#f59e0b"
              class="transition-all duration-300"
            />
          </g>

          <!-- Nodes -->
          <g v-for="node in nodes" :key="node.id">
            <rect
              :x="node.x - 38"
              :y="node.y - 28"
              width="76"
              height="56"
              rx="8"
              :fill="nodeColor(node) + '20'"
              :stroke="nodeColor(node)"
              :stroke-width="node.highlighted || node.gradHighlighted ? 2 : 1"
              class="transition-all duration-300"
            />
            <!-- Label -->
            <text
              :x="node.x"
              :y="node.y - 10"
              text-anchor="middle"
              :fill="nodeColor(node)"
              font-size="11"
              font-weight="600"
              class="transition-all duration-300"
            >
              {{ node.label }}
            </text>
            <!-- Forward value -->
            <text
              v-if="node.highlighted || node.gradHighlighted"
              :x="node.x"
              :y="node.y + 6"
              text-anchor="middle"
              fill="#e2e0ea"
              font-size="10"
              font-family="monospace"
            >
              {{ node.value.toFixed(3) }}
            </text>
            <!-- Gradient value (shown during backward) -->
            <text
              v-if="node.gradHighlighted && mode === 'backward'"
              :x="node.x"
              :y="node.y + 20"
              text-anchor="middle"
              fill="#f59e0b"
              font-size="9"
              font-family="monospace"
            >
              ∇ {{ node.grad.toFixed(4) }}
            </text>
            <!-- Operation label (below node) -->
            <text
              v-if="node.opLabel"
              :x="node.x"
              :y="node.y + 42"
              text-anchor="middle"
              fill="#9e9bb0"
              font-size="9"
            >
              {{ node.opLabel }}
            </text>
          </g>
        </svg>
      </div>

      <!-- Nabla explanation (shown during backward pass) -->
      <p v-if="mode === 'backward'" class="mt-3 text-xs text-text-secondary">
        <strong class="text-[#f59e0b]">∇</strong> (nabla) shows the <strong class="text-text-primary">gradient</strong> at each node —
        how much the final loss would change if that node's value changed by a tiny amount.
        <strong class="text-[#f59e0b]">∇ 1.0000</strong> on the Loss node is the trivial starting point: a change of 1 in the loss
        causes a change of 1 in the loss. Backpropagation works backward from this anchor, computing ∇ for every upstream node.
      </p>

      <!-- Controls -->
      <div class="mt-3 flex flex-wrap items-center gap-2">
        <button
          @click="stepForward"
          :disabled="isForwardComplete && mode === 'forward'"
          class="rounded-lg border border-brand/50 bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand-light transition hover:bg-brand/20 disabled:opacity-40"
        >
          Forward &rarr;
        </button>
        <button
          @click="runFullForward"
          class="rounded-lg border border-brand/50 bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand-light transition hover:bg-brand/20"
        >
          Full forward
        </button>
        <button
          @click="stepBackward"
          class="rounded-lg border border-[#f59e0b]/50 bg-[#f59e0b]/10 px-3 py-1.5 text-xs font-semibold text-[#f59e0b] transition hover:bg-[#f59e0b]/20"
        >
          &larr; Backward
        </button>
        <button
          @click="runFullBackward"
          class="rounded-lg border border-[#f59e0b]/50 bg-[#f59e0b]/10 px-3 py-1.5 text-xs font-semibold text-[#f59e0b] transition hover:bg-[#f59e0b]/20"
        >
          Full backward
        </button>
        <button
          @click="reset"
          class="rounded-lg border border-surface-lighter bg-surface px-3 py-1.5 text-xs text-text-secondary transition hover:border-brand hover:text-text-primary"
        >
          Reset
        </button>
      </div>
    </div>

    <!-- Chain rule derivation -->
    <div class="rounded-lg bg-surface-light p-5">
      <h4 class="mb-3 text-sm font-medium text-text-secondary">
        Chain rule: how <span v-html="km('p - y')"></span> emerges
      </h4>
      <p class="mb-4 text-sm text-text-secondary">
        Each step backward multiplies by the local derivative. Watch the chain rule build up
        to the final gradient:
      </p>

      <div class="space-y-2">
        <div
          v-for="(row, i) in chainRuleRows"
          :key="row.label"
          class="flex items-start gap-3 rounded-lg p-3 transition-colors"
          :class="i === chainRuleRows.length - 1
            ? 'bg-positive/10 border border-positive/30'
            : 'bg-surface'"
        >
          <div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
            :class="i === chainRuleRows.length - 1 ? 'bg-positive/20 text-positive' : 'bg-surface-lighter text-text-secondary'"
          >
            {{ i + 1 }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span class="text-sm font-medium text-text-primary" v-html="row.labelHtml"></span>
              <span class="text-xs text-brand-light">= <span v-html="row.formulaHtml"></span></span>
              <span class="font-mono text-xs"
                :class="i === chainRuleRows.length - 1 ? 'text-positive font-bold' : 'text-text-secondary'"
              >
                = {{ row.value.toFixed(4) }}
              </span>
            </div>
            <p class="mt-0.5 text-xs text-text-secondary" v-html="row.description"></p>
          </div>
        </div>
      </div>

      <Callout variant="positive" title="Result:" class="mt-4">
        The chain rule collapses to <strong class="text-positive"><span v-html="km('p - 1')"></span></strong> for the target token.
        For non-target tokens, the derivation is similar but <span v-html="km('y = 0')"></span>, giving gradient = <strong class="text-negative"><span v-html="km('p')"></span></strong>.
        Combined: <strong class="text-text-primary"><span v-html="km('\\nabla L = p - y')"></span></strong>.
      </Callout>
    </div>

    <!-- Gradient accumulation mini-demo -->
    <div class="rounded-lg bg-surface-light p-4">
      <h4 class="mb-2 text-sm font-medium text-text-secondary">Gradient accumulation</h4>
      <p class="mb-3 text-sm text-text-secondary">
        When a variable feeds into <em>multiple</em> downstream computations, its gradient is the
        <strong class="text-text-primary">sum</strong> of gradients along each path. In our softmax,
        each logit <span v-html="km('z_i')"></span> affects both <span v-html="km('e^{z_i}')"></span> and the sum <span v-html="km('\\sum e^z')"></span> —
        so its total gradient adds contributions from both paths.
      </p>

      <div class="overflow-x-auto">
        <svg viewBox="0 0 400 160" class="mx-auto w-full max-w-md" style="max-height: 160px">
          <!-- z node -->
          <rect x="20" y="55" width="60" height="40" rx="6" fill="#10b98120" stroke="#10b981" stroke-width="1.5" />
          <text x="50" y="78" text-anchor="middle" fill="#10b981" font-size="12" font-weight="600">z_fish</text>

          <!-- Path 1: via exp -->
          <path d="M 80 65 C 120 65, 140 40, 170 40" fill="none" stroke="#10b98180" stroke-width="1.5" />
          <rect x="170" y="20" width="70" height="40" rx="6" fill="#10b98120" stroke="#10b981" stroke-width="1" />
          <text x="205" y="44" text-anchor="middle" fill="#10b981" font-size="11">e^(z_fish)</text>
          <text x="205" y="76" text-anchor="middle" fill="#f59e0b" font-size="10">∂L/∂exp</text>

          <!-- Path 2: via sum -->
          <path d="M 80 85 C 120 85, 140 110, 170 110" fill="none" stroke="#10b98180" stroke-width="1.5" />
          <rect x="170" y="90" width="70" height="40" rx="6" fill="#10b98120" stroke="#10b981" stroke-width="1" />
          <text x="205" y="114" text-anchor="middle" fill="#10b981" font-size="11">Σe^z</text>
          <text x="205" y="146" text-anchor="middle" fill="#f59e0b" font-size="10">∂L/∂sum</text>

          <!-- Sum symbol -->
          <text x="300" y="78" text-anchor="middle" fill="#f59e0b" font-size="20" font-weight="bold">+</text>

          <!-- Total gradient -->
          <rect x="330" y="55" width="60" height="40" rx="6" fill="#f59e0b20" stroke="#f59e0b" stroke-width="1.5" />
          <text x="360" y="72" text-anchor="middle" fill="#f59e0b" font-size="10" font-weight="600">total</text>
          <text x="360" y="86" text-anchor="middle" fill="#f59e0b" font-size="10">∂L/∂z</text>

          <!-- Arrows to sum -->
          <path d="M 240 40 L 285 68" fill="none" stroke="#f59e0b80" stroke-width="1.5" />
          <path d="M 240 110 L 285 82" fill="none" stroke="#f59e0b80" stroke-width="1.5" />
          <path d="M 315 75 L 330 75" fill="none" stroke="#f59e0b" stroke-width="1.5" />
        </svg>
      </div>

      <p class="mt-3 text-xs text-text-secondary">
        This is why backpropagation implementations track the full graph, not just a single path.
        Every connection contributes to the final gradient.
      </p>
    </div>

    <!-- Summary callout -->
    <Callout variant="brand" title="Key takeaway:">
      Backpropagation is just the chain rule applied systematically to a computation graph.
      For our softmax + cross-entropy pipeline, the chain rule simplifies to <strong class="text-text-primary"><span v-html="km('p - y')"></span></strong> —
      the prediction minus the truth. Every neural network uses this exact algorithm to compute gradients,
      just with far more nodes in the graph.
    </Callout>
  </div>
</template>
