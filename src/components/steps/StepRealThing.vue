<script setup lang="ts">
import { ref } from 'vue'
import { ToyModel } from '../../engine/toy-model'
import Callout from '../ui/Callout.vue'

const comparisons = [
  {
    dimension: 'Vocabulary',
    ours: '4 tokens',
    production: '~100,000 tokens',
    detail: 'Real tokenizers cover whole words, word fragments, punctuation, and special characters. BPE (Byte Pair Encoding) builds the vocabulary by iteratively merging the most common character pairs until the desired size is reached.',
  },
  {
    dimension: 'Parameters',
    ours: `${ToyModel.PARAM_COUNT}`,
    production: 'Hundreds of billions to trillions',
    detail: 'GPT-3 has 175 billion. GPT-4 is estimated to have hundreds of billions to over a trillion — exact figures are not public. The architecture uses the same types of operations — embeddings, matrix multiplications, nonlinearities — just with vastly larger dimensions. Each attention head, embedding vector, and MLP (multilayer perceptron — the feedforward network inside each transformer layer) is wider and deeper.',
  },
  {
    dimension: 'Training data',
    ours: '3 examples',
    production: 'Trillions of tokens',
    detail: 'Models are trained on enormous text corpora: books, websites, code, scientific papers. The dataset size is measured in tokens, not documents — GPT-3 was trained on about 300 billion tokens, and later models use significantly more.',
  },
  {
    dimension: 'Context length',
    ours: '4 tokens',
    production: '128K+ tokens',
    detail: 'Early GPT models had context windows of 2K–4K tokens. Modern models like Claude and GPT-4 support 128K+ tokens — meaning they can process entire books in a single forward pass. This requires specialised attention implementations (the details are beyond this tutorial\'s scope).',
  },
  {
    dimension: 'Training time',
    ours: 'Milliseconds',
    production: 'Weeks to months on thousands of GPUs',
    detail: 'Training a frontier model costs tens of millions of dollars in compute. Thousands of GPUs run in parallel, each processing different batches of data. The longest training runs take months of continuous computation.',
  },
  {
    dimension: 'Architecture',
    ours: 'Embeddings + 2-layer MLP',
    production: '100+ layers, 96+ attention heads',
    detail: 'Our trained model uses embeddings and a simple feed-forward network. Production models add attention (which you learned about in the Attention step), residual connections, layer normalisation, and stack dozens of these layers deep. Each additional layer gives the model more capacity to learn complex patterns.',
  },
  {
    dimension: 'Post-training',
    ours: 'None',
    production: 'SFT + RLHF',
    detail: 'After pre-training (next-token prediction), models go through supervised fine-tuning (SFT) on curated instruction-response pairs, then reinforcement learning from human feedback (RLHF) to align behavior with human preferences. This is what makes a raw language model into a helpful assistant.',
  },
]

const expandedRows = ref<Set<number>>(new Set())

function toggleRow(index: number) {
  const next = new Set(expandedRows.value)
  if (next.has(index)) {
    next.delete(index)
  } else {
    next.add(index)
  }
  expandedRows.value = next
}

const faqs = [
  {
    question: 'Does it "understand"?',
    answer: 'The training process is entirely mechanical: compute a prediction, measure the error, adjust parameters to reduce that error. There is no moment where understanding "switches on." Yet the patterns learned through billions of gradient steps produce behavior that looks remarkably like understanding. Whether this constitutes real understanding is a philosophical question — but the mechanism itself is the same math you just traced through.',
  },
  {
    question: 'Why does it work so well?',
    answer: 'Predicting the next token well requires capturing an enormous amount about the structure of language, facts about the world, reasoning patterns, and even social conventions. A model that can reliably predict what comes next in any text has, in some sense, built an internal model of the processes that generate text. Gradient descent on next-token prediction turns out to be an extraordinarily effective way to compress and organise knowledge.',
  },
  {
    question: 'What about hallucinations?',
    answer: 'The model samples from a probability distribution — it doesn\'t have a concept of "ground truth." If the training data contains conflicting information, or if the model is asked about something rare, it generates plausible-sounding text based on learned patterns rather than verified facts. This is an active area of research; various techniques (beyond the scope of this tutorial) aim to reduce hallucinations.',
  },
  {
    question: 'How do chat models like ChatGPT and Claude differ from base models?',
    answer: 'A base model trained only on next-token prediction will complete any text — it doesn\'t know it\'s supposed to be "helpful." Chat models go through additional training: supervised fine-tuning (SFT) teaches the format of helpful responses, and reinforcement learning from human feedback (RLHF) teaches the model to prefer responses humans rate as helpful, harmless, and honest. The underlying next-token prediction mechanism is identical; the post-training shapes what the model chooses to say.',
  },
]

