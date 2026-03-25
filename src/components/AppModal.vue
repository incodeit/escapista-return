<script setup>
import { CheckIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { computed, inject, onMounted, onUnmounted, watch } from 'vue'

const global = inject('global')

const open = computed(
  () =>
    global.value.modal != null &&
    global.value.modal.title != null &&
    global.value.modal.content != null,
)

function close() {
  const m = global.value.modal
  if (!m) return
  m.title = null
  m.content = null
}

function onKeydown(e) {
  if (e.key === 'Escape' && open.value) close()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
watch(open, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="'modal-title'"
    >
      <div
        class="absolute inset-0 bg-neutral-900/50"
        aria-hidden="true"
        @click="close"
      />
      <div
        class="relative z-10 w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-lg"
      >
        <div class="flex items-start justify-between gap-3">
          <h2 id="modal-title" class="pr-2 text-lg font-semibold text-neutral-900">
            {{ global.modal.title }}
          </h2>
          <button
            type="button"
            class="rounded-lg p-1 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800"
            aria-label="Chiudi"
            @click="close"
          >
            <XMarkIcon class="size-6" aria-hidden="true" />
          </button>
        </div>
        <p class="mt-3 text-sm text-neutral-600">
          {{ global.modal.content }}
        </p>
        <button type="button" class="btn-primary mt-6 w-full gap-2" @click="close">
          <CheckIcon class="size-5 shrink-0" aria-hidden="true" />
          <span>OK</span>
        </button>
      </div>
    </div>
  </Teleport>
</template>
