import { permanentRedirect } from 'next/navigation'

/** Preserve existing catalog URLs while giving browsing one clear home. */
export default async function ShopPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = new URLSearchParams()
  for (const [name, value] of Object.entries(await searchParams)) {
    if (Array.isArray(value)) value.forEach(item => query.append(name, item))
    else if (value != null) query.set(name, value)
  }
  permanentRedirect(`/picks${query.size ? `?${query}` : ''}`)
}
