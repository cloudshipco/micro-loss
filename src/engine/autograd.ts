/**
 * Minimal autograd engine for the backpropagation tutorial step.
 *
 * Each Value wraps a scalar and remembers the operation that produced it,
 * forming a computation graph.  Calling backward() on the output walks
 * the graph in reverse topological order, accumulating gradients via the
 * chain rule — exactly what PyTorch/JAX do under the hood.
 */

export type OpKind = 'input' | 'add' | 'mul' | 'exp' | 'log' | 'neg' | 'div'

export class Value {
  data: number
  grad = 0
  label: string
  readonly op: OpKind
  readonly children: Value[]
  private _backward: () => void = () => {}

  constructor(data: number, label = '', op: OpKind = 'input', children: Value[] = []) {
    this.data = data
    this.label = label
    this.op = op
    this.children = children
  }

  /** a + b */
  add(other: Value): Value {
    const out = new Value(this.data + other.data, '', 'add', [this, other])
    out._backward = () => {
      this.grad += out.grad   // d(a+b)/da = 1
      other.grad += out.grad  // d(a+b)/db = 1
    }
    return out
  }

  /** a * b */
  mul(other: Value): Value {
    const out = new Value(this.data * other.data, '', 'mul', [this, other])
    out._backward = () => {
      this.grad += other.data * out.grad  // d(ab)/da = b
      other.grad += this.data * out.grad  // d(ab)/db = a
    }
    return out
  }

  /** e^a */
  exp(): Value {
    const expVal = Math.exp(this.data)
    const out = new Value(expVal, '', 'exp', [this])
    out._backward = () => {
      this.grad += expVal * out.grad  // d(e^a)/da = e^a
    }
    return out
  }

  /** ln(a) */
  log(): Value {
    const out = new Value(Math.log(this.data), '', 'log', [this])
    out._backward = () => {
      this.grad += (1 / this.data) * out.grad  // d(ln a)/da = 1/a
    }
    return out
  }

  /** -a */
  neg(): Value {
    const out = new Value(-this.data, '', 'neg', [this])
    out._backward = () => {
      this.grad += -out.grad
    }
    return out
  }

  /** a / b */
  div(other: Value): Value {
    const out = new Value(this.data / other.data, '', 'div', [this, other])
    out._backward = () => {
      this.grad += (1 / other.data) * out.grad
      other.grad += (-this.data / (other.data * other.data)) * out.grad
    }
    return out
  }

  /** Backpropagation: compute gradients for all ancestors. */
  backward(): void {
    // Topological sort
    const sorted: Value[] = []
    const visited = new Set<Value>()
    const visit = (node: Value) => {
      if (visited.has(node)) return
      visited.add(node)
      for (const child of node.children) visit(child)
      sorted.push(node)
    }
    visit(this)

    // Reset all gradients
    for (const node of sorted) node.grad = 0
    this.grad = 1

    // Walk in reverse topological order
    for (let i = sorted.length - 1; i >= 0; i--) {
      sorted[i]._backward()
    }
  }
}

/**
 * Build the softmax→cross-entropy computation graph for our 4-token example.
 * Returns all intermediate Values so the tutorial can animate each node.
 */
export interface SoftmaxCEGraph {
  logits: Value[]            // z_cat, z_dog, z_fish, z_bird
  exps: Value[]              // e^z_i
  sumExp: Value              // Σ e^z_j
  probs: Value[]             // p_i = e^z_i / Σ
  negLogTargetProb: Value    // -log(p_target)
  loss: Value                // final loss scalar
  allNodes: Value[]          // ordered list for animation
}

export function buildSoftmaxCEGraph(logitValues: number[], targetIndex: number): SoftmaxCEGraph {
  // Input logits
  const logits = logitValues.map((z, i) =>
    new Value(z, `z_${i}`)
  )

  // Exponentiate
  const exps = logits.map((z, i) => {
    const e = z.exp()
    e.label = `exp_${i}`
    return e
  })

  // Sum of exponentials
  let sumExp = exps[0]
  sumExp.label = 'partial_sum'
  for (let i = 1; i < exps.length; i++) {
    sumExp = sumExp.add(exps[i])
    sumExp.label = i === exps.length - 1 ? 'sum_exp' : 'partial_sum'
  }

  // Probabilities: p_i = exp_i / sum
  const probs = exps.map((e, i) => {
    const p = e.div(sumExp)
    p.label = `p_${i}`
    return p
  })

  // Loss: -log(p_target)
  const logP = probs[targetIndex].log()
  logP.label = 'log_p'
  const loss = logP.neg()
  loss.label = 'loss'

  // Collect all nodes in forward order for animation
  const allNodes: Value[] = [
    ...logits,
    ...exps,
    sumExp,
    ...probs,
    logP,
    loss,
  ]

  return {
    logits,
    exps,
    sumExp,
    probs,
    negLogTargetProb: logP,
    loss,
    allNodes,
  }
}

/**
 * Build a focused graph for just the target token's path:
 * z_target → e^z → (÷ sum) → p → -log → loss
 * This is simpler to visualise and still demonstrates the chain rule.
 */
export interface FocusedGraph {
  zTarget: Value
  expZ: Value
  sumExp: Value         // treated as a constant for the focused view
  pTarget: Value
  logP: Value
  loss: Value
  nodes: Value[]
}

export function buildFocusedGraph(logitValues: number[], targetIndex: number): FocusedGraph {
  const zTarget = new Value(logitValues[targetIndex], 'z_target')
  const expZ = zTarget.exp()
  expZ.label = 'e^z'

  // Sum of all exp values (computed externally, treated as quasi-constant)
  const totalExp = logitValues.reduce((s, z) => s + Math.exp(z), 0)
  const sumExp = new Value(totalExp, 'Σe^z')

  const pTarget = expZ.div(sumExp)
  pTarget.label = 'p_target'

  const logP = pTarget.log()
  logP.label = 'log(p)'

  const loss = logP.neg()
  loss.label = 'Loss'

  const nodes = [zTarget, expZ, sumExp, pTarget, logP, loss]
  return { zTarget, expZ, sumExp, pTarget, logP, loss, nodes }
}
