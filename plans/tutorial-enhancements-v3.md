# Tutorial Enhancements v3

## Overview

Five improvements in priority order. Each is independently shippable.

---

## 1. ~~Reuse FormulaLegend across more steps~~ — DONE

**Completed.** FormulaLegend deployed in 11 steps (5, 7, 8, 9, 11, 12, 13, 14, 15, 17, 18).

Key decisions made during implementation:
- Created `src/components/ui/FormulaLegend.vue` — two-column layout (formula left, legend right)
- Removed `math?` from `StepDefinition` interface and all `math:` properties from `steps.ts`
- Removed MathBlock rendering from `StepSection.vue`
- Established consistent colour system (see below)
- **Must use `\textcolor{}{}` not `\color{}{}` in KaTeX** — `\color` is a switch that leaks colour to all following text
- Constants (`e`) and operators (`Σ`) use `#e2e0ea` (text-primary) in legend, uncoloured in formula
- Step 8 (Softmax) has expanded legend: `p_i`, `z_i`, `e`, `Σ_j`

### Formula Colour System
| Symbol | Meaning | Colour |
|--------|---------|--------|
| `z` / `z_i` / `θ` / `Q` | logits, parameters, queries | `#93c5fd` (blue-300) |
| `p` / `p_i` / `h` / `K` / `m̂` | probabilities, context, keys, momentum | `#34d399` (green) |
| `y` / `y_i` / `w_i` / `V` / `v̂` | target, embeddings, values, second moment | `#fbbf24` (amber) |
| `L` / `∇` / `τ` / `ε` | loss, gradient, temperature, epsilon | `#f87171` (red) |
| `η` / `α` | learning rate | `#6366f1` (indigo) |
| `e`, `Σ`, `=`, `/`, `·` | constants and operators | uncoloured (`#e2e0ea`) |

---

## 2. ~~End-to-end in-browser training demo (capstone)~~ — DONE

**Completed.** New Step 20 "Watch It Learn" — a real 268-parameter model trains from scratch in the browser.

### What was built

**Engine:** `src/engine/toy-model.ts` (~315 lines)
- `ToyModel` class with token embeddings (4×8), position embeddings (3×8), 2-layer MLP (8→16→4)
- Seeded PRNG (Mulberry32 + Box-Muller) for reproducible initialisation
- Full manual backprop: softmax gradient → output layer → ReLU → hidden layer → embeddings
- SGD update, `trainStep()` convenience method, `predictAll()` for evaluation
- 268 parameters total — trains to ~100% accuracy in 200 epochs at lr=0.5

**Component:** `src/components/steps/StepWatchItLearn.vue`
- Learning rate slider + status display (step count, average loss)
- Train buttons (10 / 50 / 200 epochs) with `requestAnimationFrame` yielding
- Live loss curve (ECharts, red — matches loss colour in formula system)
- Prediction progress bars for all 3 training examples with colour-coded probabilities
- Autoregressive generation section: starts with "the", samples up to 3 tokens
- Generation shows per-token probability grid with ring highlight on sampled token

**Wiring:**
- Step 20 added to `steps.ts`, old 20→21, 21→22 (tutorial is now 22 steps)
- `StepWatchItLearn` imported and registered in `App.vue`
- `StepRealThing` comparison table updated: uses `ToyModel.PARAM_COUNT` (268), architecture row updated to "Embeddings + 2-layer MLP"
- `StepInference` closing callout updated to reference the new step

### Design decisions
- **No attention** — MLP-only keeps backprop tractable (~200 lines vs ~500+ with attention). Tutorial already covers attention conceptually in Step 18. A callout notes this simplification.
- **SGD only** — Adam adds ~100 lines of state tracking per parameter. The Training Loop step (16) already demonstrates Adam vs SGD toggle. SGD converges fine for this toy problem.
- **Averaging embeddings** — Simpler than last-position-only and lets all context tokens influence the prediction. Gradient distributes equally via `1/seqLen` scaling.
- **Seeded PRNG** — Ensures reproducible initial weights across page loads. Seed 42.

---

## 3. Python code snippets alongside pseudocode

**Status:** Not started.

**Goal:** Show the real PyTorch one-liner next to each pseudocode block, so readers who code can bridge to real implementations.

**Approach:**
- New `CodeComparison.vue` component: two tabs — "Pseudocode" | "PyTorch"
- Reuse existing `step-pseudocode` styling for both tabs
- Syntax highlighting via a lightweight library (Shiki is ~50KB gzipped, or just use `<code>` with manual colour classes to keep bundle small)

**Steps to add snippets:**
| Step | Pseudocode exists | PyTorch equivalent |
|------|---|---|
| 4 (Forward Pass) | Yes | `logits = model(input_ids)` |
| 8 (Softmax) | Yes | `probs = torch.softmax(logits, dim=-1)` |
| 10 (Cross-Entropy) | Yes | `loss = F.cross_entropy(logits, target)` |
| 14 (Update) | Yes | `optimizer.zero_grad(); loss.backward(); optimizer.step()` |
| 16 (Training Loop) | Implicit | Full 8-line training loop |

Could also add a "Complete Pipeline" block at Step 16 or 20: the entire training loop in ~20 lines of PyTorch.

---

## 4. Loss landscape visualisation

**Status:** Not started.

**Goal:** A 2D contour plot showing the loss surface for two parameters, with a dot tracing the gradient descent path.

**Where:** Step 14 (Gradient Descent Update) — adds geometric intuition to the algebraic update rule.

**Approach:**
- Pick two logits (e.g. z_fish and z_ate) as axes
- Compute loss at a grid of points (fix other logits)
- Render as ECharts heatmap or contour
- Animate the gradient descent path as a series of dots
- Learning rate slider affects step size visibly

This makes "going downhill" visceral — the user sees the dot sliding into the valley.

**Complexity:** Medium. The grid computation is O(n²) but with n=50 it's trivial. ECharts heatmap supports this natively.

---

## Implementation Order

1. ~~**FormulaLegend reuse**~~ — DONE
2. ~~**End-to-end demo**~~ — DONE
3. **Python snippets** — moderate effort, high value for coder audience — next
4. **Loss landscape** — nice-to-have, independent of others
