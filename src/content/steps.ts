export interface StepDefinition {
  number: number
  title: string
  subtitle: string
  description: string
  math?: string
}

export const steps: StepDefinition[] = [
  {
    number: 1,
    title: 'Logits',
    subtitle: 'Compatibility scores from the network',
    description: `<p>The network's final layer just computed a <strong>compatibility score</strong> between the current context (<em>"The ___"</em>) and each vocabulary word. For "cat" it scored 2.0, for "dog" 1.0, for "fish" 0.5, and for "bird" −1.0.</p>
<p>These scores are called <strong>logits</strong>. They can be anything: negative, zero, huge. A logit of 2.0 for "cat" doesn't mean "twice as likely" as 1.0 for "dog" — the numbers live in <em>log-space</em>. What it <em>does</em> mean is that "cat" is e<sup>1</sup> ≈ 2.7× more likely than "dog" (you'll see why in the next step).</p>
<p>Crucially, <strong>only relative differences between logits matter</strong>. Adding +100 to every logit wouldn't change the prediction at all — the same token would still win. This invariance is fundamental to how softmax works, and it's why we'll see the same logits [2, 1, 0, −1] produce identical probabilities to [102, 101, 100, 99].</p>
<p><em>In Step 10, you'll see these exact same scores appear inside the attention mechanism — but computed between tokens rather than vocabulary words.</em></p>`,
  },
  {
    number: 2,
    title: 'Exponentiation',
    subtitle: 'From log-space to positive values',
    description: `<p>We need to convert raw scores into something that behaves like probabilities. The first problem: logits can be negative, but probabilities can't be. We need a function that maps <em>any</em> real number to a positive number.</p>
<p>Why not just use <strong>|z|</strong> (absolute value)? Because −3 and +3 would become equally likely — destroying the ordering the network learned. What about <strong>max(0, z)</strong>? Then all negative logits collapse to 0, losing information.</p>
<p>Instead, we use <strong>e<sup>z</sup></strong> — Euler's number (~2.718) raised to the power of z. This is the right choice for four reasons:</p>
<ol>
<li><strong>Always positive</strong> — e<sup>z</sup> &gt; 0 for any z, even very negative ones</li>
<li><strong>Preserves ordering</strong> — if z₁ &gt; z₂, then e<sup>z₁</sup> &gt; e<sup>z₂</sup></li>
<li><strong>Amplifies differences</strong> — a slightly higher logit gets <em>exponentially</em> more weight, which is what we want: the network's top choice should dominate</li>
<li><strong>Clean derivatives</strong> — d/dz e<sup>z</sup> = e<sup>z</sup>, which keeps the gradient math elegant (you'll see this pay off in Step 7)</li>
</ol>
<p>Here's the key connection: because we use e<sup>z</sup>, a <strong>logit difference maps to a probability ratio</strong>. If cat's logit is 1 higher than dog's, then cat is e<sup>1</sup> ≈ 2.7× more probable. A difference of 2 means e<sup>2</sup> ≈ 7.4× more probable. This is why logits are said to live in "log-space" — differences in logits correspond to multiplicative ratios in probability.</p>`,
    math: 'e^{z_i}',
  },
  {
    number: 3,
    title: 'Normalization',
    subtitle: 'Softmax produces a probability distribution',
    description: `<p>A valid probability distribution needs two properties: <strong>(1) every value is non-negative</strong>, and <strong>(2) they all sum to 1</strong>. After exponentiation we have property (1). To get property (2), we simply divide each exponentiated value by the total.</p>
<p>This two-step process — exponentiate then normalize — is called <strong>softmax</strong>. It's "soft" because it approximates the "hard" maximum (argmax). Instead of picking one winner and giving it 100%, softmax spreads probability across all tokens but concentrates most of it on the highest logit. The network's raw preference becomes a clean percentage: "I'm 50.6% confident the next word is <em>cat</em>."</p>
<p>Softmax enforces <strong>competition</strong>: raising one token's logit steals probability from all the others. And it's <strong>translation-invariant</strong>: adding the same constant to every logit doesn't change the output at all. Use the shift buttons below to verify — only relative differences matter.</p>`,
    math: 'p_i = e^{z_i} / \\sum_j e^{z_j}',
  },
  {
    number: 4,
    title: 'Target Token',
    subtitle: 'What the network should have predicted',
    description: `<p>In our training data, the sentence is <em>"The <strong>cat</strong> sat on the mat."</em> We know the answer: the missing word is "cat." But how do we tell the math what the correct answer is?</p>
<p>We encode it as a <strong>one-hot vector</strong> — a list of numbers that's 0 everywhere except for a 1 at the correct position. "One-hot" because exactly one position is "hot" (activated). For our example: y = [1, 0, 0, 0] (cat=1, dog=0, fish=0, bird=0).</p>
<p>This gives us a clean format for measuring error. The network predicts a distribution <strong>p</strong> (like [0.51, 0.24, 0.15, 0.10]). The truth is <strong>y</strong> = [1, 0, 0, 0]. The gap between p and y is exactly what training will try to close — pushing p closer to y with each step.</p>`,
  },
  {
    number: 5,
    title: 'Cross-Entropy Loss',
    subtitle: 'Measuring prediction quality',
    description: `<p>We need a single number — a <strong>"loss"</strong> — that's small when the prediction is good and large when it's bad. The cross-entropy loss is simply <strong>−log(p<sub>target</sub>)</strong>: the negative log of the probability assigned to the correct answer.</p>
<p>Why −log and not something simpler? Consider what happens at different confidence levels:</p>
<ul>
<li>Network says p = 0.9 (quite confident, correct): loss = 0.105. <em>Small penalty — good job.</em></li>
<li>Network says p = 0.5 (coin flip): loss = 0.693. <em>Moderate penalty — you should know better.</em></li>
<li>Network says p = 0.01 (almost certain it was wrong): loss = 4.605. <em>Enormous penalty — catastrophic mistake.</em></li>
</ul>
<p>A simpler measure like <strong>(1 − p)</strong> gives only 0.1 vs 0.99 for those cases — it treats moderate and catastrophic mistakes too similarly. The logarithm's explosive growth near zero is exactly what we want: <strong>confidently wrong predictions must be punished severely</strong>, otherwise the network would never learn to avoid them.</p>`,
    math: 'L = -\\log p_y',
  },
  {
    number: 6,
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
  {
    number: 7,
    title: 'The Gradient',
    subtitle: 'The elegant p − y',
    description: `<p>To improve, we need to know: <strong>how should each logit change to reduce the loss?</strong> That's what the gradient tells us — the direction and magnitude of change for each logit.</p>
<p>Take the derivative of the loss with respect to each logit, and something remarkably elegant emerges: <strong>∇L = p − y</strong>. The gradient for each token is simply its predicted probability minus its target value.</p>
<p>Unpack what this means for each token:</p>
<ul>
<li><strong>Correct token</strong> (y = 1): gradient = p − 1. Since p &lt; 1, this is always <em>negative</em>. Subtracting a negative gradient means the logit goes <strong>up</strong> — exactly what we want.</li>
<li><strong>Wrong tokens</strong> (y = 0): gradient = p − 0 = p. Always <em>positive</em>. Subtracting a positive gradient pushes the logit <strong>down</strong>. And the more probability a wrong token "stole," the harder it gets pushed.</li>
</ul>
<p>This is one of the most beautiful results in machine learning: the entire gradient is just the gap between prediction and truth. No complicated derivatives — just p − y.</p>`,
    math: '\\nabla_{z} L = p - y',
  },
  {
    number: 8,
    title: 'Gradient Descent Update',
    subtitle: 'Watch the logits shift',
    description: `<p>Now we apply the gradient to actually improve the logits. The update rule is: <strong>z ← z − η(p − y)</strong>, where η (eta) is the <strong>learning rate</strong> — a small number that controls how big each step is.</p>
<p>Why subtract? Because the gradient points in the direction of <em>increasing</em> loss. We want to go the opposite direction — <em>downhill</em> — so we subtract.</p>
<p>Why not take huge steps? Too large a learning rate overshoots the minimum and can make loss <em>increase</em>. Too small and training takes forever. Finding the right η is one of the practical arts of deep learning.</p>
<p>Click "Apply Step" to see one gradient descent update, or use "Train" to watch the loss converge over many steps. Each step recomputes softmax, loss, and gradient from the new logits — the full pipeline you've learned, repeated over and over.</p>`,
    math: 'z \\leftarrow z - \\eta (p - y)',
  },
  {
    number: 9,
    title: 'Temperature',
    subtitle: 'Controlling distribution sharpness',
    description: `<p>Temperature τ scales logits before softmax: divide all logits by τ, then apply softmax as usual. This single parameter controls how "sharp" or "flat" the output distribution is.</p>
<ul>
<li><strong>Low temperature</strong> (τ → 0): Differences between logits are amplified. The highest logit dominates — the distribution becomes almost argmax. The model picks its top choice with near-certainty.</li>
<li><strong>τ = 1</strong>: Standard softmax. The model's natural confidence level.</li>
<li><strong>High temperature</strong> (τ → ∞): All logits are divided by a huge number, becoming nearly equal. The distribution flattens toward uniform — every token is equally likely.</li>
</ul>
<p>When you use ChatGPT or Claude's API and set <code>temperature=0.7</code>, this is exactly what's happening: the model's logits are divided by 0.7, making the distribution slightly sharper than normal. Lower temperature = more focused, deterministic text. Higher temperature = more creative, surprising text.</p>
<p>Notice this connects to something from Step 1: logits [2, 1, 0, −1] and [20, 10, 0, −10] have the same ranking, but the second set produces a much sharper distribution. Scale affects certainty — and temperature is precisely the knob that controls that scale.</p>`,
    math: 'p_i = e^{z_i/\\tau} / \\sum_j e^{z_j/\\tau}',
  },
  {
    number: 10,
    title: 'Attention Connection',
    subtitle: 'Softmax in the attention mechanism',
    description: `<p>You've now seen the full pipeline: logits → softmax → loss → gradient → update. But softmax plays <em>another</em> crucial role in modern neural networks — inside the <strong>attention mechanism</strong>.</p>
<p>In attention, each word computes a <strong>query</strong> ("what am I looking for?") and every word offers a <strong>key</strong> ("here's what I contain"). The dot product Q·K measures how relevant each key is to the query — producing a set of raw scores. Sound familiar? These are logits, just with a different name.</p>
<p>Softmax converts these scores into <strong>attention weights</strong> that sum to 1, determining how much each word contributes to the output. Same exponentiate-then-normalize machinery, different inputs.</p>
<p>In language prediction, there's <em>one logit per vocabulary word</em>. In attention, there's <em>one logit per token pair</em>. Same pipeline &mdash; <strong>scores → softmax → weighted choice</strong> &mdash; different meaning. Everything you've learned applies directly.</p>`,
    math: '\\text{Attention} = \\text{softmax}(QK^T)V',
  },
]
