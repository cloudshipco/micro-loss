// ── Seeded PRNG (Mulberry32) ─────────────────────────────────────────
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Sample from standard normal distribution using Box-Muller transform */
function randn(rng: () => number): number {
  const u1 = rng()
  const u2 = rng()
  return Math.sqrt(-2 * Math.log(u1 + 1e-12)) * Math.cos(2 * Math.PI * u2)
}

// ── Dimensions ───────────────────────────────────────────────────────
const VOCAB_SIZE = 4
const MAX_SEQ_LEN = 3
const EMBED_DIM = 8
const HIDDEN_DIM = 16

// ── Training examples: subsequences of "the cat ate fish" ────────────
export interface TrainingExample {
  context: number[]
  target: number
  contextWords: string
  targetWord: string
}

export const TRAINING_EXAMPLES: TrainingExample[] = [
  { context: [0], target: 1, contextWords: 'the', targetWord: 'cat' },
  { context: [0, 1], target: 2, contextWords: 'the cat', targetWord: 'ate' },
  { context: [0, 1, 2], target: 3, contextWords: 'the cat ate', targetWord: 'fish' },
]

// ── Prediction result for one example ────────────────────────────────
export interface Prediction {
  context: number[]
  target: number
  probs: number[]
  targetProb: number
  predictedToken: number
  loss: number
}

// ── Forward pass cache (used by backward) ────────────────────────────
interface ForwardCache {
  tokenIds: number[]
  context: number[] // averaged embedding
  hiddenPre: number[] // before ReLU
  hidden: number[] // after ReLU
  logits: number[]
  probs: number[]
}

// ── ToyModel ─────────────────────────────────────────────────────────
//
// Architecture:
//   1. Token embedding (4×8) + Position embedding (3×8) → sum → average
//   2. Linear layer: 8→16 with ReLU
//   3. Output projection: 16→4 (logits over vocabulary)
//
// Total parameters: 4×8 + 3×8 + 8×16 + 16 + 16×4 + 4 = 268
//

export class ToyModel {
  // Parameters
  tokenEmbed: number[][] // [VOCAB_SIZE][EMBED_DIM]
  posEmbed: number[][] // [MAX_SEQ_LEN][EMBED_DIM]
  W1: number[][] // [EMBED_DIM][HIDDEN_DIM]
  b1: number[] // [HIDDEN_DIM]
  W2: number[][] // [HIDDEN_DIM][VOCAB_SIZE]
  b2: number[] // [VOCAB_SIZE]

  // Gradients (same shapes as parameters)
  private grad_tokenEmbed: number[][]
  private grad_posEmbed: number[][]
  private grad_W1: number[][]
  private grad_b1: number[]
  private grad_W2: number[][]
  private grad_b2: number[]

  // Forward pass cache for backward
  private cache: ForwardCache | null = null

  static readonly PARAM_COUNT = VOCAB_SIZE * EMBED_DIM +
    MAX_SEQ_LEN * EMBED_DIM +
    EMBED_DIM * HIDDEN_DIM +
    HIDDEN_DIM +
    HIDDEN_DIM * VOCAB_SIZE +
    VOCAB_SIZE // = 268

  constructor(seed = 42) {
    const rng = mulberry32(seed)
    const scale = 0.1

    // Xavier-ish init: small random values
    this.tokenEmbed = makeMatrix(VOCAB_SIZE, EMBED_DIM, () => randn(rng) * scale)
    this.posEmbed = makeMatrix(MAX_SEQ_LEN, EMBED_DIM, () => randn(rng) * scale)
    this.W1 = makeMatrix(EMBED_DIM, HIDDEN_DIM, () => randn(rng) * scale)
    this.b1 = new Array(HIDDEN_DIM).fill(0)
    this.W2 = makeMatrix(HIDDEN_DIM, VOCAB_SIZE, () => randn(rng) * scale)
    this.b2 = new Array(VOCAB_SIZE).fill(0)

    // Zero-init gradients
    this.grad_tokenEmbed = makeMatrix(VOCAB_SIZE, EMBED_DIM, () => 0)
    this.grad_posEmbed = makeMatrix(MAX_SEQ_LEN, EMBED_DIM, () => 0)
    this.grad_W1 = makeMatrix(EMBED_DIM, HIDDEN_DIM, () => 0)
    this.grad_b1 = new Array(HIDDEN_DIM).fill(0)
    this.grad_W2 = makeMatrix(HIDDEN_DIM, VOCAB_SIZE, () => 0)
    this.grad_b2 = new Array(VOCAB_SIZE).fill(0)
  }

