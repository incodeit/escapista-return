/**
 * Estrae nome cliente da oggetto ordine / risposta API.
 */
export function customerNameFromResponse(data) {
  if (!data || typeof data !== 'object') return ''
  const o = data.order && typeof data.order === 'object' ? data.order : data
  return (
    data.customer_name ??
    data.customer?.name ??
    o.customer_name ??
    o.customer?.name ??
    data.billing_address?.name ??
    data.billing?.name ??
    data.user?.name ??
    data.name ??
    ''
  )
}
