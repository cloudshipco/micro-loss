export interface SoftmaxResult {
  expValues: number[]
  sumExp: number
  probabilities: number[]
}

export interface LossResult {
  loss: number
  logSumExp: number
  negLogProb: number
}

export interface GradientResult {
  gradient: number[]
  oneHot: number[]
}

export interface UpdateResult {
  newLogits: number[]
  delta: number[]
}

export const TOKENS = ['the', 'cat', 'ate', 'fish'] as const
export type Token = (typeof TOKENS)[number]

export const TOKEN_COLORS = ['#f59e0b', '#6366f1', '#ef4444', '#10b981'] as const
