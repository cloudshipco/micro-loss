# Tutorial Improvement Plan

Comprehensive review of the microLoss tutorial against the 14 rules in
CLAUDE.md. Four parallel reviews covered: (A) terminology & clarity,
(B) multimodal presentation, (C) coherence & structure, (D) references
& history. Findings consolidated below, grouped by priority.

---

## Critical (fix first)

### 1. Install KaTeX and render the `math` field
**Rules 6, 14** — The `steps.ts` `math` field contains LaTeX for 9 steps
but is **never rendered**. `StepSection.vue` ignores it. No math library
exists in the project. Existing `MathBlock` components use HTML
approximations (`<sup>`, `<sub>`, `&Sigma;`).

**Action:**
- `bun add katex`
- Create a `KaTeXBlock` component (or upgrade `MathBlock`) that accepts
  a LaTeX string and renders via KaTeX.
- Render `step.math` in `StepSection.vue` as a prominent formula block
  below the description.
- Add `math` fields to steps that should have them but don't: Step 5
  (`z_i = h^T w_i`), Step 9 (one-hot definition), Step 12 (chain rule).
- Add `MathBlock` / `KaTeXBlock` instances inside Step 8, 15, and 17
  components, which define `math` in steps.ts but show no formula in
  their Vue component.

### 2. Fix forward references — terms used before defined
**Rule 1** — Multiple terms are used before being explained:

| Term | Used in | Defined in | Fix |
|------|---------|------------|-----|
| "logits" | Step 0 (Intro) | Step 5/6 | Say "raw scores" or "scores (called logits)" |
| "autoregressive" | Step 0 (Intro) | Step 19 | Say "step-by-step text generation" |
| "token" | Step 1 (Dataset) | Step 2 | Gloss on first use: "token — a word or word-fragment" |
| "forward pass" | Step 3 (Model) | Step 4 | Say "when the model runs" |
| "gradient descent" | Step 3 (StepTheModel.vue) | Step 14 | Say "the training process" |
| "matrices" | Step 3 | Never | Gloss: "matrices (rectangular grids of numbers)" |
| "embeddings" | Step 4 ¶1 | Step 4 ¶3 | Reorder or say "lookup tables" in ¶1 |
| "computation graph" | Step 12 | Never | Gloss: "the chain of operations drawn as connected nodes" |
| "stop token" | Step 19 | Never | Gloss: "a special token meaning 'I'm done'" |
| "one-hot vector" | Step 2 (StepTokenization.vue table) | Step 9 | Remove column or add inline definition |
| "Gaussian distribution" | Step 3 (StepTheModel.vue) | Never | Say "bell-curve distribution centered on zero" |

### 3. Fix stale "Congratulations!" in Step 18
**Rule 3** — `Step10Attention.vue:118-124` says "Congratulations!
You've traced the complete pipeline…" but Steps 19-21 come after.
This was written when Step 18 was the final step.

**Action:** Remove or move to Step 21 (Further Reading).

### 4. Fix factual inaccuracy: "model outputs a probability"
**Rule 2** — `StepDataset.vue:44` says "it must output a probability
for every word." The model outputs scores/logits, not probabilities.
Probabilities come after softmax.

**Action:** Change to "it must produce a score for every word in its
vocabulary, which is then converted into a probability."

### 5. Fix "attention weights" misused as parameters
**Rule 2** — `steps.ts` Step 4: "the embeddings, the attention weights,
the feedforward matrices — are parameters stored inside the model."
Attention weights are computed dynamically (softmax outputs), not
stored parameters. The learnable parts are Q/K/V/O matrices.

**Action:** Change "attention weights" to "attention matrices" or
"attention parameters."

---

## High Priority

### 6. Fix "word" vs "token" inconsistency
**Rule 4** — Step 2 defines "token" (can be word fragments) but many
later steps say "word" interchangeably: Step 2 "per vocabulary word",
Step 3 "per vocabulary word", Step 5 "one score per word", Step 6
subtitle "context–word compatibility".

**Action:** Standardise on "token" for vocabulary items. Use "word"
only when discussing the human-readable concept.

### 7. Fix "network" vs "model" inconsistency
**Rule 4** — Step 3 establishes "model" as the term. Step 4 switches
to "network" without explanation: "Running the input through the
network once."

**Action:** Change to "Running the input through the model once."

### 8. Remove duplicated text in StepInference.vue
**Rule 2** — The sentence "When you send a message to ChatGPT or
Claude, this exact process runs for every token in the reply" appears
twice in consecutive callout boxes (lines ~190 and ~207).

**Action:** Remove the first instance; keep the version in the closing
callout.

### 9. Fix misleading cross-step references (states are independent)
**Rules 3, 11** — Each step creates its own `createTutorialState()`,
so changing logits in Step 6 doesn't affect Step 7 or 8. But the
text says things like:

- Step 7 (Step02Exp.vue): "Go back and set two logits to 1.0 and 2.0"
- Step 8 (Step03Normalize.vue): "Go back to Step 6 and raise just
  cat's logit"

**Action:** Rewrite these to reference the sliders within the same
step: "Try raising just cat's logit using the sliders above."

### 10. Add seminal paper references
**Rule 9** — Only the logit etymology (Berkson 1944) is cited. Add:

| Step | Paper |
|------|-------|
| Step 3 or 18 | "Attention Is All You Need" (Vaswani et al., 2017) |
| Step 12 | Rumelhart, Hinton, Williams (1986) — backpropagation |
| Step 15 | Kingma & Ba (2015) — Adam |
| Step 10 | Shannon (1948) — cross-entropy / information theory |

One sentence each, woven into existing text.

### 11. Expand Further Reading links
**Rule 8** — Current links (6) don't cover several topics the tutorial
now teaches in depth. Add:

1. "Attention Is All You Need" paper (arXiv)
2. Karpathy's "Let's build the GPT Tokenizer" video
3. A backpropagation-specific resource (3B1B chapter or Karpathy
   micrograd)
4. Adam paper (arXiv)
5. Cross-entropy / information theory explainer

---

## Medium Priority

### 12. Add out-of-scope flags
**Rule 5** — Several advanced topics are mentioned without flagging:

- Step 18: Attention mechanism (intro says it's out of scope, but
  Step 18 dives in). Add a note: "Attention internals are beyond this
  tutorial's scope — this is a brief illustration of softmax reuse."
- Step 20: SFT, RLHF, RAG, efficient attention, BPE — each mention
  should include "(beyond the scope of this tutorial)" or a brief
  parenthetical explanation.

### 13. Expand SGD abbreviation in Step 15
**Rule 2** — Step 15 says "Basic gradient descent (SGD)" but Step 14
introduced "Gradient Descent" (not stochastic). Either drop "(SGD)"
or explain: "often called SGD — stochastic gradient descent — because
each step uses a random subset of the data."

### 14. Explain RLHF more clearly in Step 20
**Rule 2** — "reinforcement learning from human feedback" is jargon
within jargon. Expand to: "a process where humans rate the model's
responses, and those ratings are used to further adjust its
parameters."

### 15. Fix MLP label inconsistency in StepForwardPass.vue
**Rule 4** — The SVG diagram labels a box "MLP" but the step
description says "feedforward network." Use one term or connect them:
"feedforward network (MLP)."

### 16. Label "h =" and "w" notation in components
**Rule 2** — `StepForwardPass.vue` labels the context vector "h ="
and `StepNextToken.vue` uses "w" for vocabulary embeddings. Neither
variable name is introduced in the step descriptions.

**Action:** Either label in the component ("h (context vector) =")
or introduce the notation in the step description.

### 17. Remove "masking in attention" from Step03Normalize.vue
**Rule 5** — The normalization component mentions "masking in
attention" — a transformer internal the tutorial explicitly scopes
out. Replace with: "giving a token an extremely negative logit
effectively removes it from consideration."

### 18. Add (1−p) vs −log(p) comparison visualisation to Step 10
**Rule 6** — The description discusses why (1−p) is inadequate vs
−log(p) with concrete numbers, but the component doesn't visualise
this comparison. A small dual-curve chart would reinforce the point.

---

## Low Priority (polish)

### 19. Consider splitting Steps 3 and 4
**Rule 12** — Step 3 (StepTheModel.vue, 306 lines) covers the model
concept, parameters, scale comparison, AND random initialisation.
Step 4 (StepForwardPass.vue, 405 lines) covers document-positions,
SVG data flow, AND animated step-through. Consider:

- Step 3a: "The Model" (concept, input/output)
- Step 3b: "Parameters" (inventory, scale, initialisation)
- Step 4a: "The Forward Pass" (concept, one-document many tasks)
- Step 4b: "Data Flow" (SVG diagram, animation)

This is a significant restructuring — evaluate whether the added
clarity justifies the effort.

### 20. Add interactivity to Step 5 (From Context to Scores)
**Rule 6** — All surrounding steps (6-8) have sliders and live
computation. Step 5 shows static hardcoded dot product values.
Adding sliders for the context/vocabulary vectors would make the dot
product concept more tangible.

### 21. Make "Backprop" pipeline label consistent
**Rule 4** — The intro pipeline (Step00Intro.vue) says "Backprop" but
Step 12 introduces the full term "Backpropagation." Use the full word
in the pipeline preview.

### 22. Soften jargon: "amenable to parallel computation"
**Rule 2** — Step 3: "the transformer's structure is amenable to
parallel computation" — overly formal. Change to "well-suited for" or
"allows."

### 23. Clarify Step 4 subtitle
**Rule 2** — Subtitle "From token IDs to a context vector" introduces
"context vector" before the body defines it. Consider "Running the
model once" or "From token IDs to output."

### 24. Remove "automatic differentiation" jargon
**Rule 2** — StepBackpropagation.vue uses "automatic differentiation
systems" without explanation. Change to "backpropagation
implementations."

### 25. Verify MicroGPT link
The URL `karpathy.github.io/2026/02/12/microgpt/` should be verified
as live and correct.

---

## Summary by effort

| Priority | Count | Effort |
|----------|-------|--------|
| Critical | 5 | ~2-3 hours (KaTeX is the big one) |
| High | 6 | ~1-2 hours |
| Medium | 7 | ~1-2 hours |
| Low | 7 | ~1 hour |
| **Total** | **25** | **~5-8 hours** |