  /** Run the forward pass: token IDs → logits (length 4) */
  forward(tokenIds: number[]): number[] {
    const seqLen = tokenIds.length

    // 1. Embedding lookup: token + position, then average
    const context = new Array(EMBED_DIM).fill(0)
    for (let i = 0; i < seqLen; i++) {
      const tokenId = tokenIds[i]
      for (let j = 0; j < EMBED_DIM; j++) {
        context[j] += (this.tokenEmbed[tokenId][j] + this.posEmbed[i][j]) / seqLen
      }
    }

    // 2. Hidden layer: ReLU(context @ W1 + b1)
    const hiddenPre = new Array(HIDDEN_DIM).fill(0)
    for (let h = 0; h < HIDDEN_DIM; h++) {
      for (let e = 0; e < EMBED_DIM; e++) {
        hiddenPre[h] += context[e] * this.W1[e][h]
      }
      hiddenPre[h] += this.b1[h]
    }
    const hidden = hiddenPre.map(x => Math.max(0, x))

    // 3. Output layer: hidden @ W2 + b2
    const logits = new Array(VOCAB_SIZE).fill(0)
    for (let v = 0; v < VOCAB_SIZE; v++) {
      for (let h = 0; h < HIDDEN_DIM; h++) {
        logits[v] += hidden[h] * this.W2[h][v]
      }
      logits[v] += this.b2[v]
    }

    // 4. Softmax (numerically stable)
    const maxLogit = Math.max(...logits)
    const expLogits = logits.map(z => Math.exp(z - maxLogit))
    const sumExp = expLogits.reduce((a, b) => a + b, 0)
    const probs = expLogits.map(e => e / sumExp)

    // Cache for backward
    this.cache = { tokenIds, context, hiddenPre, hidden, logits, probs }
    return logits
  }

  /** Cross-entropy loss for the last forward pass */
  loss(target: number): number {
    if (!this.cache) throw new Error('Call forward() first')
    return -Math.log(this.cache.probs[target] + 1e-12)
  }

  /** Probabilities from the last forward pass */
  get probs(): number[] {
    if (!this.cache) throw new Error('Call forward() first')
    return [...this.cache.probs]
  }

