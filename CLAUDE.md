Rules for writing the tutorial:
1. Terms should always be explained before being used.
2. Everything needs to be incredibly clear and precise, be thoughtful and careful about use of language. Be technically accurate but explain if something is jargon.
3. When updating any part of the tutorial, see if any surrounding areas, or even other parts of the tutorial need updating.
4. Be consistent with use of terms and language, don't flip between e.g. "model" and "function".
5. If someone is out of scope for this tutorial it should be flagged as such.
6. Our goal is to present the information in multiple ways to aid learning: 1) description in English, 2) mathematical representation, 3) visualisation. Multiple descriptions framed in a different way are okay and useful.
7. Historical context can be useful, e.g. the origin of the term Logits. This helps frame the information.
8. We have a links section at the end. If we introduce new material consider updating this.
9. Where appropriate, sparingly reference seminal papers that introduced specific concepts, e.g. All You Need Is Attention.
10. If you are unsure, ask the user for advice.
11. Interactive visualisations on the pages should be wholly self contained, they should not depend on data from visualisation is previous sections.
12. If a section is too long it should be split into multiple sections.
13. Consider tasteful use of typography to highlight key features.
14. Consider using mathemtical rendering library to improve appearance of mathematical formulae.
15. Keep concepts distinct from their representations. A token is not an integer — it is represented by one. A probability is not a logit — it is computed from one. Never define X as Y when X is merely encoded/represented as Y.
16. No collapsible/expandable sections. Supplementary content (historical context, deep dives, analogies) should be inline — either in a callout box or a DeepDive component. The reader should see everything without clicking.

---

# Style Guide

## Language & Tone

### Be direct, not dramatic
- **Avoid** hyperbolic language: "catastrophic", "enormous", "incredibly". State facts and let the reader draw conclusions.
- **Avoid** anthropomorphising the model: don't say "the model thinks", "it has no idea", "it knows". Instead describe what the model *outputs* or *assigns*.
- **Good:** "Confident and wrong" / **Bad:** "Catastrophic mistake"
- **Good:** "The model assigns equal probability to two options" / **Bad:** "The model has no idea"

### Introduce terms gently
- When introducing a named concept, lead with *what it does*, then name it. Don't open with the name and assume it carries meaning.
- **Good:** "That number is called the **loss** — small when the prediction is good, large when it's bad."
- **Bad:** "We need a single number — a 'loss' — that's small when the prediction is good."
- When introducing a formula, name it naturally: "The particular loss function used here is called **cross-entropy loss**" — not "we use something called cross-entropy loss."

### Motivate before defining
- Before introducing a concept, explain *why* it's needed. What problem does it solve? What breaks without it?
- **Good:** "We need to condense the prediction into a single number. Why? Because the training algorithm needs one value to improve."
- **Bad:** "We need a single number called the loss."

### Avoid vague connectors
- Don't use "there's a deep connection here" or "interestingly" — just state the connection directly.
- Don't use "note that" or "it's worth noting" — just say it.

### Repetition in different contexts is useful
- Re-stating a fact in a new context reinforces learning. E.g., reminding the reader which token is the "correct" one when showing a loss calculation, or that sliders produce probabilities via softmax.
- But avoid *adjacent* repetition — the same information displayed twice in different visual formats right next to each other is clutter, not reinforcement.

## Mathematical Notation

### Use KaTeX for all formulas
- Use the `math()` helper for display-mode formulas (on their own line, centred).
- Use the `imath()` helper for inline formulas within prose.
- Never use raw HTML (`<sup>`, `<sub>`) for mathematical notation in step descriptions — always use KaTeX.
- Both helpers are defined in `src/content/steps.ts` and pre-render at build time.

### Be consistent with notation
- Use **subscript** notation for token-specific values: `p_{\text{fish}}`, not `p(fish)`. Pick one and stick with it throughout.
- Use the same symbol for the same concept everywhere. If the loss is `L`, don't switch to `\mathcal{L}` elsewhere.
- When a symbol is introduced (e.g., `η`), explain what it is, what the symbol name is (eta), and why this symbol is conventional.

### Explain notation when introduced
- Every symbol must be explained the first time it appears. Don't assume the reader knows Greek letters.
- **Good:** "η is the lowercase Greek letter **eta** — the conventional symbol for learning rate in machine learning."
- If a notation convention differs from school maths, flag it: "Throughout machine learning, 'log' means the **natural logarithm** — base *e*, sometimes written 'ln' in school maths."

### Separate formula from explanation
- Present the formula on its own line first, then explain it in prose below. Don't bury a formula mid-sentence.

## Visualisations & Interactive Elements

### Every visualisation should earn its place
- Each chart or interactive element should communicate something the text alone cannot. If the text already covers it, remove the visualisation.
- **One chart per concept.** Don't show a bar chart and a doughnut chart for the same data. Pick the one that best serves the point being made.

### Choose the right chart type
- **Doughnut/pie chart:** for showing how a fixed total (e.g., probability summing to 1) is divided among parts.
- **Bar chart:** for comparing absolute magnitudes. Not appropriate when the point is about *ratios* or *differences* — the axis scale can make small differences invisible.
- **Line chart with marker:** for showing a function (e.g., the loss curve) with the current value highlighted.
- **Ranked list with proportional bars:** for showing ordering and relative differences when absolute scale doesn't matter.

