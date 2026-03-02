import type { UpdateResult } from './types'

export function computeUpdate(
  logits: number[],
  gradient: number[],
  learningRate: number
): UpdateResult {
  const delta = gradient.map(g => -learningRate * g)
  const newLogits = logits.map((z, i) => z + delta[i])
  return { newLogits, delta }
}
