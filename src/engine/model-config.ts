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
    description: 'One learned vector per vocabulary word',
  },
  {
    name: 'Position Embeddings',
    dimensions: `${MODEL_CONFIG.contextLength} × ${MODEL_CONFIG.nEmbed}`,
    count: MODEL_CONFIG.contextLength * MODEL_CONFIG.nEmbed,
    description: 'One learned vector per position in the context',
  },
  {
    name: 'Attention Q/K/V/O',
    dimensions: `4 × (${MODEL_CONFIG.nEmbed} × ${MODEL_CONFIG.nEmbed})`,
    count: 4 * MODEL_CONFIG.nEmbed * MODEL_CONFIG.nEmbed,
    description: 'Query, Key, Value, and Output projection matrices',
  },
  {
    name: 'MLP',
    dimensions: `(${MODEL_CONFIG.nEmbed} × ${MODEL_CONFIG.mlpHidden}) + (${MODEL_CONFIG.mlpHidden} × ${MODEL_CONFIG.nEmbed})`,
    count: MODEL_CONFIG.nEmbed * MODEL_CONFIG.mlpHidden + MODEL_CONFIG.mlpHidden * MODEL_CONFIG.nEmbed,
    description: 'Two-layer feedforward network (expand then contract)',
  },
  {
    name: 'Output Projection',
    dimensions: `${MODEL_CONFIG.nEmbed} × ${MODEL_CONFIG.vocabSize}`,
    count: MODEL_CONFIG.nEmbed * MODEL_CONFIG.vocabSize,
    description: 'Maps context vector to one score per vocabulary word',
  },
]

export const TOTAL_PARAMETERS = PARAMETER_GROUPS.reduce((sum, g) => sum + g.count, 0)

export const SCALE_COMPARISONS = [
  { name: 'Our model', params: TOTAL_PARAMETERS, color: '#6366f1' },
  { name: 'GPT-2', params: 1_600_000_000, color: '#f59e0b' },
  { name: 'GPT-3', params: 175_000_000_000, color: '#10b981' },
  { name: 'GPT-4 (est.)', params: 1_800_000_000_000, color: '#ef4444' },
] as const

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
