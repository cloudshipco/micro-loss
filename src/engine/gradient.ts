import type { GradientResult } from './types'

export function computeGradient(
  probabilities: number[],
  targetIndex: number
): GradientResult {
  const oneHot = probabilities.map((_, i) => (i === targetIndex ? 1 : 0))
  const gradient = probabilities.map((p, i) => p - oneHot[i])
  return { gradient, oneHot }
}
