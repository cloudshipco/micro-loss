<script setup lang="ts">
import { createTutorialState, provideTutorialState } from './composables/useTutorialState'
import { steps } from './content/steps'
import Header from './components/layout/Header.vue'
import ScrollLayout from './components/layout/ScrollLayout.vue'
import StepSection from './components/layout/StepSection.vue'
import Step00Intro from './components/steps/Step00Intro.vue'
import Step01Logits from './components/steps/Step01Logits.vue'
import Step02Exp from './components/steps/Step02Exp.vue'
import Step03Normalize from './components/steps/Step03Normalize.vue'
import Step04Target from './components/steps/Step04Target.vue'
import Step05CrossEntropy from './components/steps/Step05CrossEntropy.vue'
import Step06LossLogitForm from './components/steps/Step06LossLogitForm.vue'
import Step07Gradient from './components/steps/Step07Gradient.vue'
import Step08Update from './components/steps/Step08Update.vue'
import Step09Temperature from './components/steps/Step09Temperature.vue'
import Step10Attention from './components/steps/Step10Attention.vue'

const state = createTutorialState()
provideTutorialState(state)

const stepComponents = [
  Step01Logits,
  Step02Exp,
  Step03Normalize,
  Step04Target,
  Step05CrossEntropy,
  Step06LossLogitForm,
  Step07Gradient,
  Step08Update,
  Step09Temperature,
  Step10Attention,
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