  /** Backprop: compute gradients for all parameters w.r.t. cross-entropy loss */
  backward(target: number): void {
    if (!this.cache) throw new Error('Call forward() first')
    const { tokenIds, context, hiddenPre, hidden, probs } = this.cache
    const seqLen = tokenIds.length

    // Zero gradients
    zeroMatrix(this.grad_tokenEmbed)
    zeroMatrix(this.grad_posEmbed)
    zeroMatrix(this.grad_W1)
    this.grad_b1.fill(0)
    zeroMatrix(this.grad_W2)
    this.grad_b2.fill(0)

    // ∂L/∂logits = probs - one_hot(target)
    const dlogits = probs.map((p, i) => p - (i === target ? 1 : 0))

    // ∂L/∂W2 = hidden ⊗ dlogits
    for (let h = 0; h < HIDDEN_DIM; h++) {
      for (let v = 0; v < VOCAB_SIZE; v++) {
        this.grad_W2[h][v] = hidden[h] * dlogits[v]
      }
    }

    // ∂L/∂b2 = dlogits
    for (let v = 0; v < VOCAB_SIZE; v++) this.grad_b2[v] = dlogits[v]

    // ∂L/∂hidden = dlogits @ W2ᵀ
    const dhidden = new Array(HIDDEN_DIM).fill(0)
    for (let h = 0; h < HIDDEN_DIM; h++) {
      for (let v = 0; v < VOCAB_SIZE; v++) {
        dhidden[h] += dlogits[v] * this.W2[h][v]
      }
    }

    // ∂L/∂hiddenPre = dhidden ⊙ ReLU'(hiddenPre)
    const dhiddenPre = dhidden.map((dh, h) => (hiddenPre[h] > 0 ? dh : 0))

    // ∂L/∂W1 = context ⊗ dhiddenPre
    for (let e = 0; e < EMBED_DIM; e++) {
      for (let h = 0; h < HIDDEN_DIM; h++) {
        this.grad_W1[e][h] = context[e] * dhiddenPre[h]
      }
    }

    // ∂L/∂b1 = dhiddenPre
    for (let h = 0; h < HIDDEN_DIM; h++) this.grad_b1[h] = dhiddenPre[h]

    // ∂L/∂context = dhiddenPre @ W1ᵀ
    const dcontext = new Array(EMBED_DIM).fill(0)
    for (let e = 0; e < EMBED_DIM; e++) {
      for (let h = 0; h < HIDDEN_DIM; h++) {
        dcontext[e] += dhiddenPre[h] * this.W1[e][h]
      }
    }

    // ∂L/∂embeddings — distribute equally (inverse of averaging)
    const demb = dcontext.map(d => d / seqLen)
    for (let i = 0; i < seqLen; i++) {
      const tokenId = tokenIds[i]
      for (let j = 0; j < EMBED_DIM; j++) {
        this.grad_tokenEmbed[tokenId][j] += demb[j]
        this.grad_posEmbed[i][j] += demb[j]
      }
    }
  }

  /** SGD update: params -= lr * grads */
  step(lr: number): void {
    updateMatrix(this.tokenEmbed, this.grad_tokenEmbed, lr)
    updateMatrix(this.posEmbed, this.grad_posEmbed, lr)
    updateMatrix(this.W1, this.grad_W1, lr)
    for (let h = 0; h < HIDDEN_DIM; h++) this.b1[h] -= lr * this.grad_b1[h]
    updateMatrix(this.W2, this.grad_W2, lr)
    for (let v = 0; v < VOCAB_SIZE; v++) this.b2[v] -= lr * this.grad_b2[v]
  }

  /** Run forward + loss + backward + step for one training example */
  trainStep(example: TrainingExample, lr: number): number {
    this.forward(example.context)
    const l = this.loss(example.target)
    this.backward(example.target)
    this.step(lr)
    return l
  }

  /** Get predictions for all training examples (without modifying weights) */
  predictAll(): Prediction[] {
    return TRAINING_EXAMPLES.map(ex => {
      this.forward(ex.context)
      const probs = this.probs
      const targetProb = probs[ex.target]
      const predictedToken = probs.indexOf(Math.max(...probs))
      const loss = -Math.log(targetProb + 1e-12)
      return {
        context: ex.context,
        target: ex.target,
        probs,
        targetProb,
        predictedToken,
        loss,
      }
    })
  }

  /** Deep clone this model (for snapshots) */
  clone(): ToyModel {
    const copy = new ToyModel(0)
    copy.tokenEmbed = cloneMatrix(this.tokenEmbed)
    copy.posEmbed = cloneMatrix(this.posEmbed)
    copy.W1 = cloneMatrix(this.W1)
    copy.b1 = [...this.b1]
    copy.W2 = cloneMatrix(this.W2)
    copy.b2 = [...this.b2]
    return copy
  }
}

// ── Matrix helpers ───────────────────────────────────────────────────

function makeMatrix(rows: number, cols: number, init: () => number): number[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, init),
  )
}

function zeroMatrix(m: number[][]): void {
  for (const row of m) row.fill(0)
}

function updateMatrix(params: number[][], grads: number[][], lr: number): void {
  for (let i = 0; i < params.length; i++) {
    for (let j = 0; j < params[i].length; j++) {
      params[i][j] -= lr * grads[i][j]
    }
  }
}

function cloneMatrix(m: number[][]): number[][] {
  return m.map(row => [...row])
}
