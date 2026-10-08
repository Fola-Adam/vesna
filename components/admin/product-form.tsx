'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ImagePlus, Loader2, X } from 'lucide-react'

interface Category { id: string; name: string }
interface ProductFormData {
  name: string; slug: string; description: string | null; price: string; sale_price: string
  affiliate_link: string | null; category_id: string | null; image_urls: string[]
  why_victory: string | null; item_type: 'curated' | 'shop' | 'archive'
  is_featured: boolean; is_active: boolean
}
interface ProductFormProps { categories: Category[]; initialData?: ProductFormData & { id: string } }

const BUCKET = 'product-images'
const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const ITEM_TYPES = [{ value: 'curated', label: 'Curated' }, { value: 'shop', label: 'Shop' }, { value: 'archive', label: 'Archive' }] as const

function toSlug(value: string) {
  return value.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-')
}

export default function ProductForm({ categories, initialData }: ProductFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [manualSlug, setManualSlug] = useState(!!initialData)
  const [files, setFiles] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState(initialData?.image_urls || [])
  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files])
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews])
  const [form, setForm] = useState<ProductFormData>({
    name: initialData?.name || '', slug: initialData?.slug || '', description: initialData?.description || null,
    price: initialData?.price || '', sale_price: initialData?.sale_price || '', affiliate_link: initialData?.affiliate_link || null,
    category_id: initialData?.category_id || null, image_urls: initialData?.image_urls || [],
    why_victory: initialData?.why_victory || null, item_type: initialData?.item_type || 'shop',
    is_featured: initialData?.is_featured || false, is_active: initialData?.is_active ?? true,
  })

  function updateField<K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'name' && !manualSlug) next.slug = toSlug(value as string)
      return next
    })
  }

  function addFiles(fileList: FileList | null) {
    if (!fileList) return
    const selected = Array.from(fileList)
    const invalid = selected.find((file) => !ALLOWED_TYPES.includes(file.type) || file.size > MAX_FILE_SIZE)
    if (invalid) {
      setError(`${invalid.name}: use JPG, PNG, WebP, or AVIF images up to 5 MB.`)
      return
    }
    setError(null)
    setFiles((current) => [...current, ...selected])
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!supabase) { setError('Supabase is not configured.'); return }
    setSaving(true)
    setError(null)
    const uploadedPaths: string[] = []
    const retainedUrls = [...imageUrls]

    try {
      for (const file of files) {
        const extension = file.name.split('.').pop()?.toLowerCase() || 'img'
        const path = `${crypto.randomUUID()}.${extension}`
        const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false })
        if (uploadError) throw new Error(uploadError.message)
        uploadedPaths.push(path)
        retainedUrls.push(supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl)
      }

      const payload = {
        name: form.name, slug: form.slug, description: form.description || null,
        price: form.price ? Number.parseFloat(form.price) : null,
        sale_price: form.sale_price ? Number.parseFloat(form.sale_price) : null,
        affiliate_link: form.affiliate_link || null, category_id: form.category_id || null,
        image_urls: retainedUrls.filter(Boolean), why_victory: form.why_victory || null,
        item_type: form.item_type, is_featured: form.is_featured, is_active: form.is_active,
      }
      const result = initialData
        ? await supabase.from('products').update(payload).eq('id', initialData.id)
        : await supabase.from('products').insert(payload)
      if (result.error) throw new Error(result.error.message)

      const removedUrls = (initialData?.image_urls || []).filter((url) => !retainedUrls.includes(url))
      const removedPaths = removedUrls.map((url) => {
        const marker = `/storage/v1/object/public/${BUCKET}/`
        const index = url.indexOf(marker)
        return index >= 0 ? decodeURIComponent(url.slice(index + marker.length)) : null
      }).filter((path): path is string => Boolean(path))
      if (removedPaths.length) await supabase.storage.from(BUCKET).remove(removedPaths)
      router.push('/admin/products')
      router.refresh()
    } catch (cause) {
      if (uploadedPaths.length) await supabase.storage.from(BUCKET).remove(uploadedPaths)
      setError(cause instanceof Error ? cause.message : 'Could not save this product.')
      setSaving(false)
    }
  }

  const allImages = [...imageUrls, ...previews]
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && <div role="alert" className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-7 rounded-xl border border-outline-variant bg-surface p-5 sm:p-7">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Product name"><Input value={form.name} onChange={(e) => updateField('name', e.target.value)} required placeholder="e.g. Heritage silk scarf" /></Field>
            <Field label="URL slug"><Input value={form.slug} onChange={(e) => { setManualSlug(true); updateField('slug', e.target.value) }} required className="font-mono text-xs" placeholder="heritage-silk-scarf" /></Field>
          </div>
          <Field label="Description"><Textarea value={form.description || ''} onChange={(e) => updateField('description', e.target.value || null)} rows={4} placeholder="Tell shoppers what makes this piece special." /></Field>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Price"><Input type="number" step="0.01" min="0" value={form.price} onChange={(e) => updateField('price', e.target.value)} placeholder="0.00" /></Field>
            <Field label="Sale price"><Input type="number" step="0.01" min="0" value={form.sale_price} onChange={(e) => updateField('sale_price', e.target.value)} placeholder="Optional" /></Field>
            <Field label="Collection"><select value={form.item_type} onChange={(e) => updateField('item_type', e.target.value as ProductFormData['item_type'])} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">{ITEM_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category"><select value={form.category_id || ''} onChange={(e) => updateField('category_id', e.target.value || null)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">No category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field>
            <Field label="Affiliate link"><Input type="url" value={form.affiliate_link || ''} onChange={(e) => updateField('affiliate_link', e.target.value || null)} placeholder="https://…" /></Field>
          </div>
          <Field label="Why Victory picked it"><Textarea value={form.why_victory || ''} onChange={(e) => updateField('why_victory', e.target.value || null)} rows={3} placeholder="A personal note from the curator." /></Field>
          <div className="flex flex-wrap gap-x-8 gap-y-3 border-t border-outline-variant pt-5">
            <Toggle checked={form.is_featured} onChange={(value) => updateField('is_featured', value)}>Feature on the home page</Toggle>
            <Toggle checked={form.is_active} onChange={(value) => updateField('is_active', value)}>Published on the site</Toggle>
          </div>
        </div>

        <aside className="space-y-4 rounded-xl border border-outline-variant bg-surface p-5 sm:p-6">
          <div><h2 className="font-medium text-on-background">Product photography</h2><p className="mt-1 text-sm text-on-surface-variant">Upload up to 5 MB per image. JPG, PNG, WebP, or AVIF.</p></div>
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-outline-variant bg-background px-4 py-8 text-center hover:border-primary">
            <ImagePlus className="mb-2 h-6 w-6 text-primary" /><span className="text-sm font-medium">Choose image files</span><span className="mt-1 text-xs text-on-surface-variant">Images are stored in Vesna’s media library</span>
            <input type="file" accept={ALLOWED_TYPES.join(',')} multiple className="sr-only" onChange={(e) => { addFiles(e.target.files); e.currentTarget.value = '' }} />
          </label>
          {allImages.length > 0 ? <div className="grid grid-cols-2 gap-3">{allImages.map((url, index) => <div key={`${url}-${index}`} className="group relative aspect-square overflow-hidden rounded-lg bg-background"><img src={url} alt={`Product image ${index + 1}`} className="h-full w-full object-cover" />{index < imageUrls.length ? <button type="button" onClick={() => setImageUrls((current) => current.filter((_, i) => i !== index))} aria-label={`Remove image ${index + 1}`} className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white"><X className="h-4 w-4" /></button> : <button type="button" onClick={() => setFiles((current) => current.filter((_, i) => i !== index - imageUrls.length))} aria-label={`Remove selected image ${index - imageUrls.length + 1}`} className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white"><X className="h-4 w-4" /></button>}{index === 0 && <span className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-[10px] uppercase tracking-wider text-white">Cover</span>}</div>)}</div> : <div className="rounded-lg bg-background px-4 py-6 text-center text-sm text-on-surface-variant">No images added yet.</div>}
          <p className="text-xs leading-relaxed text-on-surface-variant">Existing external image links are supported. New uploads require the reviewed Supabase storage setup.</p>
        </aside>
      </div>
      <div className="flex flex-wrap gap-3 border-t border-outline-variant pt-5"><Button type="submit" disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{initialData ? 'Save product' : 'Create product'}</Button><Button type="button" variant="outline" onClick={() => router.push('/admin/products')} disabled={saving}>Cancel</Button></div>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label className="text-xs uppercase tracking-[0.12em] text-on-surface-variant">{label}</Label>{children}</div>
}
function Toggle({ checked, onChange, children }: { checked: boolean; onChange: (value: boolean) => void; children: React.ReactNode }) {
  return <label className="flex cursor-pointer items-center gap-2 text-sm text-on-surface-variant"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-primary" />{children}</label>
}
