import { ref, type Ref } from 'vue'
import type { TutorialState } from './useTutorialState'
import { computeUpdate } from '../engine/update'

export function useAnimatedUpdate(state: TutorialState) {
  const isAnimating = ref(false)
  const beforeLogits: Ref<number[] | null> = ref(null)
  const afterLogits: Ref<number[] | null> = ref(null)
  const beforeLoss: Ref<number | null> = ref(null)
  const afterLoss: Ref<number | null> = ref(null)

  function animateStep(durationMs = 600) {
    if (isAnimating.value) return

    const currentLogits = [...state.logits.value]
    const currentLoss = state.loss.value
    const result = computeUpdate(currentLogits, state.gradient.value, state.learningRate.value)

    beforeLogits.value = currentLogits
    afterLogits.value = result.newLogits
    beforeLoss.value = currentLoss
    isAnimating.value = true

    const startTime = performance.now()
    const startLogits = [...currentLogits]
    const targetLogits = result.newLogits

    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / durationMs, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic

      const interpolated = startLogits.map((start, i) =>
        start + (targetLogits[i] - start) * eased
      )
      state.logits.value = interpolated

      if (progress < 1) {
        requestAnimationFrame(tick)
      } else {
        state.logits.value = targetLogits
        afterLoss.value = state.loss.value
        isAnimating.value = false
      }
    }

    requestAnimationFrame(tick)
  }

  return { isAnimating, beforeLogits, afterLogits, beforeLoss, afterLoss, animateStep }
}