const expandedFaqs = ref<Set<number>>(new Set())

function toggleFaq(index: number) {
  const next = new Set(expandedFaqs.value)
  if (next.has(index)) {
    next.delete(index)
  } else {
    next.add(index)
  }
  expandedFaqs.value = next
}
</script>

<template>
  <div class="space-y-6">

    <!-- Intro -->
    <Callout variant="info" title="From toy to production:">
      Everything you've learned — softmax, cross-entropy, backpropagation, gradient descent, Adam —
      is exactly what powers real language models. The only differences are scale and engineering.
      Click any row below to learn more.
    </Callout>

    <!-- Comparison table -->
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-surface-lighter text-text-secondary">
            <th class="py-2 text-left font-medium">Dimension</th>
            <th class="py-2 text-right font-medium text-brand-light">Our tutorial</th>
            <th class="py-2 text-right font-medium text-text-primary">Production LLMs</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, i) in comparisons"
            :key="row.dimension"
            class="cursor-pointer border-b border-surface-lighter/50 transition-colors hover:bg-surface-light/50"
            @click="toggleRow(i)"
          >
            <td class="py-2.5" colspan="3">
              <div class="flex items-center">
                <div class="flex-1">
                  <div class="flex items-center gap-1">
                    <span class="text-xs text-text-secondary/60 transition-transform"
                      :class="expandedRows.has(i) ? 'rotate-90' : ''">&#9654;</span>
                    <span class="font-medium text-text-primary">{{ row.dimension }}</span>
                  </div>
                </div>
                <div class="w-32 text-right font-mono text-xs text-brand-light">{{ row.ours }}</div>
                <div class="w-48 text-right font-mono text-xs text-text-primary">{{ row.production }}</div>
              </div>
              <div
                v-if="expandedRows.has(i)"
                class="mt-2 rounded-lg bg-surface p-3 text-xs text-text-secondary"
              >
                {{ row.detail }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- FAQ accordion -->
    <div>
      <h4 class="mb-3 text-sm font-medium text-text-secondary">Frequently asked questions</h4>
      <div class="space-y-2">
        <div
          v-for="(faq, i) in faqs"
          :key="faq.question"
          class="rounded-lg border border-surface-lighter transition-colors"
          :class="expandedFaqs.has(i) ? 'bg-surface-light' : 'bg-surface hover:bg-surface-light/50'"
        >
          <button
            @click="toggleFaq(i)"
            class="flex w-full items-center gap-3 p-4 text-left"
          >
            <span class="text-xs text-text-secondary/60 transition-transform"
              :class="expandedFaqs.has(i) ? 'rotate-90' : ''">&#9654;</span>
            <span class="text-sm font-medium text-text-primary">{{ faq.question }}</span>
          </button>
          <div
            v-if="expandedFaqs.has(i)"
            class="px-4 pb-4 text-sm leading-relaxed text-text-secondary"
          >
            {{ faq.answer }}
          </div>
        </div>
      </div>
    </div>

    <!-- Closing thought -->
    <Callout variant="positive" title="The same math, at scale:">
      There is no secret ingredient. The entire mechanism — predict, measure error, compute gradient,
      update parameters — is exactly what you've traced through this tutorial. Production models
      add engineering (distributed training, mixed precision, efficient attention) but the fundamental
      algorithm is identical. You now understand how language models learn.
    </Callout>
  </div>
</template>
