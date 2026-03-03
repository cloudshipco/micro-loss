export interface StepDefinition {
  number: number
  title: string
  subtitle: string
  description: string
  math?: string
}

export const steps: StepDefinition[] = [

  // ── STEPS 1–2: data ───────────────────────────────────────────────────
  {
    number: 1,
    title: 'The Dataset',
    subtitle: 'The prediction task and training data',
    description: `<p>The goal of language modelling is to predict the next word. Given a sequence of words — <em>"the cat ate _"</em> — what comes next? To learn this, we need an enormous collection of text: billions of pages from the internet, books, and other sources. Each passage provides many examples of the pattern: a sequence of words followed by a known continuation. A <strong>token</strong> is the technical term for a word or word-fragment — the smallest unit the system works with.</p>
<p>We're using a simplified vocabulary of just four tokens: <strong>the</strong>, <strong>cat</strong>, <strong>ate</strong>, and <strong>fish</strong>. Real systems like GPT-4 use ~100,000 tokens covering whole words, fragments of longer words, punctuation, and special characters. The math is identical; only the scale differs.</p>
<p>Each training example is a <strong>context → target</strong> pair: a sequence of input tokens (the context) and the single correct next token (the target). Training consists of millions of these pairs, each one asking: <em>"given this context, what comes next?"</em></p>`,
  },
  {
    number: 2,
    title: 'Tokenization',
    subtitle: 'Representing text as numbers',
    description: `<p>Models can't read text — they work with numbers. Before training, every piece of text is split into <strong>tokens</strong> — whole words, fragments of longer words, or punctuation characters drawn from the vocabulary. Each token is then mapped to a unique integer ID.</p>
<p>Our tiny vocabulary maps four tokens to integer IDs: the&nbsp;→&nbsp;0, cat&nbsp;→&nbsp;1, ate&nbsp;→&nbsp;2, fish&nbsp;→&nbsp;3. The same table is used everywhere: to encode training data and to decode output back into words.</p>`,
  },

  // ── STEPS 3–5: the model and forward pass ────────────────────────────
  {
    number: 3,
    title: 'The Model',
    subtitle: 'A function with learnable parameters',
    description: `<p>A <strong>model</strong> is a program that maps inputs to outputs. Ours takes a sequence of token IDs and produces one <strong>score</strong> per vocabulary token — a single number measuring how strongly the model associates the current context with that token as the next one. A high score for "fish" means the model currently thinks "fish" is a likely continuation; a low score means it thinks "fish" is unlikely. Initially those scores are arbitrary — the model starts with random internal numbers. Training gradually adjusts those numbers until the scores become useful predictions.</p>
<p>Those adjustable numbers are called <strong>parameters</strong>. A modern language model has billions of them, organised into <strong>matrices</strong> (rectangular grids of numbers). When the model runs, those matrices multiply and add with the input data in sequence to produce the output scores. During training, each parameter is nudged up or down by a tiny amount to make the model's predictions better.</p>
<p>The particular arrangement of matrix operations used by GPT-style models is called a <strong>transformer</strong>, introduced in the 2017 paper <em>"Attention Is All You Need"</em> (Vaswani et al.). Unlike earlier designs that had to process tokens sequentially (one at a time), the transformer's structure allows parallel computation: calculations for different positions in the input are largely independent, so modern hardware (GPUs) can run them simultaneously — which is a large part of why training large models is feasible at all.</p>`,
  },
  {
    number: 4,
    title: 'The Forward Pass',
    subtitle: 'Running the model once',
    description: `<p>Running the input through the model once — from token IDs in to output scores out — is called a <strong>forward pass</strong>. The input is a sequence of tokens, each represented as an integer <strong>token ID</strong>. The output is one score per vocabulary token. A single training document contains many prediction tasks: one for each token position.</p>
<p>Everything else — the lookup tables, the attention parameters, the feedforward matrices — are <strong>parameters stored inside the model</strong>, not additional inputs. The forward pass reads those parameters but doesn't change them; only the training step does that.</p>
<p>The forward pass has three sequential stages:</p>
<ol>
<li><strong>Embedding lookup</strong> — each token ID is used to look up a row from the token embedding matrix — a dictionary lookup, not a computation. A position embedding is added to encode word order.</li>
<li><strong>Layers</strong> — each layer is a fixed sequence of operations — attention, feedforward network, normalisation — that transforms every token's vector, allowing information to flow between positions. Our micro-model has 1 layer; GPT-4 has roughly 120. This tutorial treats the layer internals as a black box.</li>
<li><strong>Extract</strong> — after all layers, the vector at the final position is extracted. This single vector — the <strong>context vector</strong> — is what gets passed forward to produce scores.</li>
</ol>`,
  },
  {
    number: 5,
    title: 'From Context to Scores',
    subtitle: 'The dot product that produces logits',
    description: `<p>The context vector is not the final output. It still needs to be compared against every vocabulary token to produce one score per token. This comparison is the precise handoff point between the transformer's internals and the rest of this tutorial.</p>
<p>Each vocabulary token also has a learned vector — a <strong>vocabulary embedding</strong>. The model computes the <strong>dot product</strong> between the context vector and each vocabulary embedding. A dot product multiplies each pair of corresponding numbers from two vectors and sums the results: a single number that measures how aligned — how similar in direction — the two vectors are.</p>
<p>One dot product per vocabulary token gives one score per token. Those scores are called <strong>logits</strong>. A high dot product means the model's context vector is pointing in a similar direction to that token's vocabulary vector — the model currently associates this context with that token. At the start of training the vectors are random and the logits are noise; training steers the vectors so the dot products become meaningful.</p>`,
    math: 'z_i = \\mathbf{h}^T \\mathbf{w}_i',
  },

  // ── STEPS 6–11: the loss pipeline ──────────────────────────────────────
  {
    number: 6,
    title: 'Logits',
    subtitle: "The model's current estimate of context–token compatibility",
    description: `<p>In Step 5 you saw how logits are produced: a dot product between the context vector and each vocabulary token's learned vector. Each logit measures how strongly the model currently associates the context with a particular next token.</p>
<p>The word "currently" matters. At the start of training the parameters are random, so the logits are initially noise. A logit is the model's <em>best current estimate</em> of compatibility — not an inherently correct measurement. Training adjusts the parameters so those estimates get better over time.</p>
<p>The name comes from statistics: the <strong>logit function</strong> (coined by Joseph Berkson in 1944) maps a probability to an unbounded real number via log(p/(1−p)) — the logarithm of the odds. In neural networks, "logits" refers to unbounded scores before any normalisation into probabilities. They live in that same unconstrained space: any real number, positive or negative.</p>
<p>A logit of 2.0 for "fish" doesn't mean "twice as likely" as 1.0 for "ate" — the numbers live in <em>log-space</em>, so what matters is the <em>difference</em>. A difference of 1 means roughly 2.7× more likely (Step 7 explains why). And only relative differences matter: adding +100 to every logit wouldn't change the prediction at all.</p>`,
  },
  {
    number: 7,
    title: 'Exponentiation',
    subtitle: 'From log-space to positive values',
    description: `<p>We need to convert raw scores into something that behaves like probabilities. The first problem: logits can be negative, but probabilities can't be. We need a function that maps <em>any</em> real number to a positive number.</p>
<p>Why not just use <strong>|z|</strong> (absolute value)? Because −3 and +3 would become equally likely — destroying the ordering the model learned. What about <strong>max(0, z)</strong>? Then all negative logits collapse to 0, losing information.</p>
<p>Instead, we use <strong>e<sup>z</sup></strong> — Euler's number (~2.718) raised to the power of z. This is the right choice for four reasons:</p>
<ol>
<li><strong>Always positive</strong> — e<sup>z</sup> &gt; 0 for any z, even very negative ones</li>
<li><strong>Preserves ordering</strong> — if z₁ &gt; z₂, then e<sup>z₁</sup> &gt; e<sup>z₂</sup></li>
<li><strong>Amplifies differences</strong> — a slightly higher logit gets <em>exponentially</em> more weight, which is what we want: the model's top choice should dominate</li>
<li><strong>Clean derivatives</strong> — the derivative (rate of change) of e<sup>z</sup> is simply e<sup>z</sup> itself, which keeps the math elegant when we later compute how to adjust the model (Steps 12–13)</li>
</ol>
<p>Here's the key connection: because we use e<sup>z</sup>, a <strong>logit difference maps to a probability ratio</strong>. If fish's logit is 1 higher than ate's, then fish is e<sup>1</sup> ≈ 2.7× more probable. A difference of 2 means e<sup>2</sup> ≈ 7.4× more probable. This is why logits are said to live in "log-space" — differences in logits correspond to multiplicative ratios in probability.</p>`,
    math: 'e^{z_i}',
  },
  {
    number: 8,
    title: 'Normalization',
    subtitle: 'Softmax produces a probability distribution',
    description: `<p>A valid probability distribution needs two properties: <strong>(1) every value is non-negative</strong>, and <strong>(2) they all sum to 1</strong>. After exponentiation we have property (1). To get property (2), we simply divide each exponentiated value by the total.</p>
<p>This two-step process — exponentiate then normalize — is called <strong>softmax</strong>. It's "soft" because it approximates the "hard" maximum: taking the single highest-scoring token and giving it 100% (called <strong>argmax</strong> — the argument that maximises the score). Instead of that winner-takes-all approach, softmax spreads probability across all tokens but concentrates most of it on the highest logit. The model's raw preference becomes a clean percentage: "I'm 50.6% confident the next word is <em>fish</em>."</p>
<p>Softmax enforces <strong>competition</strong>: raising one token's logit steals probability from all the others. And it's <strong>translation-invariant</strong>: adding the same constant to every logit doesn't change the output at all. Use the shift buttons below to verify — only relative differences matter.</p>`,
    math: 'p_i = e^{z_i} / \\sum_j e^{z_j}',
  },
  {
    number: 9,
    title: 'Target Token',
    subtitle: 'What the model should have predicted',
    description: `<p>In our training data, the full sentence is <em>"the cat ate <strong>fish</strong>."</em> We know the answer: the next word after "ate" is "fish." But how do we tell the math what the correct answer is?</p>
<p>We encode it as a <strong>one-hot vector</strong> — a list of numbers that's 0 everywhere except for a 1 at the correct position. "One-hot" because exactly one position is "hot" (activated). For our example: y = [0, 0, 0, 1] (the=0, cat=0, ate=0, fish=1).</p>
<p>This gives us a clean format for measuring error. The model predicts a distribution <strong>p</strong> (like [0.10, 0.15, 0.24, 0.51]). The truth is <strong>y</strong> = [0, 0, 0, 1]. The gap between p and y is exactly what training will try to close — pushing p closer to y with each step.</p>`,
    math: 'y_i = \\begin{cases} 1 & \\text{if } i = \\text{target} \\\\ 0 & \\text{otherwise} \\end{cases}',
  },
  {
    number: 10,
    title: 'Cross-Entropy Loss',
    subtitle: 'Measuring prediction quality',
    description: `<p>We need a single number — a <strong>"loss"</strong> — that's small when the prediction is good and large when it's bad. The cross-entropy loss is simply <strong>−log(p<sub>target</sub>)</strong>: the negative log of the probability assigned to the correct answer. The name comes from information theory (Claude Shannon, 1948): cross-entropy measures the inefficiency of using one distribution to encode events from another.</p>
<p>Why −log and not something simpler? Consider what happens at different confidence levels:</p>
<ul>
<li>Model says p = 0.9 (quite confident, correct): loss = 0.105. <em>Small penalty — good job.</em></li>
<li>Model says p = 0.5 (coin flip): loss = 0.693. <em>Moderate penalty — you should know better.</em></li>
<li>Model says p = 0.01 (almost certain it was wrong): loss = 4.605. <em>Enormous penalty — catastrophic mistake.</em></li>
</ul>
<p>A simpler measure like <strong>(1 − p)</strong> gives only 0.1 vs 0.99 for those cases — it treats moderate and catastrophic mistakes too similarly. The logarithm's explosive growth near zero is exactly what we want: <strong>confidently wrong predictions must be punished severely</strong>, otherwise the model would never learn to avoid them.</p>`,
    math: 'L = -\\log p_y',
  },
  {
    number: 11,
    title: 'Loss in Logit Form',
    subtitle: 'Two competing forces',
    description: `<p>Let's substitute the softmax formula into the loss and simplify. Since p<sub>y</sub> = e<sup>z<sub>y</sub></sup> / Σe<sup>z<sub>j</sub></sup>, taking −log gives us:</p>
<p><strong>L = −z<sub>y</sub> + log Σ e<sup>z<sub>j</sub></sup></strong></p>
<p>This reveals the loss as a tug-of-war between two forces:</p>
<ol>
<li><strong class="text-negative">−z<sub>y</sub></strong> (raise the correct token) — Making the target's logit bigger directly lowers the loss. This is the "boost the right answer" force.</li>
<li><strong class="text-warning">log Σ e<sup>z<sub>j</sub></sup></strong> (suppress competitors) — This term grows when <em>any</em> logit is large. Lowering competitor logits shrinks this term. This is the "quiet the wrong answers" force.</li>
</ol>
<p>Training balances both: raise the target while suppressing the competition. You can't just make the target logit infinity — the log-sum-exp term would grow too. The optimal strategy is to make the target's logit large <em>relative</em> to the others.</p>`,
    math: 'L = -z_y + \\log \\sum_j e^{z_j}',
  },

  // ── STEP 12: backpropagation (NEW) ─────────────────────────────────────
  {
    number: 12,
    title: 'Backpropagation',
    subtitle: 'How gradients are computed',
    description: `<p>We know the loss. Now we need to compute how each parameter should change to reduce it. The algorithm that does this is called <strong>backpropagation</strong> — short for "backward propagation of errors." While the mathematical idea dates back further, the algorithm was popularised for neural networks by Rumelhart, Hinton, and Williams in their 1986 <em>Nature</em> paper <em>"Learning representations by back-propagating errors."</em></p>
<p>The idea: the forward pass is a chain of operations (exponentiate → sum → divide → log → negate). Each operation has a simple, known <strong>derivative</strong> — a measure of how much the output changes when the input changes by a tiny amount. The <strong>chain rule</strong> from calculus says: to find the derivative of a chain of functions, multiply the derivatives of each link. Backpropagation applies this rule systematically, walking backward through the computation graph — from loss to logits — multiplying local derivatives at each step.</p>
<p>The <strong>computation graph</strong> below — a diagram of the chain of operations, drawn as connected nodes — traces the path for the target token (cat). Click "Forward" to see values propagate left→right, then "Backward" to see gradients flow right→left. At each node, the gradient flowing in is multiplied by the local derivative and passed to the inputs. When the chain rule reaches the logits, it produces the gradient we need for the update step.</p>`,
    math: '\\frac{\\partial L}{\\partial z} = \\frac{\\partial L}{\\partial p} \\cdot \\frac{\\partial p}{\\partial z}',
  },

  // ── STEPS 13–14: gradient and update ──────────────────────────────────
  {
    number: 13,
    title: 'The Gradient',
    subtitle: 'The elegant p − y',
    description: `<p>In the previous step you saw how backpropagation walks backward through the computation, multiplying local derivatives via the chain rule. When we apply this to our cross-entropy loss with softmax, the algebra simplifies to something remarkably elegant: <strong>∇L = p − y</strong>.</p>
<p>The gradient for each token is simply its predicted probability minus its target value. Unpack what this means:</p>
<ul>
<li><strong>Correct token</strong> (y = 1): gradient = p − 1. Since p &lt; 1, this is always <em>negative</em>. Subtracting a negative gradient means the logit goes <strong>up</strong> — exactly what we want.</li>
<li><strong>Wrong tokens</strong> (y = 0): gradient = p − 0 = p. Always <em>positive</em>. Subtracting a positive gradient pushes the logit <strong>down</strong>. And the more probability a wrong token "stole," the harder it gets pushed.</li>
</ul>
<p>This is one of the most beautiful results in machine learning: the entire gradient is just the gap between prediction and truth. No complicated derivatives — just p − y.</p>`,
    math: '\\nabla_{z} L = p - y',
  },
  {
    number: 14,
    title: 'Gradient Descent Update',
    subtitle: 'Watch the logits shift',
    description: `<p>Now we apply the gradient to actually improve the logits. The update rule is: <strong>z ← z − η(p − y)</strong>, where η (eta) is the <strong>learning rate</strong> — a small number that controls how big each step is.</p>
<p>Why subtract? Because the gradient points in the direction of <em>increasing</em> loss. We want to go the opposite direction — <em>downhill</em> — so we subtract.</p>
<p>Why not take huge steps? Too large a learning rate overshoots the minimum and can make loss <em>increase</em>. Too small and training takes forever. Finding the right η is one of the practical arts of deep learning.</p>
<p>Click "Apply Step" to see one gradient descent update, or use "Train" to watch the loss converge over many steps. Each step recomputes softmax, loss, and gradient from the new logits — the full pipeline you've learned, repeated over and over.</p>`,
    math: 'z \\leftarrow z - \\eta (p - y)',
  },

  // ── STEP 15: Adam optimizer (NEW) ──────────────────────────────────────
  {
    number: 15,
    title: 'Adam Optimizer',
    subtitle: 'Momentum + adaptive learning rates',
    description: `<p>Basic gradient descent uses the same fixed learning rate for every parameter at every step. In practice, this is too crude: some parameters need large steps and others need tiny ones, and noisy gradients cause zig-zagging.</p>
<p><strong>Adam</strong> (Adaptive Moment Estimation) fixes both problems. It maintains two running averages for each parameter: (1) the <strong>momentum</strong> — an exponentially weighted average of past gradients, which smooths out noise and maintains direction, and (2) the <strong>second moment</strong> — an average of squared gradients, which measures how large gradients typically are for this parameter.</p>
<p>The update divides the momentum by the square root of the second moment. Parameters with consistently large gradients get automatically smaller steps; parameters with small gradients get relatively larger steps. This is why Adam converges faster and more reliably than SGD — especially at learning rates where SGD would oscillate wildly.</p>
<p>Nearly every modern language model is trained with Adam or a close variant (AdamW adds weight decay — a technique that slowly shrinks parameters toward zero to prevent overfitting). Adam was proposed by Kingma and Ba in 2015, and the default hyperparameters (β₁ = 0.9, β₂ = 0.999) work well across a remarkably wide range of problems.</p>`,
    math: '\\theta \\leftarrow \\theta - \\alpha \\cdot \\hat{m} / (\\sqrt{\\hat{v}} + \\epsilon)',
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
    description: `<p>Temperature τ scales logits before softmax: divide all logits by τ, then apply softmax as usual. This single parameter controls how "sharp" or "flat" the output distribution is.</p>
<ul>
<li><strong>Low temperature</strong> (τ → 0): Differences between logits are amplified. The highest logit dominates — the distribution becomes almost argmax. The model picks its top choice with near-certainty.</li>
<li><strong>τ = 1</strong>: Standard softmax. The model's natural confidence level.</li>
<li><strong>High temperature</strong> (τ → ∞): All logits are divided by a huge number, becoming nearly equal. The distribution flattens toward uniform — every token is equally likely.</li>
</ul>
<p>When you use ChatGPT or Claude's API and set <code>temperature=0.7</code>, this is exactly what's happening: the model's logits are divided by 0.7, making the distribution slightly sharper than normal. Lower temperature = more focused, deterministic text. Higher temperature = more creative, surprising text.</p>
<p>Notice this connects to something from Step 6: logits [2, 1, 0, −1] and [20, 10, 0, −10] have the same ranking, but the second set produces a much sharper distribution. Scale affects certainty — and temperature is precisely the knob that controls that scale.</p>`,
    math: 'p_i = e^{z_i/\\tau} / \\sum_j e^{z_j/\\tau}',
  },
  {
    number: 18,
    title: 'Attention Connection',
    subtitle: 'Softmax in the attention mechanism',
    description: `<p>You've now seen the full pipeline: logits → softmax → loss → gradient → update. But softmax plays <em>another</em> crucial role in modern neural networks — inside the <strong>attention mechanism</strong>.</p>
<p>In attention, each word computes a <strong>query</strong> ("what am I looking for?") and every word offers a <strong>key</strong> ("here's what I contain"). Their <strong>dot product</strong> Q·K — the sum of element-wise multiplications of two vectors, a standard measure of similarity — produces a single score per pair. Sound familiar? These scores play the same mathematical role as logits — raw unbounded values that softmax converts into a distribution.</p>
<p>Softmax converts these scores into <strong>attention weights</strong> that sum to 1, determining how much each word contributes to the output. Same exponentiate-then-normalize machinery, different inputs.</p>
<p>In language prediction, there's <em>one score per vocabulary token</em>. In attention, there's <em>one score per token pair</em>. Same pipeline &mdash; <strong>scores → softmax → weighted choice</strong> &mdash; different meaning. Everything you've learned applies directly.</p>`,
    math: '\\text{Attention} = \\text{softmax}(QK^T)V',
  },
  {
    number: 19,
    title: 'Inference',
    subtitle: 'Generating text token by token',
    description: `<p>After training, the model is ready to generate text. Given a prompt, it runs the forward pass and produces logits for the next token. Instead of checking against a target (there is none — we're generating, not training), it <strong>samples</strong> from the resulting probability distribution.</p>
<p>The sampled token is appended to the context, and the process repeats: new context → forward pass → logits → softmax → sample → next token. This is called <strong>autoregressive</strong> generation — "auto" because the model feeds its own previous output back in as input, "regressive" in the statistical sense of predicting a value from prior values in the same sequence. The loop continues until the model generates a special <strong>stop token</strong> (a designated token in the vocabulary that means "I'm done") or hits a maximum length limit.</p>
<p>Temperature controls how random the sampling is. At τ → 0 (greedy), the model always picks the most likely token — fast but repetitive. At higher temperatures, lower-probability tokens get a chance, producing more creative and varied text at the cost of occasional incoherence.</p>`,
  },

  // ── STEPS 20–21: bridging to real world (NEW) ─────────────────────────
  {
    number: 20,
    title: 'The Real Thing',
    subtitle: 'From toy model to production LLMs',
    description: `<p>Everything you've traced — softmax, cross-entropy, backpropagation, gradient descent, Adam — is exactly what powers real language models. ChatGPT, Claude, Gemini, and every other LLM use the identical training algorithm. The only differences are <strong>scale</strong> and <strong>engineering</strong>.</p>
<p>Our toy model has 864 parameters trained on 6 examples. GPT-4 has an estimated <em>trillion+</em> parameters trained on <em>trillions</em> of tokens. The architecture is structurally the same — the same matrix operations, the same softmax, the same cross-entropy loss — just with dramatically larger dimensions.</p>
<p>After pre-training (the next-token prediction you've learned about), production models go through additional stages: <strong>supervised fine-tuning</strong> (SFT) — training on hand-written examples of good questions and answers — and <strong>reinforcement learning from human feedback</strong> (RLHF) — a process where humans rate the model's responses, and those ratings are used to further adjust its parameters. These post-training stages are beyond the scope of this tutorial, but they are what turn a raw text predictor into a helpful assistant.</p>`,
  },
  {
    number: 21,
    title: 'Further Reading',
    subtitle: 'Continue your learning journey',
    description: `<p>This tutorial covered the <strong>training pipeline</strong>: how a language model learns from prediction errors through softmax, cross-entropy loss, backpropagation, and gradient descent. We deliberately treated the transformer's internals — the attention mechanism, embeddings, residual connections — as a black box.</p>
<p>To go deeper into the <strong>architecture</strong> (what happens inside the black box), or to build and train a working model yourself, the resources below are excellent next steps. This tutorial was inspired by Andrej Karpathy's <a href="https://karpathy.github.io/2026/02/12/microgpt/" target="_blank" rel="noopener noreferrer" class="text-brand-light hover:underline">MicroGPT</a> — a complete GPT implementation in 200 lines of Python.</p>`,
  },
]
