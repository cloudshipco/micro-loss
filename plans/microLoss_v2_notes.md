# microLoss v2 — Improvements & Background Spec

## Purpose

This document captures suggested improvements to the current microLoss tutorial and adds deeper conceptual background, particularly addressing:

> "The network has processed 'The' through millions of parameters… and produced one raw number per vocabulary word. These numbers are called logits."

This statement is currently mysterious to most learners.

This spec aims to:
- strengthen intuition
- reduce magic
- prepare learners for Attention
- bridge toward transformer internals

---

# Section 1 — Clarify What Produced the Logits

Current mental gap:

User sees:

"The network processed 'The' → produced logits"

But *how*?

We should demystify this slightly without diving into full transformer math.

Add a conceptual ladder:

## What happened before the logits?

Instead of:

> layers of matrix multiplications

Explain:

The network builds an internal **representation** of the word "The".

Roughly:

1. The token "The" is converted into a vector (embedding)
2. This vector is repeatedly transformed
3. Each transformation mixes and reshapes information

By the end, the network holds a vector meaning:

> "Given the context so far, what should come next?"

The final layer asks:

> "How well does this representation match each vocabulary word?"

And computes a score for each word.

These scores are the logits.

So logits are:

Similarity scores between:

- the current internal state
- each possible next word

---

# Section 2 — Add Logit Invariance Insight

Key idea missing:

Logits only matter **relative to each other**.

Add interactive concept:

Adding +100 to all logits does not change prediction.

Softmax depends only on differences.

This prepares learners for:

- masking
- temperature
- numerical stability
- attention scaling

---

# Section 3 — Logit Difference → Probability Ratio

Add interpretation:

If:

cat = 2  
dog = 1

Then:

cat is e¹ ≈ 2.7× more likely than dog

This connects:

log-space → multiplicative probability

---

# Section 4 — Scale vs Certainty

Same ordering, different certainty.

Example:

[2, 1, 0, -1] → moderate probabilities

[20, 10, 0, -10] → very sharp probabilities

Same ranking, stronger confidence.

This introduces:

- entropy
- temperature
- attention scaling

---

# Section 5 — Competition Insight

Softmax enforces competition.

Raising one logit lowers others’ probabilities.

Add visual:

Increase cat → others shrink

---

# Section 6 — Logit Shift Experiment

Introduce:

Shift all logits by +5 → no change

Shift one logit → prediction shifts

Prepares for:

Masked attention using -∞ logits

---

# Section 7 — Reword Logit Description

Replace:

"logits are raw material"

With:

"logits encode relative preference"

---

# Section 8 — Foreshadow Attention

Explain:

In language prediction:

one logit per word

In attention:

one logit per token pair

Same math, different meaning.

---

# Section 9 — Conceptual Model of Logits

Logits are answers to:

"How compatible is the current context with this possible next token?"

They are not probabilities.

They are unnormalized log-scores.

---

# Section 10 — Bridge to Attention

Later:

Attention computes logits between tokens instead of vocabulary words.

Same pipeline:

scores → softmax → weighted choice

---

# Outcome

Learner should understand:

- logits are similarity scores
- only differences matter
- scale affects certainty
- softmax redistributes belief
- attention uses the same mechanism

---

# Next Step

microAttention tutorial
