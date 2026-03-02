# microLoss — Interactive Tutorial Spec

## Overview

microLoss is an interactive educational tool that explains:

> Why softmax + cross-entropy is used for training modern neural networks.

It focuses on:

- logits
- probability conversion
- negative log likelihood
- gradient formation
- probability mass shifting

Goal:

Make the learner *feel* why:

∇ = p - y

emerges naturally.

---

## Core Concept

logits → softmax → probabilities  
probabilities → cross-entropy → loss  
loss → gradient → logit updates

---

## Learning Flow

### Step 1 — Logits

User is presented with sliders

Explain:

Logits are:

- unbounded
- relative preference scores
- live in log-space

---

### Step 2 — Exponentiation

Show:

e^{z_i}

Live visual bar chart of exponentials.

---

### Step 3 — Normalization

Compute:

p_i = e^{z_i} / Σ e^{z_j}

Display as probabilities and pie chart.

---

### Step 4 — Choose correct token

User selects correct token.

Show one-hot target vector.

---

### Step 5 — Cross Entropy

Compute:

L = -log p_y

Display loss value.

Graph loss vs probability.

---

### Step 6 — Rewrite Loss in Logits

Show:

L = -z_y + log Σ e^{z_j}

Explain:

Two forces:

- Raise correct token
- Suppress competitors

---

### Step 7 — Gradient

Compute:

∇_z L = p - y

Visual arrows showing:

- correct token pushed up
- others pushed down

---

### Step 8 — Update

Apply gradient descent step:

z ← z - η (p - y)

Animate:

Logits shift  
Softmax recomputed  
Loss decreases

---

### Step 9 — Entropy Toggle

Add temperature slider.

Show:

Effect on:

- probability spread
- loss
- gradients

---

### Step 10 — Attention Connection

Introduce:

softmax(QKᵀ)

Show:

Same mechanism as probability selection.

---

## UI Components

- LogitSliders.vue
- SoftmaxChart.vue
- LossPanel.vue
- GradientPanel.vue
- UpdateAnimation.vue
- TemperatureControl.vue
- AttentionDemo.vue

---

## Architecture

State:

- logits: number[]
- temperature: number
- targetIndex: number
- learningRate: number

Derived:

- expValues
- probabilities
- loss
- gradient

---

## Mathematical Engine

computeSoftmax(logits)  
computeCrossEntropyLoss(probabilities, targetIndex)  
computeGradient(probabilities, targetIndex)

---

## Optional Extensions

- Label smoothing
- Top-k truncation
- Masked softmax
- Multi-head preview

---

## Learning Outcome

User should understand:

- logits live in log-space
- softmax distributes belief
- cross entropy punishes misbelief
- gradients shift probability mass

---

## Next Tutorial

microAttention — Multi-head attention

---

## Implementation Stack

Vue 3  
ECharts  
Local state
