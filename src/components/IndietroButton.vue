<script setup>
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'

defineEmits(['click'])
</script>

<template>
  <button type="button" class="btn-primary w-fit gap-2" @click="$emit('click')">
    <ChevronLeftIcon class="size-5 shrink-0" aria-hidden="true" />
    <span>INDIETRO</span>
  </button>
</template>
