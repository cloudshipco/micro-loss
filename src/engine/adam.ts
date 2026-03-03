/**
 * Adam optimizer — the standard optimizer for training neural networks.
 * Combines momentum (exponential moving average of gradients) with
 * adaptive per-parameter learning rates (via second moment estimates).
 */

export interface AdamState {
  m: number[]     // First moment (mean of gradients)
  v: number[]     // Second moment (mean of squared gradients)
  t: number       // Timestep (for bias correction)
}

export interface AdamConfig {
  lr: number       // Learning rate (α)
  beta1: number    // Momentum decay (typically 0.9)
  beta2: number    // RMSprop decay (typically 0.999)
  epsilon: number  // Numerical stability (typically 1e-8)
}

export const DEFAULT_ADAM_CONFIG: AdamConfig = {
  lr: 0.5,
  beta1: 0.9,
  beta2: 0.999,
  epsilon: 1e-8,
}

export function initAdam(numParams: number): AdamState {
  return {
    m: new Array(numParams).fill(0),
    v: new Array(numParams).fill(0),
    t: 0,
  }
}

export interface AdamStepResult {
  newParams: number[]
  delta: number[]
  effectiveLR: number[]   // Per-parameter effective step size (for visualisation)
  state: AdamState
}

/**
 * One Adam update step.
 * Returns new parameter values and the updated optimizer state.
 */
export function adamStep(
  params: number[],
  gradients: number[],
  state: AdamState,
  config: AdamConfig = DEFAULT_ADAM_CONFIG,
): AdamStepResult {
  const { lr, beta1, beta2, epsilon } = config
  const t = state.t + 1

  const newM = state.m.map((mi, i) => beta1 * mi + (1 - beta1) * gradients[i])
  const newV = state.v.map((vi, i) => beta2 * vi + (1 - beta2) * gradients[i] * gradients[i])

  // Bias correction
  const mHat = newM.map(mi => mi / (1 - Math.pow(beta1, t)))
  const vHat = newV.map(vi => vi / (1 - Math.pow(beta2, t)))

  // Per-parameter effective learning rate
  const effectiveLR = vHat.map(vi => lr / (Math.sqrt(vi) + epsilon))

  // Update: θ ← θ - α * m̂ / (√v̂ + ε)
  const delta = mHat.map((mi, i) => -lr * mi / (Math.sqrt(vHat[i]) + epsilon))
  const newParams = params.map((p, i) => p + delta[i])

  return {
    newParams,
    delta,
    effectiveLR,
    state: { m: newM, v: newV, t },
  }
}
