import type { LossResult } from './types'
import { computeLogSumExp } from './softmax'

export function computeCrossEntropyLoss(
  probabilities: number[],
  targetIndex: number
): number {
  const probability = probabilities[targetIndex]
  return -Math.log(Math.max(probability, 1e-15))
}

export function computeLossDetailed(
  logits: number[],
  targetIndex: number,
  temperature = 1
): LossResult {
  const scaled = temperature !== 1
    ? logits.map(z => z / temperature)
    : logits

  const logSumExp = computeLogSumExp(logits, temperature)
  const negLogProb = -scaled[targetIndex] + logSumExp
  return {
    loss: negLogProb,
    logSumExp,
    negLogProb,
  }
}

export function lossAtProbability(probability: number): number {
  return -Math.log(Math.max(probability, 1e-15))
}
