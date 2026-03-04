# GUIDELINES.md Review — Progress Tracker

## What we're doing
Systematically applying GUIDELINES.md (§7 checklist) to every section of the tutorial. This involves two layers:

1. **steps.ts descriptions** — the educational prose
2. **Step component files** — the visualisations, interactivity, and layout

## What's already been done (session 2, 2026-03-03)

### Phase 1: KaTeX conversion (ALL sections — COMPLETE)
Converted all HTML math (`<sup>`, `<sub>`, HTML entities) to KaTeX rendering:
- **steps.ts**: All 21 sections now use `math()` and `imath()` helpers for formulas
- **Components**: All step components converted — zero `<sup>`/`<sub>` remaining
- MathBlock instances switched from HTML slots to `latex` prop with `\color{#hex}{}` for colored formulas
- Components use a local `km()` helper for dynamic template-level KaTeX
- Removed duplicate `math:` fields from Steps 11, 13, 14 (formula moved into description)

### Phase 2: Tone/language fixes (ALL sections — COMPLETE)
- Step 1: "enormous" → removed (let "billions of pages" speak for itself)
- Step 3: "thinks" → "rates" (anthropomorphism)
- Step 7: "This is the right choice" → "This works because" (editorialising)
- Step 8: "I'm 50.6% confident" → "50.6% for fish" (first-person anthropomorphism)
- Step 13: "most beautiful results" → removed; "stole" → "captured"
- Step 15: "remarkably wide" → "wide"
- Step 17: "The model picks" → "concentrating probability on"; "model's natural confidence" → "no scaling applied"
- Step 19: "the model always picks" → "the distribution collapses to"

### Phase 3: §7 checklist review (section by section — IN PROGRESS)

#### Step 1: The Dataset ✅
- Removed redundant "Simplified vocabulary" callout from StepDataset.vue (duplicated description para 2)

#### Step 2: Tokenization ✅
- Clean — no issues found

#### Step 3: The Model ✅
- Merged unique info from "What parameters actually are" callout (concrete `0.3471` example) into description para 2
- Removed the now-redundant callout from StepTheModel.vue

#### Step 4: The Forward Pass ✅
- Removed triple-redundant SVG caption text elements, shrunk viewBox
- Added "(its list of numbers)" parenthetical after "vector" in description

#### Step 5: From Context to Scores ✅
- Trimmed component intro text (was repeating vocabulary embedding definition from description)
- Renamed component callout from "Why a dot product measures compatibility" → "Geometric intuition" (removed redundant dot product definition, kept geometric framing)

#### Step 6: Logits ✅
- Clean — no issues found

#### Step 7: Exponentiation ✅
- Added LogitSliders to Step02Exp.vue (was referencing "sliders above" but had none)
- Removed "using the sliders above" from Try It text

#### Step 8: Normalization ✅
- Added LogitSliders to Step03Normalize.vue (same issue as Step 7)
- Removed "using the sliders above" from Key Insight callout

#### Step 9: Target Token ✅
- Clean — no issues found

#### Step 10: Cross-Entropy Loss ✅
- Clean — quality reference from session 2

#### Step 11: Loss in Logit Form ✅
- Trimmed "Key insight" callout — removed redundant two-force numbered list (already in description), kept concrete relative-value example

#### Step 12: Backpropagation ✅
- Clean — no issues found

#### Step 13: The Gradient ✅
- Clean — "Why p − y" callout adds genuine intuitive value

#### Step 14: Gradient Descent Update ✅
- Clean — no issues found

#### Step 15: Adam Optimizer ✅
- Removed redundant "Why not just SGD?" callout (duplicated description paras 1–2)

#### Step 16: Training Loop ✅
- Removed redundant "The full loop" callout (duplicated description para 1)

#### Step 17: Temperature ✅
- Trimmed "In practice" callout — removed redundant API connection sentence (already in description), kept practical guidance

#### Step 18: Attention Connection ✅
- Clean — no issues found

#### Step 19: Inference ✅
- Removed redundant "Inference (generation)" callout (duplicated description's autoregressive pipeline)

#### Step 20: The Real Thing ✅
- Clean — comparison table and FAQ add genuine value

#### Step 21: Further Reading ✅
- Clean — curated resource list is supplementary

## §7 Checklist (for reference)
When reviewing any section, check:
- [ ] Motivation: explains *why* before defining
- [ ] Terminology: all terms explained before use, naming consistent
- [ ] Notation: KaTeX used, consistent (subscripts vs parentheses)
- [ ] Symbols: every new symbol explained (name, meaning, convention)
- [ ] Visualisations: each earns its place, right chart type, axes labelled
- [ ] Interactivity: controls on this section (not referencing another), reader-paced
- [ ] No redundancy: same info not shown twice adjacently
- [ ] Tone: no hyperbole, no anthropomorphism
- [ ] Callouts: supplementary info in callout boxes, stand alone, don't raise more questions
- [ ] Accuracy: concepts distinct from representations, directionality correct, scope flagged
- [ ] Repetition: key facts restated in new contexts where helpful

## Files modified in this session (session 3, 2026-03-04)
- `src/components/steps/StepNextToken.vue` — trimmed redundant intro + callout
- `src/components/steps/Step02Exp.vue` — added LogitSliders, removed "sliders above"
- `src/components/steps/Step03Normalize.vue` — added LogitSliders, removed "sliders above"
- `src/components/steps/Step06LossLogitForm.vue` — trimmed redundant Key Insight callout
- `src/components/steps/StepAdam.vue` — removed redundant "Why not just SGD?" callout
- `src/components/steps/StepTrainingLoop.vue` — removed redundant "The full loop" callout
- `src/components/steps/Step09Temperature.vue` — trimmed redundant "In practice" opening
- `src/components/steps/StepInference.vue` — removed redundant "Inference (generation)" callout

## Files modified in session 2 (2026-03-03)
- `src/content/steps.ts` — all descriptions (KaTeX + tone)
- `src/components/steps/Step01Logits.vue` — km() helper, KaTeX in ratio annotation
- `src/components/steps/Step02Exp.vue` — km() helper, KaTeX throughout, dynamic sumExpLatex
- `src/components/steps/Step03Normalize.vue` — km() helper, KaTeX for e^(very negative)
- `src/components/steps/Step06LossLogitForm.vue` — km() helper, MathBlock latex prop, KaTeX in labels/callout
- `src/components/steps/Step07Gradient.vue` — km() helper, MathBlock latex prop, KaTeX in callout
- `src/components/steps/Step08Update.vue` — km() helper, MathBlock latex prop, KaTeX column header
- `src/components/steps/Step10Attention.vue` — MathBlock latex prop
- `src/components/steps/StepAdam.vue` — km() helper, KaTeX for β₁/β₂
- `src/components/steps/StepBackpropagation.vue` — km() helper, KaTeX in chain rule rows/callouts
- `src/components/steps/StepDataset.vue` — removed redundant callout
- `src/components/steps/StepNextToken.vue` — km() helper, KaTeX for dot product notation
- `src/components/steps/StepTheModel.vue` — removed redundant callout
- `src/components/steps/StepTrainingLoop.vue` — η entity → Unicode
- `src/components/steps/StepForwardPass.vue` — removed SVG captions, shrunk viewBox
