/**
 * Estrae nome cliente e righe ordine da risposte API con forme diverse.
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

function normalizeLineRow(row, index) {
  const name =
    row.name ?? row.title ?? row.product_name ?? row.product?.title ?? `Prodotto ${index + 1}`
  const sku = row.sku ?? row.variant_sku ?? row.sku_code ?? '—'
  const image =
    row.image ??
    row.image_url ??
    row.thumbnail ??
    row.featured_image?.url ??
    row.product?.image?.src ??
    row.product?.image_url ??
    ''
  const maxQty = Math.max(
    1,
    Number(row.quantity ?? row.qty ?? row.order_quantity ?? row.order_qty ?? 1) || 1,
  )
  const id = row.id ?? row.line_item_id ?? row.variant_id ?? `${sku}-${index}`
  return { id: String(id), name, sku, image, maxQty }
}

export function lineItemsFromResponse(data) {
  if (!data) return []
  if (Array.isArray(data)) return data.map(normalizeLineRow)

  const raw =
    data.line_items ??
    data.items ??
    data.products ??
    data.returnable_items ??
    data.data?.line_items ??
    data.order?.line_items ??
    data.order?.items ??
    []

  if (!Array.isArray(raw)) return []
  return raw.map(normalizeLineRow)
}
