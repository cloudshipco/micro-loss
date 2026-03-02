import type { SoftmaxResult } from './types'

export function computeSoftmax(logits: number[], temperature = 1): SoftmaxResult {
  const scaled = temperature !== 1
    ? logits.map(z => z / temperature)
    : logits

  const expValues = scaled.map(z => Math.exp(z))
  const sumExp = expValues.reduce((sum, val) => sum + val, 0)
  const probabilities = expValues.map(val => val / sumExp)

  return { expValues, sumExp, probabilities }
}

export function computeLogSumExp(logits: number[], temperature = 1): number {
  const scaled = temperature !== 1
    ? logits.map(z => z / temperature)
    : logits

  const maxLogit = Math.max(...scaled)
  const sumExp = scaled.reduce((sum, z) => sum + Math.exp(z - maxLogit), 0)
  return maxLogit + Math.log(sumExp)
}
