<script setup>
import { inject } from 'vue'

const global = inject('global')
const submitStep1 = inject('submitStep1')

async function onSubmit() {
  await submitStep1()
}
</script>

<template>
  <form
    class="flex w-full flex-col gap-5 rounded-xl border border-neutral-200 bg-white p-8 shadow-sm"
    @submit.prevent="onSubmit"
  >
    <div>
      <h1 class="text-lg font-semibold text-neutral-900">Richiesta reso</h1>
      <p class="mt-1 text-sm text-neutral-600">
        Inserisci l’email e il numero ordine per continuare.
      </p>
    </div>

    <p
      v-if="global.step1Error"
      class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
      role="alert"
    >
      {{ global.step1Error }}
    </p>

    <div class="flex flex-col gap-1.5">
      <label for="email" class="text-sm font-medium text-neutral-800">Email</label>
      <input
        id="email"
        v-model="global.email"
        type="email"
        name="email"
        autocomplete="email"
        required
        :disabled="global.step1Submitting"
        class="rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 outline-none ring-neutral-400 transition focus:border-neutral-500 focus:ring-2 disabled:cursor-not-allowed disabled:bg-neutral-100"
        placeholder="nome@esempio.it"
      />
    </div>

    <div class="flex flex-col gap-1.5">
      <label for="order_id" class="text-sm font-medium text-neutral-800">
        Numero ordine
      </label>
      <input
        id="order_id"
        v-model="global.orderId"
        type="text"
        name="order_id"
        required
        :disabled="global.step1Submitting"
        class="rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 outline-none ring-neutral-400 transition focus:border-neutral-500 focus:ring-2 disabled:cursor-not-allowed disabled:bg-neutral-100"
        placeholder="es. 1013"
      />
    </div>

    <button type="submit" :disabled="global.step1Submitting" class="btn-primary mt-1 w-full">
      {{ global.step1Submitting ? 'Invio in corso…' : 'Continua' }}
    </button>
  </form>
</template>
