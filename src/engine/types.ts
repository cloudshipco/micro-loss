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

export const TOKENS = ['cat', 'dog', 'fish', 'bird'] as const
export type Token = (typeof TOKENS)[number]

export const TOKEN_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444'] as const
