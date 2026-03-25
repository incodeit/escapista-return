<script setup>
import { inject } from 'vue'

const global = inject('global')
</script>

<template>
  <div
    class="mb-6 flex w-full flex-wrap gap-x-8 gap-y-2 border-b border-neutral-200 pb-6 text-sm text-neutral-800"
  >
    <div>
      <span class="text-neutral-500">Ordine</span>
      <span class="ml-2 font-medium text-neutral-900">{{ global.orderId || '—' }}</span>
    </div>
    <div>
      <span class="text-neutral-500">Email</span>
      <span class="ml-2 font-medium break-all text-neutral-900">{{ global.email || '—' }}</span>
    </div>
  </div>
</template>
