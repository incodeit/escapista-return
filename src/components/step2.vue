<script setup>
import { computed, inject, ref, watch } from 'vue'
import { customerNameFromResponse, lineItemsFromResponse } from '../utils/returnOrderView.js'
import IndietroButton from './IndietroButton.vue'

const global = inject('global')

const rows = ref([])

function buildRowsFromResponse() {
  const g = global.value
  let items = lineItemsFromResponse(g.responseStep1)
  if (!items.length && g.debug) {
    items = [
      {
        id: 'demo-1',
        name: 'Altai Suede Bag',
        sku: 'ETW000_PU002_6000_TGU',
        image: '',
        maxQty: 1,
      },
    ]
  }
  rows.value = items.map((item) => ({
    ...item,
    selected: false,
    qty: Math.min(1, item.maxQty),
  }))
}

watch(
  () => ({
    step: global.value.step,
    responseStep1: global.value.responseStep1,
    debug: global.value.debug,
  }),
  () => {
    if (global.value.step === 2) buildRowsFromResponse()
  },
  { immediate: true, deep: true },
)

const customerName = computed(() => customerNameFromResponse(global.value.responseStep1))

const orderTitle = computed(() => {
  const ref = String(global.value.orderId || '').trim() || '—'
  const who = customerName.value.trim()
  return who ? `Ordine ${ref} (${who})` : `Ordine ${ref}`
})

const step2Error = ref('')

function goBack() {
  global.value.step = 1
  step2Error.value = ''
}

function clampQty(row) {
  let n = Number(row.qty)
  if (Number.isNaN(n) || n < 1) n = 1
  if (n > row.maxQty) n = row.maxQty
  row.qty = n
}

function onToggle(row) {
  if (row.selected) clampQty(row)
}

function onProceed() {
  const picked = rows.value.filter((r) => r.selected && r.qty >= 1)
  if (!picked.length) {
    step2Error.value = 'Seleziona almeno un articolo da rendere.'
    return
  }
  step2Error.value = ''
  global.value.step2Selection = picked.map((r) => ({
    id: r.id,
    sku: r.sku,
    name: r.name,
    qty: r.qty,
    maxQty: r.maxQty,
  }))
  global.value.step = 3
}
</script>

<template>
  <div class="flex w-full flex-col gap-6">
    <IndietroButton @click="goBack" />

    <h1 class="text-base font-semibold text-neutral-900 sm:text-lg">
      {{ orderTitle }}
    </h1>

    <p v-if="step2Error" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
      {{ step2Error }}
    </p>

    <div class="overflow-x-auto rounded-lg border border-neutral-200">
      <table class="w-full min-w-[520px] border-collapse text-left text-sm text-neutral-900">
        <thead>
          <tr class="border-b border-neutral-200 bg-neutral-50">
            <th class="w-10 px-2 py-3" aria-label="Seleziona" />
            <th class="px-2 py-3 font-medium">Img</th>
            <th class="px-2 py-3 font-medium">Nome</th>
            <th class="px-2 py-3 font-medium">SKU</th>
            <th class="w-24 px-2 py-3 font-medium">Qty</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in rows"
            :key="row.id"
            class="border-b border-neutral-100 last:border-0"
          >
            <td class="px-2 py-3 align-middle">
              <input
                v-model="row.selected"
                type="checkbox"
                class="size-4 rounded border-neutral-300 text-sky-600 focus:ring-sky-500"
                @change="onToggle(row)"
              />
            </td>
            <td class="px-2 py-3 align-middle">
              <div
                v-if="!row.image"
                class="flex size-14 items-center justify-center rounded bg-neutral-100 text-xs text-neutral-400"
              >
                —
              </div>
              <img
                v-else
                :src="row.image"
                :alt="row.name"
                class="size-14 rounded object-cover"
                loading="lazy"
              />
            </td>
            <td class="px-2 py-3 align-middle font-medium">{{ row.name }}</td>
            <td class="px-2 py-3 align-middle text-neutral-700">{{ row.sku }}</td>
            <td class="px-2 py-3 align-middle">
              <input
                v-model.number="row.qty"
                type="number"
                :min="1"
                :max="row.maxQty"
                :disabled="!row.selected"
                class="w-16 rounded border border-neutral-300 px-2 py-1 text-center disabled:cursor-not-allowed disabled:bg-neutral-100"
                @change="clampQty(row)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="!rows.length" class="text-sm text-neutral-600">
      Nessun articolo disponibile per il reso.
    </p>

    <button
      type="button"
      class="btn-primary w-full py-3 text-center font-semibold uppercase tracking-wide"
      :disabled="!rows.length"
      @click="onProceed"
    >
      PROCEDI
    </button>

    <IndietroButton @click="goBack" />
  </div>
</template>