### Interactivity must be obvious and self-contained
- If a chart responds to sliders, the sliders must be **on the same step** — never say "move the sliders above" referring to a different section.
- Step-through controls (Back/Next/Reset) are preferred over auto-playing animations — the reader controls the pace.
- Each interactive visualisation must be wholly self-contained (rule 11). It should not depend on state from a previous section.

### Don't duplicate information across visual elements
- If the calculation is shown in a formula box, don't also show separate ValueDisplay boxes with the same numbers.
- Combine where possible: a single calculation line like `Loss = −log(p_fish) = −log(0.5745) = 0.5542` replaces both a static formula and separate value displays.

### Label charts clearly
- Axis labels should describe what the value *means*, not just the symbol: "p (probability assigned to correct token)" not just "p".
- Use descriptive series names: "Cross-entropy loss −log(p)" not just "-log(p)".

## Content Structure

### Callout boxes and DeepDive for supplementary information
- Use `<Callout>` or `<DeepDive>` components for:
  - Notation explanations (e.g., "A note on 'log'")
  - Historical context (e.g., "Where does the name come from?")
  - Tangential but interesting connections
- Information in these boxes must stand alone — the reader should be able to skip it without losing the thread.
- If a callout raises more questions than it answers (e.g., introducing "nats" without explaining information theory), remove it.

### Tables for comparing values
- When showing how different inputs produce different outputs, use a table — not a bullet list.
- Include boundary values (0 and 1 for probabilities) — they anchor understanding.
- Use colour and bold to highlight key cells (e.g., the extreme values).
- Table headers should use KaTeX for mathematical notation.

### Keep sections focused
- Each step should make one main point. If a section tries to do too much, split it.
- Avoid long unbroken paragraphs. Break prose into short paragraphs (2–4 sentences), each making one point.

### Repetition across sections
- It's good to repeat key facts in new contexts — e.g., reminding the reader what the correct token is, or that softmax produces the probabilities.
- Add these as brief contextual reminders (a heading, a one-line note) rather than re-explaining from scratch.

## Technical Accuracy

### Keep concepts distinct from representations
- A token is not an integer — it is *represented by* one.
- A probability is not a logit — it is *computed from* one.
- Never say "X is Y" when X is encoded/represented as Y (rule 15).

### Be precise about directionality
- Cross-entropy is not symmetric: it measures the cost of using *p* (prediction) to represent events from *y* (truth). Don't describe it as just "how different two distributions are."
- Gradients point in the direction of *increasing* loss — we subtract them to go downhill.

### Explain why, not just what
- Don't just state that we use natural log — explain that any base works, but base *e* is conventional because it simplifies derivatives.
- Don't just state the formula — explain what each part does and why it has that form.

### Flag scope boundaries
- If a topic is out of scope (e.g., transformer internals, RLHF), say so explicitly rather than hand-waving past it.
- Use phrases like "beyond the scope of this tutorial" or "this tutorial treats X as a black box."

## Common Anti-Patterns to Avoid

| Anti-pattern | Fix |
|---|---|
| Adjacent redundancy: static formula + live calculation showing the same thing | Combine into one element |
| Bar chart with fixed axis making values look identical | Use auto-scaled bars or a ranked list |
| Referring to "sliders above" that are on a different section | Add sliders to the current section |
| Auto-playing animation that's too fast to follow | Use step-through controls (Back/Next/Reset) |
| Introducing a symbol without explaining it | Always explain the symbol name, meaning, and convention |
| "Catastrophically wrong" / "enormous penalty" | Use neutral descriptive language |
| "The model thinks" / "it has no idea" | Describe outputs and assigned values |
| `p(fish)` in one place and `p_fish` subscript in another | Pick subscript notation and use it consistently |
| Information theory tangent that raises more questions | Either explain fully in a callout or remove |
| "There's a deep connection here" | Just state the connection |
| Collapsible/expandable sections | Use inline callout or DeepDive instead |

## Checklist for Reviewing a Section

When reviewing any section, check:

- [ ] **Motivation:** Does the section explain *why* this concept is needed before defining it?
- [ ] **Terminology:** Are all terms explained before use? Is naming consistent with the rest of the tutorial?
- [ ] **Notation:** Are formulas rendered with KaTeX? Is notation consistent (subscripts vs parentheses)?
- [ ] **Symbols:** Is every new symbol explained (name, meaning, convention)?
- [ ] **Visualisations:** Does each chart earn its place? Is it the right chart type? Are axes labelled clearly?
- [ ] **Interactivity:** Are controls on this section (not referencing another)? Can the reader step through at their own pace?
- [ ] **No redundancy:** Is the same information shown twice adjacently? Can elements be combined?
- [ ] **Tone:** No hyperbole? No anthropomorphism? Direct and factual?
- [ ] **Callouts:** Is supplementary info in callout boxes? Do callouts stand alone? Do they raise more questions than they answer?
- [ ] **Accuracy:** Are concepts distinct from representations? Is directionality correct? Are scope boundaries flagged?
- [ ] **Repetition:** Are key facts restated in new contexts where helpful? Are there brief reminders of prior concepts (e.g., which token is correct, where the probabilities come from)?
