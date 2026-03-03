/**
 * Concrete parameter inventory for our micro-model.
 * Makes "billions of parameters" tangible by naming every group.
 */

export interface ParameterGroup {
  name: string
  dimensions: string
  count: number
  description: string
}

export const MODEL_CONFIG = {
  vocabSize: 4,
  contextLength: 4,
  nEmbed: 8,
  nHead: 1,
  nLayer: 1,
  mlpHidden: 32,
} as const

export const PARAMETER_GROUPS: ParameterGroup[] = [
  {
    name: 'Token Embeddings',
    dimensions: `${MODEL_CONFIG.vocabSize} × ${MODEL_CONFIG.nEmbed}`,
    count: MODEL_CONFIG.vocabSize * MODEL_CONFIG.nEmbed,
    description: `${MODEL_CONFIG.vocabSize} tokens × ${MODEL_CONFIG.nEmbed} numbers per vector — one row per vocabulary token`,
  },
  {
    name: 'Position Embeddings',
    dimensions: `${MODEL_CONFIG.contextLength} × ${MODEL_CONFIG.nEmbed}`,
    count: MODEL_CONFIG.contextLength * MODEL_CONFIG.nEmbed,
    description: `${MODEL_CONFIG.contextLength} positions × ${MODEL_CONFIG.nEmbed} numbers per vector — encodes where each token sits`,
  },
  {
    name: 'Attention Q/K/V/O',
    dimensions: `4 × (${MODEL_CONFIG.nEmbed} × ${MODEL_CONFIG.nEmbed})`,
    count: 4 * MODEL_CONFIG.nEmbed * MODEL_CONFIG.nEmbed,
    description: `4 matrices (Query, Key, Value, Output), each ${MODEL_CONFIG.nEmbed}→${MODEL_CONFIG.nEmbed} — transforms vectors for the attention mechanism`,
  },
  {
    name: 'MLP',
    dimensions: `(${MODEL_CONFIG.nEmbed} × ${MODEL_CONFIG.mlpHidden}) + (${MODEL_CONFIG.mlpHidden} × ${MODEL_CONFIG.nEmbed})`,
    count: MODEL_CONFIG.nEmbed * MODEL_CONFIG.mlpHidden + MODEL_CONFIG.mlpHidden * MODEL_CONFIG.nEmbed,
    description: `Expands ${MODEL_CONFIG.nEmbed}→${MODEL_CONFIG.mlpHidden} then contracts ${MODEL_CONFIG.mlpHidden}→${MODEL_CONFIG.nEmbed} — a two-layer feedforward network`,
  },
  {
    name: 'Output Projection',
    dimensions: `${MODEL_CONFIG.nEmbed} × ${MODEL_CONFIG.vocabSize}`,
    count: MODEL_CONFIG.nEmbed * MODEL_CONFIG.vocabSize,
    description: `${MODEL_CONFIG.nEmbed}-dim context vector → ${MODEL_CONFIG.vocabSize} scores, one per vocabulary token`,
  },
]

export const TOTAL_PARAMETERS = PARAMETER_GROUPS.reduce((sum, g) => sum + g.count, 0)

export const SCALE_COMPARISONS = [
  { name: 'Our model', params: TOTAL_PARAMETERS, color: '#6366f1' },
  { name: 'GPT-2', params: 1_600_000_000, color: '#f59e0b' },
  { name: 'GPT-3', params: 175_000_000_000, color: '#10b981' },
  { name: 'GPT-4 (est.)', params: 1_800_000_000_000, color: '#ef4444' },
] as const

// ── Concrete example values for the forward-pass walkthrough ────────────

/** Token IDs for the example context "the cat ate" */
export const EXAMPLE_CONTEXT_TOKEN_IDS = [0, 1, 2] // the, cat, ate

/** 4×8 token embedding matrix (one row per vocab word) */
export const EXAMPLE_EMBEDDING_MATRIX: number[][] = [
  [+0.014, -0.031, +0.008, -0.022, +0.019, -0.005, +0.027, -0.011], // the  (ID 0)
  [-0.018, +0.025, -0.009, +0.033, -0.014, +0.021, -0.006, +0.017], // cat  (ID 1)
  [+0.022, -0.011, +0.030, -0.015, +0.007, -0.028, +0.013, -0.019], // ate  (ID 2)
  [-0.009, +0.016, -0.024, +0.011, -0.032, +0.008, -0.020, +0.026], // fish (ID 3)
]

/** The context vector produced after the layer transforms the embeddings */
export const EXAMPLE_CONTEXT_VECTOR: number[] =
  [+0.412, -0.287, +0.153, +0.541, -0.098, +0.326, -0.215, +0.178]

/** Generate random Gaussian-ish values for the heatmap demo. */
export function randomInitMatrix(rows: number, cols: number): number[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => {
      // Box-Muller transform for normal distribution, σ ≈ 0.02
      const u1 = Math.random()
      const u2 = Math.random()
      return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) * 0.02
    })
  )
}
