import { customerNameFromResponse } from './returnOrderView.js'

function pickAddressRoot(data) {
  if (!data || typeof data !== 'object') return {}
  return (
    data.shipping_address ??
    data.billing_address ??
    data.order?.shipping_address ??
    data.order?.billing_address ??
    data.customer?.default_address ??
    data.default_address ??
    data.address ??
    {}
  )
}

function normalizeCountryCode(raw) {
  if (raw == null || raw === '') return 'IT'
  const s = String(raw).trim()
  const u = s.toUpperCase()
  if (u === 'ITALY' || u === 'ITALIA' || u === 'IT') return 'IT'
  if (u.length === 2) return u
  return 'IT'
}

function splitStreetLine(addr) {
  const line = String(addr.address1 ?? addr.address ?? addr.line1 ?? addr.street ?? '').trim()
  const n = String(addr.street_number ?? addr.number ?? addr.house_number ?? '').trim()
  if (n) return { street: line, number: n }
  const m = line.match(/^(.*?)\s+(\d+[a-zA-Z/-]*)\s*$/)
  if (m) return { street: m[1].trim(), number: m[2] }
  return { street: line, number: '' }
}

/**
 * Valori iniziali form “etichetta reso” da global.order + email step1.
 */
export function shippingPrefillFromResponse(data, fallbackEmail = '') {
  const d = data && typeof data === 'object' ? data : {}
  const addr = pickAddressRoot(d)
  const full = customerNameFromResponse(d)
  const parts = full.trim().split(/\s+/).filter(Boolean)
  const nomeGuess = parts[0] ?? ''
  const cognomeGuess = parts.slice(1).join(' ')

  const paese_codice = normalizeCountryCode(
    addr.country_code ?? addr.countryCode ?? addr.country ?? d.country_code,
  )
  const { street, number } = splitStreetLine(addr)

  return {
    email: String(addr.email ?? d.email ?? d.customer_email ?? fallbackEmail ?? ''),
    nome: String(addr.first_name ?? addr.firstName ?? nomeGuess ?? ''),
    cognome: String(addr.last_name ?? addr.lastName ?? cognomeGuess ?? ''),
    ragione_sociale: String(addr.company ?? addr.company_name ?? ''),
    paese_codice,
    regione_codice: String(addr.province_code ?? addr.state_code ?? '').trim(),
    regione: String(
      addr.province ?? addr.state ?? addr.region ?? addr.province_name ?? '',
    ).trim(),
    citta: String(addr.city ?? '').trim(),
    cap: String(addr.zip ?? addr.postal_code ?? addr.postcode ?? addr.cap ?? '').trim(),
    indirizzo: street,
    numero_civico: number,
    telefono: String(addr.phone ?? d.phone ?? '').trim(),
    cellulare: String(addr.mobile ?? d.customer?.phone ?? d.phone_mobile ?? '').trim(),
    note_corriere: '',
  }
}

/** Dati fittizi per ?debug=1 quando l’API non espone indirizzo. */
export function debugShippingPrefill(fallbackEmail) {
  return {
    email: fallbackEmail || 'leo.girombelli@gmail.com',
    nome: 'Leonardo',
    cognome: 'Girombelli',
    ragione_sociale: '',
    paese_codice: 'IT',
    regione_codice: '25',
    regione: 'Lombardia',
    citta: 'Milano',
    cap: '20123',
    indirizzo: 'Via Vincenzo Monti',
    numero_civico: '27',
    telefono: '',
    cellulare: '',
    note_corriere: '',
  }
}
