# microLoss

Interactive tutorial that explains softmax, cross-entropy loss, and gradient descent from first principles.

**[Live demo](https://micro-loss.cloudship.co.uk)**

## What you'll learn

Walk through the complete prediction → loss → learning pipeline that runs inside every modern language model:

1. **Logits** — raw compatibility scores from the network
2. **Exponentiation** — mapping to positive values with e^z
3. **Softmax** — normalizing into a probability distribution
4. **Target** — encoding the correct answer as one-hot
5. **Cross-entropy loss** — measuring prediction quality with −log(p)
6. **Loss in logit form** — the tug-of-war between two forces
7. **Gradient** — the elegant p − y
8. **Gradient descent** — updating logits to reduce loss
9. **Temperature** — controlling distribution sharpness
10. **Attention** — softmax's second job in transformers

## Running locally

```bash
bun install
bun run dev
```

## Stack

Vue 3, TypeScript, Vite, Tailwind CSS v4, ECharts
