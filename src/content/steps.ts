import katex from 'katex'

export interface StepDefinition {
  number: number
  title: string
  subtitle: string
  description: string
}

/** Render a LaTeX string as display-mode KaTeX HTML, wrapped in a styled block */
function math(latex: string): string {
  const html = katex.renderToString(latex, { throwOnError: false, displayMode: true })
  return `<div class="my-4 text-center">${html}</div>`
}

/** Render a LaTeX string as inline KaTeX HTML */
function imath(latex: string): string {
  return katex.renderToString(latex, { throwOnError: false, displayMode: false })
}

/** Wrap code in a styled pseudocode block for use inside step descriptions */
function pseudocode(code: string): string {
  return `<pre class="step-pseudocode"><code>${code}</code></pre>`
}

export const steps: StepDefinition[] = [

  // ── STEPS 1–2: data ───────────────────────────────────────────────────
  {
    number: 1,
    title: 'Dataset',
    subtitle: 'The prediction task and training data',
    description: `<p>The goal of language modelling is to predict the next word. Given a sequence of words — <em>"the cat ate _"</em> — what comes next? To learn this, we need training data: billions of pages from the internet, books, and other sources. Each passage provides many examples of the pattern: a sequence of words followed by a known continuation. A <strong>token</strong> is the technical term for a word or word-fragment — the smallest unit the system works with.</p>
<p>We're using a simplified vocabulary of just four tokens: <strong>the</strong>, <strong>cat</strong>, <strong>ate</strong>, and <strong>fish</strong>. Real systems like GPT-4 use ~100,000 tokens covering whole words, fragments of longer words, punctuation, and special characters. The math is identical; only the scale differs.</p>
<p>Each training example is a <strong>context → target</strong> pair: a sequence of input tokens (the context) and the single correct next token (the target). Training consists of millions of these pairs, each one asking: <em>"given this context, what comes next?"</em></p>`,
  },
  {
    number: 2,
    title: 'Tokens',
    subtitle: 'Representing text as numbers',
    description: `<p>Models can't read text — they work with numbers. Before training, every piece of text is split into <strong>tokens</strong> — whole words, fragments of longer words, or punctuation characters drawn from the vocabulary. Each token is then mapped to a unique integer ID.</p>
<p>Our tiny vocabulary maps four tokens to integer IDs: the&nbsp;→&nbsp;0, cat&nbsp;→&nbsp;1, ate&nbsp;→&nbsp;2, fish&nbsp;→&nbsp;3. These integers are arbitrary identifiers — "cat" being 1 doesn't mean it's "less than" "ate" at 2. The numbers are just distinct labels used to look up each token's data in a table. The same mapping is used everywhere: to encode training data and to decode output back into words.</p>`,
  },

  // ── STEPS 3–5: the model and forward pass ────────────────────────────
  {
    number: 3,
    title: 'Model',
    subtitle: 'A function with learnable parameters',
    description: `<p>A <strong>model</strong> is a program that maps inputs to outputs. Ours takes a sequence of token IDs and produces one <strong>score</strong> per vocabulary token — a single number measuring how strongly the model associates the current context with that token as the next one. A high score for "fish" means the model currently rates "fish" as a likely continuation; a low score means it rates "fish" as unlikely. Initially those scores are arbitrary — the model starts with random internal numbers. Training gradually adjusts those numbers until the scores become useful predictions.</p>
<p>Those adjustable numbers are called <strong>parameters</strong> — concretely, each one is a single floating-point number like <code>0.3471</code> stored in memory. A modern language model has billions of them, organised into <strong>matrices</strong> (rectangular grids of numbers). When the model runs, those matrices multiply and add with the input data in sequence to produce the output scores. During training, each parameter is nudged up or down by a tiny amount to make the model's predictions better.</p>
<p>The particular arrangement of matrix operations used by GPT-style models is called a <strong>transformer</strong>, introduced in the 2017 paper <em>"Attention Is All You Need"</em> (Vaswani et al.).</p>`,
  },
  {
    number: 4,
    title: 'Forward Pass',
    subtitle: 'Running the model once',
    description: `<p>Running the model once is called a <strong>forward pass</strong>. The input is a <strong>context</strong> — the sequence of tokens seen so far, each represented as an integer token ID (e.g. <em>[0, 1, 2]</em> for "the cat ate"). The output is one <strong>score</strong> per vocabulary token: a number indicating how strongly the model rates that token as the likely next word. A high score for "fish" means the model currently considers "fish" a likely continuation of this context.</p>
<p>A single piece of training text yields multiple forward passes. For example, from the sentence "the cat ate fish", the model trains on three contexts: ["the"] → cat, ["the", "cat"] → ate, ["the", "cat", "ate"] → fish — one prediction task for each position after the first.</p>
${pseudocode(`context = [token_id_0, token_id_1, ...]

for each token_id in context:
    vector = embedding_matrix[token_id] + position_embedding

vectors = transformer_layers(vectors)
context_vector = vectors[last_position]

for each token in vocabulary:
    logits[token] = dot(context_vector, vocab_embedding[token])`)}
<p>Everything else — the lookup tables, the attention parameters, the feedforward matrices — are <strong>parameters stored inside the model</strong>, not additional inputs. The forward pass reads those parameters but doesn't change them; only the training step does that.</p>
<p>The forward pass has three sequential stages:</p>
<ol>
<li><strong>Embedding lookup</strong> — each token ID is used to look up a row from the token embedding matrix — a dictionary lookup, not a computation. A position embedding is added to encode word order.</li>
<li><strong>Layers</strong> — each layer is a fixed sequence of operations — attention, feedforward network, normalisation — that transforms every token's vector (its list of numbers), allowing information to flow between positions. Our micro-model has 1 layer; GPT-4 has roughly 120. This tutorial treats the layer internals as a black box.</li>
<li><strong>Extract</strong> — after all layers, the vector at the final position is extracted. This single vector — the <strong>context vector</strong> — is what gets passed forward to produce scores.</li>
</ol>`,
  },
  {
    number: 5,
    title: 'Context to Scores',
    subtitle: 'The dot product that produces logits',
    description: `<p>The context vector is not the final output. It still needs to be compared against every vocabulary token to produce one score per token. This comparison is the precise handoff point between the transformer's internals and the rest of this tutorial.</p>
<p>Each vocabulary token also has a learned vector — a <strong>vocabulary embedding</strong>. The model computes the <strong>dot product</strong> between the context vector and each vocabulary embedding. A dot product multiplies each pair of corresponding numbers from two vectors and sums the results: a single number that measures how aligned — how similar in direction — the two vectors are.</p>
<p>One dot product per vocabulary token gives one score per token. Those scores are called <strong>logits</strong>. A high dot product means the model's context vector is pointing in a similar direction to that token's vocabulary vector — the model currently associates this context with that token. At the start of training the vectors are random and the logits are noise; training steers the vectors so the dot products become meaningful.</p>`,
  },

  // ── STEPS 6–11: the loss pipeline ──────────────────────────────────────
  {
    number: 6,
    title: 'Logits',
    subtitle: "The model's current estimate of context–token compatibility",
    description: `<p>In Step 5 you saw how logits are produced: a dot product between the context vector and each vocabulary token's learned vector. Each logit measures how strongly the model currently associates the context with a particular next token.</p>
<p>The word "currently" matters. At the start of training the parameters are random, so the logits are initially noise. A logit is the model's <em>best current estimate</em> of compatibility — not an inherently correct measurement. Training adjusts the parameters so those estimates get better over time.</p>
<p>A logit of 2.0 for "fish" doesn't mean "twice as likely" as 1.0 for "ate" — the numbers live in <em>log-space</em>, so what matters is the <em>difference</em>. A difference of 1 means roughly 2.7× more likely (Step 7 explains why). And only relative differences matter: adding +100 to every logit wouldn't change the prediction at all.</p>`,
  },
  {
    number: 7,
    title: 'Exponentiation',
    subtitle: 'From log-space to positive values',
    description: `<p>We need to convert raw scores into something that behaves like probabilities. The first problem: logits can be negative, but probabilities can't be. We need a function that maps <em>any</em> real number to a positive number.</p>
<p>Why not just use ${imath('|z|')} (absolute value)? Because ${imath('-3')} and ${imath('+3')} would become equally likely — destroying the ordering the model learned. What about ${imath('\\max(0, z)')}? Then all negative logits collapse to 0, losing information.</p>
<p>Instead, we use ${imath('e^z')} — Euler's number (~2.718) raised to the power of ${imath('z')}. This works because:</p>
<ol>
<li><strong>Always positive</strong> — ${imath('e^z > 0')} for any ${imath('z')}, even very negative ones</li>
<li><strong>Preserves ordering</strong> — if ${imath('z_1 > z_2')}, then ${imath('e^{z_1} > e^{z_2}')}</li>
<li><strong>Amplifies differences</strong> — a slightly higher logit gets <em>exponentially</em> more weight, which is what we want: the model's top choice should dominate</li>
<li><strong>Clean derivatives</strong> — the derivative (rate of change) of ${imath('e^z')} is simply ${imath('e^z')} itself, which keeps the math elegant when we later compute how to adjust the model (Steps 12–13)</li>
</ol>
<p>Here's the key connection: because we use ${imath('e^z')}, a <strong>logit difference maps to a probability ratio</strong>. If fish's logit is 1 higher than ate's, then fish is ${imath('e^1 \\approx 2.7')}× more probable. A difference of 2 means ${imath('e^2 \\approx 7.4')}× more probable. This is why logits are said to live in "log-space" — differences in logits correspond to multiplicative ratios in probability.</p>`,
  },
  {
    number: 8,
    title: 'Softmax',
    subtitle: 'Softmax produces a probability distribution',
    description: `<p>A valid probability distribution needs two properties: <strong>(1) every value is non-negative</strong>, and <strong>(2) they all sum to 1</strong>. After exponentiation we have property (1). To get property (2), we simply divide each exponentiated value by the total.</p>
<p>This two-step process — exponentiate then normalize — is called <strong>softmax</strong>. It's "soft" because it approximates the "hard" maximum: taking the single highest-scoring token and giving it 100% (called <strong>argmax</strong> — the argument that maximises the score). Instead of that winner-takes-all approach, softmax spreads probability across all tokens but concentrates most of it on the highest logit. The model's raw preference becomes a clean percentage — 50.6% for <em>fish</em> as the next token.</p>
<p>One way to think of softmax: it redistributes a fixed budget of probability — raising one token's share automatically lowers everyone else's.</p>
${pseudocode(`exponents = [e^z for z in logits]
total = sum(exponents)
probabilities = [exp / total for exp in exponents]
# All values >= 0, and they sum to exactly 1.`)}
<p>Softmax enforces <strong>competition</strong>: raising one token's logit steals probability from all the others. And it's <strong>translation-invariant</strong>: adding the same constant to every logit doesn't change the output at all. Use the shift buttons below to verify — only relative differences matter.</p>`,
  },
  {
    number: 9,
    title: 'Target Token',
    subtitle: 'What the model should have predicted',
    description: `<p>In our training data, the full sentence is <em>"the cat ate <strong>fish</strong>."</em> We know the answer: the next word after "ate" is "fish." But how do we tell the math what the correct answer is?</p>
<p>We encode it as a <strong>one-hot vector</strong> called ${imath('y')} — a list of numbers that's 0 everywhere except for a 1 at the correct position. "One-hot" because exactly one position is "hot" (activated). For our example: ${imath('y = [0, 0, 0, 1]')} (the=0, cat=0, ate=0, fish=1).</p>
<p>This gives us a clean format for measuring error. The model outputs a probability distribution ${imath('p')} (like ${imath('[0.10, 0.15, 0.24, 0.51]')}). The truth is the one-hot vector ${imath('y = [0, 0, 0, 1]')}. The gap between ${imath('p')} and ${imath('y')} is exactly what training will try to close — pushing ${imath('p')} closer to ${imath('y')} with each step.</p>`,
  },
  {
    number: 10,
    title: 'Cross-Entropy Loss',
    subtitle: 'Measuring prediction quality',
    description: `<p>The model now outputs a probability distribution — but how does training know whether that distribution is good or bad? We need to condense the entire prediction into a <strong>single number</strong> that measures quality. Why a single number? Because the training algorithm (Steps 12–14) needs one value to improve: it adjusts every parameter in the direction that makes this number smaller. No single number, no systematic way to improve.</p>
<p>That number is called the <strong>loss</strong> — small when the prediction is good, large when it's bad. The particular loss function used here is called <strong>cross-entropy loss</strong>:</p>
${math('L = -\\log(p_{\\text{target}})')}
<p>Here ${imath('p_{\\text{target}}')} means "the probability the model gave to the correct token." In our example, the correct token is "fish." If the model assigned fish a probability of 0.51, then ${imath('p_{\\text{target}} = 0.51')}. A perfect prediction would be ${imath('p_{\\text{target}} = 1.0')}.</p>
<div class="rounded-lg border border-surface-lighter bg-surface-light/50 p-4 text-sm text-text-secondary my-4"><strong class="text-text-primary">A note on "log":</strong> Throughout machine learning, "log" means the <strong class="text-text-primary">natural logarithm</strong> — base ${imath('e')}, sometimes written "ln" in school maths. Any base would work — ${imath('\\log_2')} or ${imath('\\log_{10}')} would only differ by a constant multiplier. The convention is base ${imath('e')} because it simplifies the derivative to a clean ${imath('1/p')}, which matters when computing gradients in Step 12.</div>
<p>This formula works because softmax (Step 8) already guaranteed that ${imath('p_{\\text{target}}')} is between 0 and 1. That matters: the logarithm of any number between 0 and 1 is negative, so the negation always produces a positive loss. If the values could exceed 1, ${imath('-\\log')} would go negative — the loss would <em>reward</em> bad predictions.</p>
<p>The general cross-entropy formula is a sum over all tokens:</p>
${math('L = -\\sum_i y_i \\log(p_i)')}
<p>But since ${imath('y')} is a one-hot vector (Step 9), every term where ${imath('y_i = 0')} vanishes. Only the target token's term survives, giving us the simplified ${imath('-\\log(p_{\\text{target}})')}.</p>
${pseudocode(`# General form (any target distribution):
loss = -sum(target[i] * log(predicted[i]) for each i)

# With a one-hot target, only the correct token's term survives:
loss = -log(predicted[correct_token])`)}
<p>When ${imath('p_{\\text{target}} = 1.0')}, ${imath('-\\log(1.0) = 0')} — no loss, perfect prediction. As ${imath('p_{\\text{target}}')} drops toward 0, the loss grows without bound. <strong class="text-text-primary">The loss is effectively asking: "how far is the model's confidence in the correct answer from the ideal of 100%?"</strong></p>
<p>One way to think of cross-entropy: it is the penalty for being confident in the wrong answer — the more confident, the harsher the penalty.</p>
<p>Cross-entropy is not specific to language models — it's the standard loss function for <strong>classification</strong> across all of machine learning. The formula is always the same: ${imath('-\\log')}(probability assigned to the correct class). Image classifiers (like ResNet) use it to distinguish cats from dogs. Medical systems use it to classify scans as cancerous or benign. Recommendation engines use it to predict whether a user will click. Whenever a model picks one option from many, cross-entropy measures how well it picked.</p>`,
  },
  {
    number: 11,
    title: 'Loss as Logits',
    subtitle: 'Two competing forces',
    description: `<p>Let's substitute the softmax formula into the loss and simplify. Since ${imath('p_y = e^{z_y} / \\sum e^{z_j}')}, taking ${imath('-\\log')} of both sides and simplifying reveals the loss as a tug-of-war between two forces:</p>
<ol>
<li><strong class="text-negative">${imath('-z_y')}</strong> (raise the correct token) — Making the target's logit bigger directly lowers the loss. This is the "boost the right answer" force.</li>
<li><strong class="text-warning">${imath('\\log \\sum e^{z_j}')}</strong> (suppress competitors) — This term grows when <em>any</em> logit is large. Lowering competitor logits shrinks this term. This is the "quiet the wrong answers" force.</li>
</ol>
<p>Training balances both: raise the target while suppressing the competition. You can't just make the target logit infinity — the log-sum-exp term would grow too. The optimal strategy is to make the target's logit large <em>relative</em> to the others.</p>`,
  },

  // ── STEP 12: backpropagation (NEW) ─────────────────────────────────────
  {
    number: 12,
    title: 'Backpropagation',
    subtitle: 'How gradients are computed',
    description: `<p>We know the loss. Now we need to compute how each parameter should change to reduce it. The algorithm that does this is called <strong>backpropagation</strong> — short for "backward propagation of errors." While the mathematical idea dates back further, the algorithm was popularised for neural networks by Rumelhart, Hinton, and Williams in their 1986 <em>Nature</em> paper <em>"Learning representations by back-propagating errors."</em></p>
<p>Backpropagation answers one question: <em>"which knob should I turn, and by how much, to reduce the loss?"</em> It works by breaking this big question into many tiny questions — one per operation in the computation. Each operation is simple enough to answer directly (e.g., "if I increase the input to exp, how much does the output change?"). Then it chains the answers together.</p>
<p>That chaining is the <strong>chain rule</strong> from calculus: if ${imath('f')} affects ${imath('g')}, and ${imath('g')} affects ${imath('h')}, then to find how ${imath('f')} affects ${imath('h')}, multiply "how ${imath('f')} affects ${imath('g')}" by "how ${imath('g')} affects ${imath('h')}."</p>
<p>A crucial detail: backpropagation computes gradients for <strong>all</strong> parameters, not just one. In our model, all four token logits receive an update. The gradient ${imath('\\nabla L = p - y')} (Step 13) is non-zero for every token: the correct token gets pushed up (its gradient is negative), and all incorrect tokens get pushed down (their gradients are positive, proportional to how much probability they "stole").</p>
<p>The <strong>computation graph</strong> below — a diagram of the chain of operations, drawn as connected nodes — traces the path for the target token (cat). Click "Forward" to see values propagate left→right, then "Backward" to see gradients flow right→left. At each node, the gradient flowing in is multiplied by the local derivative and passed to the inputs. When the chain rule reaches the logits, it produces the gradient we need for the update step.</p>`,
  },

  // ── STEPS 13–14: gradient and update ──────────────────────────────────
  {
    number: 13,
    title: 'Gradient',
    subtitle: 'The elegant p − y',
    description: `<p>In the previous step you saw how backpropagation walks backward through the computation, multiplying local derivatives via the chain rule. When we apply this to our cross-entropy loss with softmax, the algebra simplifies to a remarkably clean result — the gradient for each token is simply its predicted probability minus its target value. Unpack what this means:</p>
<ul>
<li><strong>Correct token</strong> (${imath('y = 1')}): gradient ${imath('= p - 1')}. Since ${imath('p < 1')}, this is always <em>negative</em>. Subtracting a negative gradient means the logit goes <strong>up</strong> — exactly what we want.</li>
<li><strong>Wrong tokens</strong> (${imath('y = 0')}): gradient ${imath('= p - 0 = p')}. Always <em>positive</em>. Subtracting a positive gradient pushes the logit <strong>down</strong>. And the more probability a wrong token captured, the harder it gets pushed.</li>
</ul>
<p>The entire gradient is just the gap between prediction and truth. No complicated derivatives — just ${imath('p - y')}. One way to think of it: the gradient moves probability mass — it takes from tokens that got too much and gives to the correct token.</p>`,
  },
  {
    number: 14,
    title: 'Gradient Descent',
    subtitle: 'Watch the logits shift',
    description: `<p>Now we apply the gradient to actually improve the logits:</p>
${pseudocode(`gradient = predicted - target
for each token i:
    logits[i] = logits[i] - learning_rate * gradient[i]`)}
<p>The symbol ${imath('\\eta')} is the lowercase Greek letter <strong>eta</strong> — the conventional symbol for learning rate in machine learning, just as ${imath('\\pi')} is the conventional symbol for the ratio of circumference to diameter. The <strong>learning rate</strong> is a small positive number (typically between 0.001 and 1.0) that controls how much we adjust the parameters in each step.</p>
<p>Why subtract? Because the gradient points in the direction of <em>increasing</em> loss. We want to go the opposite direction — <em>downhill</em> — so we subtract.</p>
<p>Why not take huge steps? A large ${imath('\\eta')} means big steps — faster but riskier, potentially overshooting the minimum and making the loss <em>increase</em>. A small ${imath('\\eta')} means tiny steps — slower but safer. Finding the right balance is one of the practical arts of deep learning.</p>
<p>Click "Apply Step" to see one gradient descent update, or use "Train" to watch the loss converge over many steps. Each step recomputes softmax, loss, and gradient from the new logits — the full pipeline you've learned, repeated over and over.</p>`,
  },

  // ── STEP 15: Adam optimizer (NEW) ──────────────────────────────────────
  {
    number: 15,
    title: 'Adam',
    subtitle: 'Momentum + adaptive learning rates',
    description: `<p>Basic gradient descent uses the same fixed learning rate for every parameter at every step. In practice, this is too crude: some parameters need large steps and others need tiny ones, and noisy gradients cause zig-zagging.</p>
<p><strong>Adam</strong> (Adaptive Moment Estimation) fixes both problems. It maintains two running averages for each parameter: (1) the <strong>momentum</strong> — an exponentially weighted average of past gradients, which smooths out noise and maintains direction, and (2) the <strong>second moment</strong> — an average of squared gradients, which measures how large gradients typically are for this parameter.</p>
<p>The update divides the momentum by the square root of the second moment. Parameters with consistently large gradients get automatically smaller steps; parameters with small gradients get relatively larger steps. This is why Adam converges faster and more reliably than SGD — especially at learning rates where SGD would oscillate wildly.</p>
<p>Nearly every modern language model is trained with Adam or a close variant (AdamW adds weight decay — a technique that slowly shrinks parameters toward zero to prevent overfitting). Adam was proposed by Kingma and Ba in 2015, and the default hyperparameters (${imath('\\beta_1 = 0.9')}, ${imath('\\beta_2 = 0.999')}) work well across a wide range of problems.</p>`,
  },

  // ── STEP 16: training loop ─────────────────────────────────────────────
  {
    number: 16,
    title: 'Training Loop',
    subtitle: 'Gradient descent over many iterations',
    description: `<p>A single gradient descent step barely changes the logits. Real training runs the same pipeline — forward pass → loss → gradient → update — thousands or millions of times. The loss falls with each iteration, and the model's predictions gradually improve.</p>
<p>The <strong>learning rate</strong> controls the step size. Too large, and the updates overshoot the minimum, causing the loss to oscillate or diverge. Too small, and convergence is painfully slow. Finding a good learning rate is one of the core challenges of training neural networks.</p>
<p>In practice, training uses <strong>mini-batches</strong>: rather than computing the gradient from one training example at a time, the model processes a small group — a <em>batch</em> of (say) 32 or 512 examples — and averages their gradients before taking a single update step. This makes each gradient estimate less noisy while keeping computation efficient. But the core loop is exactly what you see here.</p>`,
  },

  // ── STEPS 17–19: inference ─────────────────────────────────────────────
  {
    number: 17,
    title: 'Temperature',
    subtitle: 'Controlling distribution sharpness',
    description: `<p>Temperature ${imath('\\tau')} scales logits before softmax: divide all logits by ${imath('\\tau')}, then apply softmax as usual. This single parameter controls how "sharp" or "flat" the output distribution is.</p>
<ul>
<li><strong>Low temperature</strong> (${imath('\\tau \\to 0')}): Differences between logits are amplified. The highest logit dominates — the distribution becomes almost argmax, concentrating nearly all probability on the top-scoring token.</li>
<li>${imath('\\tau = 1')}: Standard softmax — no scaling applied.</li>
<li><strong>High temperature</strong> (${imath('\\tau \\to \\infty')}): All logits are divided by a large number, becoming nearly equal. The distribution flattens toward uniform — every token is equally likely.</li>
</ul>
<p>When you use ChatGPT or Claude's API and set <code>temperature=0.7</code>, this is exactly what's happening: the logits are divided by 0.7, making the distribution slightly sharper than normal. Lower temperature = more focused, deterministic text. Higher temperature = more creative, surprising text.</p>
<p>Notice this connects to something from Step 6: logits ${imath('[2, 1, 0, -1]')} and ${imath('[20, 10, 0, -10]')} have the same ranking, but the second set produces a much sharper distribution. Scale affects certainty — and temperature is precisely the knob that controls that scale.</p>`,
  },
  {
    number: 18,
    title: 'Attention',
    subtitle: 'Softmax in the attention mechanism',
    description: `<p>You've now seen the full pipeline: logits → softmax → loss → gradient → update. But softmax plays <em>another</em> crucial role in modern neural networks — inside the <strong>attention mechanism</strong>.</p>
<p>In attention, each word computes a <strong>query</strong> ("what am I looking for?") and every word offers a <strong>key</strong> ("here's what I contain"). Their <strong>dot product</strong> ${imath('Q \\cdot K')} — the sum of element-wise multiplications of two vectors, a standard measure of similarity — produces a single score per pair. These scores play the same mathematical role as logits — raw unbounded values that softmax converts into a distribution.</p>
<p>Softmax converts these scores into <strong>attention weights</strong> that sum to 1, determining how much each word contributes to the output. Same exponentiate-then-normalize machinery, different inputs.</p>
<p>In language prediction, there's <em>one score per vocabulary token</em>. In attention, there's <em>one score per token pair</em>. Same pipeline — <strong>scores → softmax → weighted choice</strong> — different meaning. Everything you've learned applies directly.</p>`,
  },
  {
    number: 19,
    title: 'Inference',
    subtitle: 'Generating text token by token',
    description: `<p>After training, the model is ready to generate text. Given a prompt, it runs the forward pass and produces logits for the next token. Instead of checking against a target (there is none — we're generating, not training), it <strong>samples</strong> from the resulting probability distribution.</p>
<p>The sampled token is appended to the context, and the process repeats: new context → forward pass → logits → softmax → sample → next token. This is called <strong>autoregressive</strong> generation — "auto" because the model feeds its own previous output back in as input, "regressive" in the statistical sense of predicting a value from prior values in the same sequence. The loop continues until the model generates a special <strong>stop token</strong> (a designated token in the vocabulary that means "I'm done") or hits a maximum length limit.</p>
<p>Temperature controls how random the sampling is. At ${imath('\\tau \\to 0')} (greedy), the distribution collapses to the most likely token — fast but repetitive. At higher temperatures, lower-probability tokens get a chance, producing more creative and varied text at the cost of occasional incoherence.</p>`,
  },

  // ── STEP 20: capstone training demo ──────────────────────────────────
  {
    number: 20,
    title: 'Watch It Learn',
    subtitle: 'Training a real model from scratch',
    description: `<p>Everything before this point used fixed logits that we adjusted by hand. Now let's bring it all together: a real neural network with <strong>268 parameters</strong>, training on our three examples from scratch.</p>
<p>The model has <strong>token embeddings</strong> (a vector for each vocabulary word), <strong>position embeddings</strong> (a vector for each position in the context), and a two-layer <strong>feed-forward network</strong> — a simplified version of the architecture from Step 3, without attention. Given a context like [the, cat], it looks up and averages the embeddings, passes the result through the network, and produces four logits — one per vocabulary token.</p>
<p>Each training step runs the full pipeline you've learned: <strong>forward pass</strong> → <strong>cross-entropy loss</strong> → <strong>backpropagation</strong> → <strong>gradient descent update</strong>. One <em>epoch</em> trains on all three examples once. Click "Train" and watch the loss fall as the model learns to predict the next token in "the cat ate fish".</p>`,
  },

  // ── STEP 21: practical training ──────────────────────────────────
  {
    number: 21,
    title: 'Practical Training',
    subtitle: 'Overfitting, validation, and when to stop',
    description: `<p>So far we've trained on our tiny dataset and measured loss on the same data we trained on. In practice, that's not enough — a model could simply memorise every example and appear perfect while failing on anything new. Real training requires a more careful approach.</p>
<p>The solution is to <strong>hold data back</strong>. The dataset is split into three parts: a <strong>training set</strong> that the model learns from, a <strong>validation set</strong> used to monitor progress during training (the model never trains on this), and a <strong>test set</strong> held back until the very end to measure final performance.</p>
<p>When a model performs well on training data but poorly on new data, it's called <strong>overfitting</strong> — the model has memorised specific examples rather than learning general patterns. The telltale sign: training loss keeps falling while validation loss starts to rise. In practice, training is often stopped when validation loss begins to increase — a technique called <strong>early stopping</strong>.</p>`,
  },

  // ── STEPS 22–23: bridging to real world ────────────────────────────
  {
    number: 22,
    title: 'Real-World Scale',
    subtitle: 'From toy model to production LLMs',

    description: `<p>Everything you've traced — softmax, cross-entropy, backpropagation, gradient descent, Adam — is exactly what powers real language models. ChatGPT, Claude, Gemini, and every other LLM use the identical training algorithm. The only differences are <strong>scale</strong> and <strong>engineering</strong>.</p>
<p>The model you just trained has 268 parameters and learned from 3 examples. GPT-4 is estimated to have hundreds of billions to over a trillion parameters, trained on <em>trillions</em> of tokens (estimates vary — exact figures are not public). The architecture is structurally the same — the same matrix operations, the same softmax, the same cross-entropy loss — just with dramatically larger dimensions.</p>
<p>After pre-training (the next-token prediction you've learned about), production models go through additional stages: <strong>supervised fine-tuning</strong> (SFT) — training on hand-written examples of good questions and answers — and <strong>reinforcement learning from human feedback</strong> (RLHF) — a process where humans rate the model's responses, and those ratings are used to further adjust its parameters. These post-training stages are beyond the scope of this tutorial, but they are what turn a raw text predictor into a helpful assistant.</p>`,
  },
  {
    number: 23,
    title: 'Further Reading',
    subtitle: 'Continue your learning journey',
    description: `<p>This tutorial covered the <strong>training pipeline</strong>: how a language model learns from prediction errors through softmax, cross-entropy loss, backpropagation, and gradient descent. We deliberately treated the transformer's internals — the attention mechanism, embeddings, residual connections — as a black box.</p>
<p>To go deeper into the <strong>architecture</strong> (what happens inside the black box), or to build and train a working model yourself, the resources below are excellent next steps. This tutorial was inspired by Andrej Karpathy's <a href="https://karpathy.github.io/2026/02/12/microgpt/" target="_blank" rel="noopener noreferrer" class="text-brand-light hover:underline">MicroGPT</a> — a complete GPT implementation in 200 lines of Python.</p>`,
  },
]
