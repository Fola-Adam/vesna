/** Public branding settings only; never put credentials here. */
export const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || 'victoryvesna2@gmail.com'

export function getSiteUrl(): URL | undefined {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://vesna-seven.vercel.app')
  if (!configured) return undefined
  try {
    const url = new URL(configured)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return undefined
    return new URL(url.origin)
  } catch { return undefined }
}
