import { ref, computed } from 'vue'
import { buildFocusedGraph, type FocusedGraph } from '../engine/autograd'

export type GraphMode = 'idle' | 'forward' | 'backward'

export interface GraphNode {
  id: string
  label: string
  value: number
  grad: number
  x: number
  y: number
  highlighted: boolean
  gradHighlighted: boolean
  opLabel?: string
}

export interface GraphEdge {
  from: string
  to: string
  highlighted: boolean
  gradHighlighted: boolean
}

/**
 * Manages the computation graph state for the backpropagation step.
 * Supports step-by-step forward and backward animation.
 */
export function useComputationGraph(initialLogits: number[], targetIndex: number) {
  const logits = ref([...initialLogits])
  const mode = ref<GraphMode>('idle')
  const forwardStep = ref(-1)  // -1 = not started, 0..N = current node
  const backwardStep = ref(-1)

  // Build the focused graph (target token's path only)
  const graph = ref<FocusedGraph>(buildFocusedGraph(logits.value, targetIndex))

  function rebuild() {
    graph.value = buildFocusedGraph(logits.value, targetIndex)
    forwardStep.value = -1
    backwardStep.value = -1
    mode.value = 'idle'
  }

  // Node layout for SVG (left → right flow)
  const nodeLayout: { id: string; label: string; x: number; y: number; opLabel?: string }[] = [
    { id: 'z_target', label: 'z_cat', x: 60, y: 100 },
    { id: 'e^z', label: 'e^z', x: 200, y: 100, opLabel: 'exp' },
    { id: 'Σe^z', label: 'Σe^z', x: 340, y: 180, opLabel: '(sum)' },
    { id: 'p_target', label: 'p_cat', x: 340, y: 100, opLabel: '÷' },
    { id: 'log(p)', label: 'log(p)', x: 480, y: 100, opLabel: 'log' },
    { id: 'Loss', label: 'Loss', x: 620, y: 100, opLabel: '−' },
  ]

  const edgeLayout: { from: string; to: string }[] = [
    { from: 'z_target', to: 'e^z' },
    { from: 'e^z', to: 'p_target' },
    { from: 'Σe^z', to: 'p_target' },
    { from: 'p_target', to: 'log(p)' },
    { from: 'log(p)', to: 'Loss' },
  ]

  // Forward order: z → exp → p (with sum as context) → log → loss
  const forwardOrder = ['z_target', 'e^z', 'Σe^z', 'p_target', 'log(p)', 'Loss']
  const backwardOrder = [...forwardOrder].reverse()

  const nodes = computed<GraphNode[]>(() => {
    const g = graph.value
    const nodeValueMap: Record<string, { value: number; grad: number }> = {
      'z_target': { value: g.zTarget.data, grad: g.zTarget.grad },
      'e^z': { value: g.expZ.data, grad: g.expZ.grad },
      'Σe^z': { value: g.sumExp.data, grad: g.sumExp.grad },
      'p_target': { value: g.pTarget.data, grad: g.pTarget.grad },
      'log(p)': { value: g.logP.data, grad: g.logP.grad },
      'Loss': { value: g.loss.data, grad: g.loss.grad },
    }

    return nodeLayout.map((n, i) => {
      const vals = nodeValueMap[n.id] ?? { value: 0, grad: 0 }
      return {
        ...n,
        value: vals.value,
        grad: vals.grad,
        highlighted: mode.value === 'forward' && i <= forwardStep.value,
        gradHighlighted: mode.value === 'backward' && i >= (forwardOrder.length - 1 - backwardStep.value),
      }
    })
  })

  const edges = computed<GraphEdge[]>(() => {
    return edgeLayout.map(e => {
      const fromIdx = forwardOrder.indexOf(e.from)
      const toIdx = forwardOrder.indexOf(e.to)
      return {
        ...e,
        highlighted: mode.value === 'forward' && fromIdx <= forwardStep.value && toIdx <= forwardStep.value,
        gradHighlighted: mode.value === 'backward' &&
          fromIdx >= (forwardOrder.length - 1 - backwardStep.value) &&
          toIdx >= (forwardOrder.length - 1 - backwardStep.value),
      }
    })
  })

  function stepForward() {
    if (mode.value === 'backward') {
      rebuild()
    }
    mode.value = 'forward'
    if (forwardStep.value < forwardOrder.length - 1) {
      forwardStep.value++
    }
  }

  function runFullForward() {
    mode.value = 'forward'
    forwardStep.value = forwardOrder.length - 1
  }

  function stepBackward() {
    if (mode.value !== 'backward') {
      // Ensure forward pass is complete first
      runFullForward()
      graph.value.loss.backward()
      mode.value = 'backward'
      backwardStep.value = -1
    }
    if (backwardStep.value < backwardOrder.length - 1) {
      backwardStep.value++
    }
  }

  function runFullBackward() {
    runFullForward()
    graph.value.loss.backward()
    mode.value = 'backward'
    backwardStep.value = backwardOrder.length - 1
  }

  function reset() {
    rebuild()
  }

  const isForwardComplete = computed(() =>
    mode.value === 'forward' && forwardStep.value >= forwardOrder.length - 1
  )

  const isBackwardComplete = computed(() =>
    mode.value === 'backward' && backwardStep.value >= backwardOrder.length - 1
  )

  return {
    logits,
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
  }
}
