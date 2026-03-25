<script setup>
import { computed, inject, reactive, ref, watch } from 'vue'
import { customerNameFromResponse } from '../utils/returnOrderView.js'
import { displayCountryName, getCountriesSorted, getRegionsForCountry } from '../utils/geoOptions.js'
import { debugShippingPrefill, shippingPrefillFromResponse } from '../utils/shippingPrefill.js'
import IndietroButton from './IndietroButton.vue'

const global = inject('global')

const countries = getCountriesSorted()

/** @type {import('vue').Ref<'autonomous' | 'return_label' | null>} */
const mode = ref(null)

const form = reactive({
  email: '',
  nome: '',
  cognome: '',
  ragione_sociale: '',
  paese_codice: 'IT',
  regione_codice: '',
  regione: '',
  citta: '',
  cap: '',
  indirizzo: '',
  numero_civico: '',
  telefono: '',
  cellulare: '',
  note_corriere: '',
})

const regionOptions = computed(() => getRegionsForCountry(form.paese_codice))

function syncRegionAfterPrefill() {
  const opts = regionOptions.value
  if (!opts.length) return
  const byCode = opts.find((r) => r.shortCode === form.regione_codice)
  if (byCode) {
    form.regione = byCode.name
    return
  }
  if (form.regione) {
    const byName = opts.find((r) => r.name.toLowerCase() === form.regione.toLowerCase())
    if (byName) {
      form.regione_codice = byName.shortCode
      form.regione = byName.name
    }
  }
}

function applyPrefill() {
  const g = global.value
  const base = shippingPrefillFromResponse(g.responseStep1, g.email)
  const emptyEnough =
    g.debug &&
    !String(base.nome || '').trim() &&
    !String(base.citta || '').trim() &&
    !String(base.indirizzo || '').trim()
  if (emptyEnough) {
    Object.assign(form, debugShippingPrefill(g.email))
  } else {
    Object.assign(form, base)
  }
  syncRegionAfterPrefill()
}

watch(
  () => global.value.step,
  (s) => {
    if (s === 3) {
      mode.value = null
      applyPrefill()
    }
  },
  { immediate: true },
)

watch(
  () => form.paese_codice,
  () => {
    const opts = getRegionsForCountry(form.paese_codice)
    const ok = opts.some((r) => r.shortCode === form.regione_codice)
    if (!ok) {
      form.regione_codice = ''
      form.regione = ''
    }
  },
)

function onRegionChange() {
  const r = regionOptions.value.find((x) => x.shortCode === form.regione_codice)
  if (r) form.regione = r.name
}

const step3Error = ref('')

function goBack() {
  global.value.step = 2
  step3Error.value = ''
}

const orderTitle = computed(() => {
  const ref = String(global.value.orderId || '').trim() || '—'
  const who = customerNameFromResponse(global.value.responseStep1).trim()
  return who ? `Indirizzo per Ordine ${ref} (${who})` : `Indirizzo per Ordine ${ref}`
})

const field =
  'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 outline-none ring-neutral-400 transition focus:border-neutral-500 focus:ring-2 disabled:cursor-not-allowed disabled:bg-neutral-100'
const label = 'text-sm font-medium text-neutral-800'

function validateReturnLabel() {
  const checks = [
    form.email,
    form.nome,
    form.cognome,
    form.paese_codice,
    form.regione_codice,
    form.citta,
    form.cap,
    form.indirizzo,
    form.numero_civico,
    form.cellulare,
  ]
  return checks.every((v) => String(v ?? '').trim() !== '')
}

function onSubmit() {
  step3Error.value = ''
  const g = global.value

  if (mode.value == null) {
    step3Error.value = 'Seleziona una modalità di reso per proseguire.'
    return
  }

  if (mode.value === 'autonomous') {
    g.shippingFrom = {
      metodo_reso: 'spedizione_autonoma',
    }
    g.step = 4
    return
  }

  if (!validateReturnLabel()) {
    step3Error.value = 'Compila tutti i campi obbligatori (con *).'
    return
  }

  const c = countries.find((x) => x.code === form.paese_codice)
  const paeseNome = c ? displayCountryName(c.code, c.name) : form.paese_codice
  const reg = regionOptions.value.find((r) => r.shortCode === form.regione_codice)
  const regioneNome = reg?.name ?? form.regione

  g.shippingFrom = {
    metodo_reso: 'etichetta_reso',
    email: form.email.trim(),
    nome: form.nome.trim(),
    cognome: form.cognome.trim(),
    ragione_sociale: form.ragione_sociale.trim(),
    paese: paeseNome,
    paese_codice: form.paese_codice,
    regione: regioneNome,
    regione_codice: form.regione_codice,
    citta: form.citta.trim(),
    cap: form.cap.trim(),
    indirizzo: form.indirizzo.trim(),
    numero_civico: form.numero_civico.trim(),
    telefono: form.telefono.trim(),
    cellulare: form.cellulare.trim(),
    note_corriere: form.note_corriere.trim(),
  }
  g.step = 4
}
</script>

