# microLoss — Forward Pass Clarification & Handoff Specification

## Purpose

This document refines the conceptual boundary between:

- The transformer's forward pass
- The production of logits
- The softmax + loss portion of training

It resolves two issues:

1. The tension between "compatibility scores" and "random initialization"
2. The unclear handoff point between transformer internals and softmax/loss

This is intended to be integrated into the tutorial before the Softmax section.

---

# 1. Clarify the Role of Logits

Current conceptual tension:

- Logits are described as compatibility scores
- But at initialization they are random

Resolution:

Logits are the model's *attempt* at measuring compatibility.

At initialization:

- The architecture defines what logits mean
- The parameters are random
- Therefore the computed compatibility function is random

Better phrasing:

> Logits are the model’s current estimate of how compatible the context is with each possible next word.

This avoids contradiction while preserving meaning.

---

# 2. Explicitly Describe the Forward Pass Up to Logits

The tutorial should briefly explain what has happened before logits appear.

Minimal conceptual ladder:

1. Token IDs are converted into embeddings (learned vectors)
2. Positional information is added
3. These vectors pass through multiple transformer layers
   - self-attention
   - feedforward layers
   - residual connections
   - layer normalization
4. The result is a final hidden vector for the current position
5. This vector is compared against every vocabulary word
6. The resulting scalar scores are logits

This defines the real handoff point.

---

# 3. The True Meaning of a Logit

The final step before softmax is:

z = W_out * h_t

Where:

- h_t is the context representation vector
- W_out is a matrix of vocabulary-sized rows
- Each row corresponds to one vocabulary token

Each logit is:

z_i = dot(h_t, w_i)

So logits are dot products between:

- The context representation
- Each vocabulary embedding

This makes "compatibility" precise.

---

# 4. Recommended Replacement Section

Below is a suggested rewrite for the tutorial:

---

## Next-Token Prediction  
From Context to Scores  

A language model reads a sequence of tokens and builds an internal representation of the current context. This representation is a vector — a long list of numbers summarizing everything the model has "understood" so far.

Token IDs are first converted into learned vector representations called embeddings. These embeddings pass through many layers of attention and feedforward transformations. Each layer refines the representation by mixing information across tokens.

By the end of the forward pass, the model has produced a final hidden vector for the current position. This vector represents the model’s best internal summary of the context.

The final step is simple: the model compares this context vector to every vocabulary word. Concretely, it computes a dot product between the context vector and a learned vector associated with each vocabulary token. The result is one scalar score per vocabulary word.

These scores are called logits.

A logit measures how strongly the model currently associates the context with a particular next word. At the beginning of training, these associations are essentially random. Over time, gradient descent adjusts the model’s parameters so that the logits become meaningful compatibility scores.

These logits are not probabilities yet. They are unnormalized preference scores. In the next section, we convert them into probabilities using softmax.

---

# 5. Clarify the Handoff Point

Everything before logits = representation learning.

Everything after logits = probability transformation and learning dynamics.

Conceptual boundary:

Representation (h_t)
→ Vocabulary comparison (dot products)
→ Logits
→ Softmax
→ Cross-entropy loss
→ Gradient
→ Parameter updates

This makes the architecture pipeline clear without overwhelming the learner.

---

# 6. Optional UI Improvement

If visually represented, add:

Context Vector (h_t)
↓
Dot Product with Vocabulary Matrix
↓
Logits

Even a simple diagram reduces mystery dramatically.

---

# 7. Why This Matters

This clarification prepares learners for:

- Attention (also dot-product scoring)
- Masked attention
- Temperature scaling
- Logit biasing
- Vocabulary projection layer

It ensures logits feel mechanical, not magical.

---

# 8. Outcome

After this section, the learner should understand:

- What computation produced the logits
- Why logits represent compatibility
- Why they start random
- Where softmax fits into the broader LLM pipeline

---

End of specification.
