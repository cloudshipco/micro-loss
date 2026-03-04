<script setup lang="ts">
import { steps } from './content/steps'
import Header from './components/layout/Header.vue'
import ScrollLayout from './components/layout/ScrollLayout.vue'
import StepSection from './components/layout/StepSection.vue'
import Step00Intro from './components/steps/Step00Intro.vue'
import StepDataset from './components/steps/StepDataset.vue'
import StepTokenization from './components/steps/StepTokenization.vue'
import StepTheModel from './components/steps/StepTheModel.vue'
import StepForwardPass from './components/steps/StepForwardPass.vue'
import StepNextToken from './components/steps/StepNextToken.vue'
import Step01Logits from './components/steps/Step01Logits.vue'
import Step02Exp from './components/steps/Step02Exp.vue'
import Step03Normalize from './components/steps/Step03Normalize.vue'
import Step04Target from './components/steps/Step04Target.vue'
import Step05CrossEntropy from './components/steps/Step05CrossEntropy.vue'
import Step06LossLogitForm from './components/steps/Step06LossLogitForm.vue'
import StepBackpropagation from './components/steps/StepBackpropagation.vue'
import Step07Gradient from './components/steps/Step07Gradient.vue'
import Step08Update from './components/steps/Step08Update.vue'
import StepAdam from './components/steps/StepAdam.vue'
import StepTrainingLoop from './components/steps/StepTrainingLoop.vue'
import Step09Temperature from './components/steps/Step09Temperature.vue'
import Step10Attention from './components/steps/Step10Attention.vue'
import StepInference from './components/steps/StepInference.vue'
import StepWatchItLearn from './components/steps/StepWatchItLearn.vue'
import StepRealThing from './components/steps/StepRealThing.vue'
import StepFurtherReading from './components/steps/StepFurtherReading.vue'

const stepComponents = [
  StepDataset,         // Step  1: The Dataset
  StepTokenization,    // Step  2: Tokenization
  StepTheModel,        // Step  3: The Model
  StepForwardPass,     // Step  4: The Forward Pass
  StepNextToken,       // Step  5: From Context to Scores
  Step01Logits,        // Step  6: Logits
  Step02Exp,           // Step  7: Exponentiation
  Step03Normalize,     // Step  8: Normalization
  Step04Target,        // Step  9: Target Token
  Step05CrossEntropy,  // Step 10: Cross-Entropy Loss
  Step06LossLogitForm, // Step 11: Loss in Logit Form
  StepBackpropagation, // Step 12: Backpropagation (NEW)
  Step07Gradient,      // Step 13: The Gradient
  Step08Update,        // Step 14: Gradient Descent Update
  StepAdam,            // Step 15: Adam Optimizer (NEW)
  StepTrainingLoop,    // Step 16: Training Loop
  Step09Temperature,   // Step 17: Temperature
  Step10Attention,     // Step 18: Attention Connection
  StepInference,       // Step 19: Inference
  StepWatchItLearn,    // Step 20: Watch It Learn (NEW)
  StepRealThing,       // Step 21: The Real Thing
  StepFurtherReading,  // Step 22: Further Reading
]
</script>

<template>
  <div class="min-h-screen">
    <Header />
    <ScrollLayout>
      <Step00Intro />
      <StepSection
        v-for="(step, index) in steps"
        :key="step.number"
        :step="step"
      >
        <component :is="stepComponents[index]" />
      </StepSection>
    </ScrollLayout>
  </div>
</template>
