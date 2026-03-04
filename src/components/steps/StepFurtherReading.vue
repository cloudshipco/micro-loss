<script setup lang="ts">
import Callout from '../ui/Callout.vue'

const resources = [
  {
    title: 'MicroGPT — Andrej Karpathy',
    url: 'https://karpathy.github.io/2026/02/12/microgpt/',
    description: 'The original 200-line GPT implementation this tutorial is inspired by. A complete, working language model you can train yourself.',
    tag: 'Code',
    tagColor: '#6366f1',
  },
  {
    title: 'MicroGPT Explained — growingswe',
    url: 'https://growingswe.com/blog/microgpt',
    description: 'Interactive walkthrough of MicroGPT with deep dives into attention, embeddings, and the full transformer architecture.',
    tag: 'Interactive',
    tagColor: '#10b981',
  },
  {
    title: 'Let\'s build GPT from scratch — Andrej Karpathy',
    url: 'https://www.youtube.com/watch?v=kCc8FmEb1nY',
    description: 'Two-hour video lecture building GPT from a blank file. Covers bigrams, self-attention, multi-head attention, and training.',
    tag: 'Video',
    tagColor: '#ef4444',
  },
  {
    title: 'Neural Networks — 3Blue1Brown',
    url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi',
    description: 'Beautiful animated explanations of neural networks, gradient descent, and backpropagation. The best visual introduction to the fundamentals.',
    tag: 'Video',
    tagColor: '#ef4444',
  },
  {
    title: 'The Illustrated Transformer — Jay Alammar',
    url: 'https://jalammar.github.io/illustrated-transformer/',
    description: 'Step-by-step visual guide to the transformer architecture. Excellent diagrams of attention, layer norms, and positional encoding.',
    tag: 'Article',
    tagColor: '#f59e0b',
  },
  {
    title: 'LLM Visualization — Brendan Bycroft',
    url: 'https://bbycroft.net/llm',
    description: '3D interactive visualization of a GPT model. Watch data flow through embeddings, attention heads, and feedforward layers in real time.',
    tag: 'Interactive',
    tagColor: '#10b981',
  },
  {
    title: 'Let\'s build the GPT Tokenizer — Andrej Karpathy',
    url: 'https://www.youtube.com/watch?v=zduSFxRajkE',
    description: 'Deep dive into how tokenizers work: Byte Pair Encoding, vocabulary construction, and why tokenization matters for model performance.',
    tag: 'Video',
    tagColor: '#ef4444',
  },
  {
    title: 'Attention Is All You Need — Vaswani et al. (2017)',
    url: 'https://arxiv.org/abs/1706.03762',
    description: 'The original transformer paper. Introduced the architecture that powers every modern language model, including the attention mechanism discussed in Step 18.',
    tag: 'Paper',
    tagColor: '#8b5cf6',
  },
  {
    title: 'Adam: A Method for Stochastic Optimization — Kingma & Ba (2015)',
    url: 'https://arxiv.org/abs/1412.6980',
    description: 'The paper introducing the Adam optimizer covered in Step 15. Short, readable, and one of the most cited papers in machine learning.',
    tag: 'Paper',
    tagColor: '#8b5cf6',
  },
  {
    title: 'A Mathematical Theory of Communication — Claude Shannon (1948)',
    url: 'https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf',
    description: 'The foundational paper that introduced entropy and cross-entropy as measures of information. The cross-entropy loss in Step 10 comes directly from this work.',
    tag: 'Paper',
    tagColor: '#8b5cf6',
  },
  {
    title: 'Learning representations by back-propagating errors — Rumelhart, Hinton & Williams (1986)',
    url: 'https://www.nature.com/articles/323533a0',
    description: 'The Nature paper that popularised backpropagation for neural networks. The algorithm in Step 12 — walking backward through the computation graph, multiplying local derivatives — is exactly what this paper describes.',
    tag: 'Paper',
    tagColor: '#8b5cf6',
  },
]
</script>

<template>
  <div class="space-y-6">

    <p class="text-sm text-text-secondary">
      This tutorial covered the training pipeline: how a model learns from prediction errors.
      To go deeper into the architecture (what happens inside the black box), the resources
      below are excellent next steps.
    </p>

    <div class="space-y-3">
      <a
        v-for="resource in resources"
        :key="resource.url"
        :href="resource.url"
        target="_blank"
        rel="noopener noreferrer"
        class="group flex gap-4 rounded-lg border border-surface-lighter bg-surface p-4 transition-all hover:border-brand/50 hover:bg-surface-light"
      >
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <h4 class="text-sm font-semibold text-text-primary group-hover:text-brand-light transition-colors">
              {{ resource.title }}
            </h4>
            <span
              class="rounded-full px-2 py-0.5 text-xs font-medium"
              :style="{
                backgroundColor: resource.tagColor + '20',
                color: resource.tagColor,
              }"
            >
              {{ resource.tag }}
            </span>
          </div>
          <p class="mt-1 text-sm text-text-secondary">{{ resource.description }}</p>
        </div>
        <div class="flex shrink-0 items-center text-text-secondary/40 group-hover:text-brand-light transition-colors">
          &rarr;
        </div>
      </a>
    </div>

    <Callout variant="info" title="Recommended path:">
      If you want to understand the <em>architecture</em> (the black box from Step 4),
      start with Karpathy's video or the Illustrated Transformer. If you want to
      <em>build and train</em> a model yourself, go straight to MicroGPT.
    </Callout>
  </div>
</template>
