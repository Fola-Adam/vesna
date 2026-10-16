/** Use only a listing's stored destination; never a caller-supplied redirect. */
export function sellerDetails(raw: string | null): { href: string; name: string } | null {
  if (!raw) return null
  try {
    const url = new URL(raw)
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null
    return { href: url.toString(), name: url.hostname.replace(/^www\./, '') }
  } catch { return null }
}
