import { ref, computed, provide, inject, type InjectionKey, type Ref, type ComputedRef } from 'vue'
import { computeSoftmax, computeLogSumExp } from '../engine/softmax'
import { computeCrossEntropyLoss, computeLossDetailed } from '../engine/loss'
import { computeGradient } from '../engine/gradient'
import { computeUpdate } from '../engine/update'
import { TOKENS, TOKEN_COLORS, type SoftmaxResult, type GradientResult } from '../engine/types'

export interface TutorialState {
  // Primary state
  logits: Ref<number[]>
  temperature: Ref<number>
  targetIndex: Ref<number>
  learningRate: Ref<number>

  // Derived
  softmaxResult: ComputedRef<SoftmaxResult>
  expValues: ComputedRef<number[]>
  probabilities: ComputedRef<number[]>
  loss: ComputedRef<number>
  logSumExp: ComputedRef<number>
  lossDetailed: ComputedRef<{ loss: number; logSumExp: number; negLogProb: number }>
  gradientResult: ComputedRef<GradientResult>
  gradient: ComputedRef<number[]>
  oneHotTarget: ComputedRef<number[]>

  // Tempered variants
  temperedSoftmax: ComputedRef<SoftmaxResult>
  temperedLoss: ComputedRef<number>
  temperedGradient: ComputedRef<number[]>

  // Constants
  tokens: typeof TOKENS
  tokenColors: typeof TOKEN_COLORS

  // Actions
  setLogit: (index: number, value: number) => void
  setTargetIndex: (index: number) => void
  applyUpdate: () => void
  resetLogits: () => void
  randomizeLogits: () => void
}

const TUTORIAL_STATE_KEY: InjectionKey<TutorialState> = Symbol('tutorialState')

const DEFAULT_LOGITS = [0.1, 0.5, 1.0, 2.0]

export function createTutorialState(): TutorialState {
  const logits = ref([...DEFAULT_LOGITS])
  const temperature = ref(1.0)
  const targetIndex = ref(3)
  const learningRate = ref(0.5)

  // Softmax at temperature=1 (base)
  const softmaxResult = computed(() => computeSoftmax(logits.value))
  const expValues = computed(() => softmaxResult.value.expValues)
  const probabilities = computed(() => softmaxResult.value.probabilities)

  // Loss
  const loss = computed(() => computeCrossEntropyLoss(probabilities.value, targetIndex.value))
  const logSumExp = computed(() => computeLogSumExp(logits.value))
  const lossDetailed = computed(() => computeLossDetailed(logits.value, targetIndex.value))

  // Gradient
  const gradientResult = computed(() => computeGradient(probabilities.value, targetIndex.value))
  const gradient = computed(() => gradientResult.value.gradient)
  const oneHotTarget = computed(() => gradientResult.value.oneHot)

  // Tempered variants
  const temperedSoftmax = computed(() => computeSoftmax(logits.value, temperature.value))
  const temperedLoss = computed(() =>
    computeCrossEntropyLoss(temperedSoftmax.value.probabilities, targetIndex.value)
  )
  const temperedGradient = computed(() =>
    computeGradient(temperedSoftmax.value.probabilities, targetIndex.value).gradient
  )

  // Actions
  function setLogit(index: number, value: number) {
    const newLogits = [...logits.value]
    newLogits[index] = value
    logits.value = newLogits
  }

  function setTargetIndex(index: number) {
    targetIndex.value = index
  }

  function applyUpdate() {
    const result = computeUpdate(logits.value, gradient.value, learningRate.value)
    logits.value = result.newLogits
  }

  function resetLogits() {
    logits.value = [...DEFAULT_LOGITS]
  }

  function randomizeLogits() {
    logits.value = Array.from({ length: 4 }, () =>
      Math.round((Math.random() * 6 - 3) * 10) / 10
    )
  }

  return {
    logits, temperature, targetIndex, learningRate,
    softmaxResult, expValues, probabilities,
    loss, logSumExp, lossDetailed,
    gradientResult, gradient, oneHotTarget,
    temperedSoftmax, temperedLoss, temperedGradient,
    tokens: TOKENS, tokenColors: TOKEN_COLORS,
    setLogit, setTargetIndex, applyUpdate, resetLogits, randomizeLogits,
  }
}

export function provideTutorialState(state: TutorialState) {
  provide(TUTORIAL_STATE_KEY, state)
}

export function useTutorialState(): TutorialState {
  const state = inject(TUTORIAL_STATE_KEY)
  if (!state) throw new Error('TutorialState not provided. Wrap with provideTutorialState().')
  return state
}