<template>
  <div class="flex w-full flex-col gap-6">
    <IndietroButton @click="goBack" />

    <h1 class="text-base font-semibold text-neutral-900 sm:text-lg">
      {{ orderTitle }}
    </h1>

    <p
      v-if="step3Error"
      class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
      role="alert"
    >
      {{ step3Error }}
    </p>
    <form class="flex flex-col gap-6" @submit.prevent="onSubmit">
      <fieldset class="flex flex-col gap-3 border-0 p-0">
        <legend class="sr-only">Modalità di reso</legend>
        <label class="flex cursor-pointer items-center gap-2 text-sm text-neutral-900">
          <input
            v-model="mode"
            type="radio"
            name="shipping_mode"
            value="autonomous"
            class="size-4 border-neutral-300 text-sky-600 focus:ring-sky-500"
          />
          Spedisci in autonomia
        </label>
        <label class="flex cursor-pointer items-center gap-2 text-sm text-neutral-900">
          <input
            v-model="mode"
            type="radio"
            name="shipping_mode"
            value="return_label"
            class="size-4 border-neutral-300 text-sky-600 focus:ring-sky-500"
          />
          Genera etichetta di reso
        </label>
      </fieldset>

      <div v-if="mode === 'return_label'" class="flex flex-col gap-5">
        <h2 class="text-sm font-semibold text-neutral-900">
          Conferma l'indirizzo di partenza del reso
        </h2>

        <div class="flex flex-col gap-1.5">
          <label for="s_email" :class="label">Email*</label>
          <input id="s_email" v-model="form.email" type="email" required :class="field" autocomplete="email" />
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="flex flex-col gap-1.5">
            <label for="s_nome" :class="label">Nome*</label>
            <input id="s_nome" v-model="form.nome" type="text" required :class="field" autocomplete="given-name" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label for="s_cognome" :class="label">Cognome*</label>
            <input id="s_cognome" v-model="form.cognome" type="text" required :class="field" autocomplete="family-name" />
          </div>
        </div>
        <div class="flex flex-col gap-1.5">
          <label for="s_ragione" :class="label">Ragione sociale</label>
          <input id="s_ragione" v-model="form.ragione_sociale" type="text" :class="field" autocomplete="organization" />
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="flex flex-col gap-1.5">
            <label for="s_paese" :class="label">Paese*</label>
            <select
              id="s_paese"
              v-model="form.paese_codice"
              required
              :class="field"
              autocomplete="country"
            >
              <option v-for="co in countries" :key="co.code" :value="co.code">
                {{ displayCountryName(co.code, co.name) }}
              </option>
            </select>
          </div>
          <div class="flex flex-col gap-1.5">
            <label for="s_regione" :class="label">Regione*</label>
            <select
              id="s_regione"
              v-model="form.regione_codice"
              required
              :class="field"
              @change="onRegionChange"
            >
              <option value="" disabled>Seleziona…</option>
              <option v-for="r in regionOptions" :key="r.shortCode" :value="r.shortCode">
                {{ r.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="flex flex-col gap-1.5">
            <label for="s_citta" :class="label">Città*</label>
            <input id="s_citta" v-model="form.citta" type="text" required :class="field" autocomplete="address-level2" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label for="s_cap" :class="label">CAP*</label>
            <input id="s_cap" v-model="form.cap" type="text" required :class="field" autocomplete="postal-code" />
          </div>
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="flex flex-col gap-1.5 sm:col-span-2">
            <label for="s_via" :class="label">Indirizzo*</label>
            <input id="s_via" v-model="form.indirizzo" type="text" required :class="field" autocomplete="street-address" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label for="s_civico" :class="label">Numero civico*</label>
            <input id="s_civico" v-model="form.numero_civico" type="text" required :class="field" />
          </div>
        </div>
        <div class="flex flex-col gap-1.5">
          <label for="s_tel" :class="label">Numero di telefono</label>
          <input id="s_tel" v-model="form.telefono" type="tel" :class="field" autocomplete="tel" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label for="s_cell" :class="label">Cellulare*</label>
          <input id="s_cell" v-model="form.cellulare" type="tel" required :class="field" autocomplete="tel-national" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label for="s_note" :class="label">Note per il corriere</label>
          <textarea id="s_note" v-model="form.note_corriere" rows="3" :class="field" />
        </div>
      </div>

      <button type="submit" class="btn-primary w-full">PROCEDI</button>
    </form>

    <IndietroButton @click="goBack" />
  </div>
</template>
