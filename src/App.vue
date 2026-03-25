<script setup>
import { ref, provide } from 'vue'
import Step1 from './components/step1.vue'
import Step2 from './components/step2.vue'
import Step3 from './components/step3.vue'
import Step4 from './components/step4.vue'
import AppModal from './components/AppModal.vue'
import OrderInfo from './components/OrderInfo.vue'

const CAN_RETURN_URL = 'https://agenzieriunite.deagor.io/api/canReturn'

const global = ref({
  email: '',
  orderId: '',
  order: null,
  responseStep1: null,
  step1Error: '',
  step1Submitting: false,
  step: 1,
  debug: false,
  step2Selection: null,
  shippingFrom: null,
  modal: {
    title: null,
    content: null,
  },
})

if (typeof window !== 'undefined') {
  const qs = new URLSearchParams(window.location.search)
  if (qs.get('debug') === '1') {
    const g = global.value
    g.debug = true
    g.email = 'leo.girombelli@gmail.com'
    g.orderId = '1013'
  }
}

async function submitStep1() {
  const g = global.value
  g.step1Error = ''
  g.step1Submitting = true
  try {
    const res = await fetch(CAN_RETURN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: g.email.trim(),
        order_reference: String(g.orderId).trim(),
      }),
    })
    const text = await res.text()
    let data = null
    try {
      data = text ? JSON.parse(text) : null
    } catch {
      data = text
    }
    g.responseStep1 = data

    if (!res.ok) {
      const msg =
        data && typeof data === 'object' && 'message' in data && data.message
          ? String(data.message)
          : `Richiesta non riuscita (${res.status})`
      g.step1Error = msg
      return
    }

    g.step = 2
  } catch {
    g.responseStep1 = null
    g.step1Error = 'Connessione non riuscita. Riprova.'
  } finally {
    g.step1Submitting = false
  }
}

provide('global', global)
provide('submitStep1', submitStep1)
</script>

<template>
  <div class="min-h-dvh bg-neutral-50 px-4 py-12">
    <div class="mx-auto w-full max-w-3xl">
      <Step1 v-if="global.step === 1" />
      <div
        v-else
        class="flex w-full flex-col rounded-xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <OrderInfo />
        <Step2 v-if="global.step === 2" />
        <Step3 v-else-if="global.step === 3" />
        <Step4 v-else-if="global.step === 4" />
      </div>
    </div>
    <AppModal />
  </div>
</template>
