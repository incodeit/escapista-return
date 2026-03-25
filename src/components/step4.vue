<script setup>
import { inject } from 'vue'
import IndietroButton from './IndietroButton.vue'

const global = inject('global')

function onComplete() {
  global.value.modal.title = 'Complete'
  global.value.modal.content = 'final step to be implemented'
}

function goBack() {
  global.value.step = 3
}
</script>

<template>
  <div class="flex w-full flex-col gap-6">
    <h1 class="text-lg font-semibold text-neutral-900">Step 4</h1>
    <p class="text-sm text-neutral-600">Ultimo passaggio (placeholder).</p>
    <div class="flex flex-wrap gap-3">
      <IndietroButton @click="goBack" />
      <button type="button" class="btn-primary w-fit" @click="onComplete">Complete</button>
    </div>
  </div>
</template>
