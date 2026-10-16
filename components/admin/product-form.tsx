'use client'

import { cloneElement, isValidElement, useEffect, useId, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, X } from 'lucide-react'
import { SELECTION_BASES, validSpecifications, type SelectionBasis } from '@/lib/product-editorial'

interface Category { id: string; name: string }
interface ProductFormData {
  brand?:string; uses?:string[]; interests?:string[]; occasions?:string[]; recipient_tags?:string[]
  name: string; slug: string; description: string | null; price: string; sale_price: string
  affiliate_link: string | null; category_id: string | null; image_urls: string[]
  why_victory: string | null; item_type: 'curated' | 'shop' | 'archive'
  is_featured: boolean; is_active: boolean
  best_for: string; considerations: string; specifications: string; selection_basis: SelectionBasis
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
  const [metadataText,setMetadataText]=useState({uses:(initialData?.uses||[]).join(', '),interests:(initialData?.interests||[]).join(', '),occasions:(initialData?.occasions||[]).join(', '),recipient_tags:(initialData?.recipient_tags||[]).join(', ')})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [manualSlug, setManualSlug] = useState(!!initialData)
  const [files, setFiles] = useState<File[]>([])
    const [imageOrder, setImageOrder] = useState<string[]>(initialData?.image_urls || [])
  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files])
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews])
  const [form, setForm] = useState<ProductFormData>({
    brand:initialData?.brand||'', uses:initialData?.uses||[],interests:initialData?.interests||[],occasions:initialData?.occasions||[],recipient_tags:initialData?.recipient_tags||[],
    name: initialData?.name || '', slug: initialData?.slug || '', description: initialData?.description || null,
    price: initialData?.price || '', sale_price: initialData?.sale_price || '', affiliate_link: initialData?.affiliate_link || null,
    category_id: initialData?.category_id || null, image_urls: initialData?.image_urls || [],
    why_victory: initialData?.why_victory || null, item_type: initialData?.item_type || 'shop',
    is_featured: initialData?.is_featured || false, is_active: initialData?.is_active ?? false,
    best_for: initialData?.best_for || '', considerations: initialData?.considerations || '',
    specifications: initialData?.specifications || '', selection_basis: initialData?.selection_basis || 'not_recorded',
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
    setImageOrder(order => [...order, ...selected.map((_, index) => `upload:${files.length + index}`)])
    setFiles(current => [...current, ...selected])
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!supabase) { setError('Supabase is not configured.'); return }
    if (!validSpecifications(form.specifications)) {
      setError('Enter up to 20 specifications, one Label: value per line (label up to 80 characters; value up to 300).')
      return
    }
    setSaving(true)
    setError(null)
    const uploadedPaths: string[] = []
    const retainedUrls: string[] = []

    try {
      for (const image of imageOrder) {
        if (!image.startsWith('upload:')) { retainedUrls.push(image); continue }
        const file = files[Number(image.slice(7))]
        const extension = file.name.split('.').pop()?.toLowerCase() || 'img'
        const path = `${crypto.randomUUID()}.${extension}`
        const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false })
        if (uploadError) throw new Error(uploadError.message)
        uploadedPaths.push(path)
        retainedUrls.push(supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl)
      }

      const payload = {
        brand:form.brand?.trim()||null,uses:form.uses,interests:form.interests,occasions:form.occasions,recipient_tags:form.recipient_tags,
        name: form.name, slug: form.slug, description: form.description || null,
        price: form.price ? Number.parseFloat(form.price) : null,
        sale_price: form.sale_price ? Number.parseFloat(form.sale_price) : null,
        affiliate_link: form.affiliate_link || null, category_id: form.category_id || null,
        image_urls: retainedUrls.filter(Boolean), why_victory: form.why_victory || null,
        item_type: form.item_type, is_featured: form.is_featured, is_active: form.is_active,
        best_for: form.best_for.trim() || null, considerations: form.considerations.trim() || null,
        specifications: form.specifications.trim() || null, selection_basis: form.selection_basis,
      }
      const result = initialData
        ? await supabase.from('products').update(payload).eq('id', initialData.id).select('id').single()
        : await supabase.from('products').insert(payload).select('id').single()
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

  const allImages = imageOrder.map(key => ({ key, url: key.startsWith('upload:') ? previews[Number(key.slice(7))] : key }))
  function moveImage(index: number, target: number) {
    setImageOrder(current => {
      const next = [...current]
      const [image] = next.splice(index, 1)
      next.splice(target, 0, image)
      return next
    })
  }
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
          <section className="space-y-5 border-t border-outline-variant pt-6">
            <div><h2 className="font-medium text-on-background">The editorial details</h2><p className="mt-1 text-sm text-on-surface-variant">Help readers choose with confidence. Add verified facts and honest limitations. Empty fields stay hidden.</p></div>
            <Field label="Brand"><Input maxLength={100} value={form.brand||''} onChange={e=>updateField('brand',e.target.value)} /></Field>
            {(['uses','interests','occasions','recipient_tags'] as const).map(key=><Field key={key} label={{uses:'Uses',interests:'Interests',occasions:'Occasions',recipient_tags:'Recipient suitability'}[key]}><Input aria-label={{uses:'Uses',interests:'Interests',occasions:'Occasions',recipient_tags:'Recipient suitability'}[key]} value={metadataText[key]} maxLength={1000} onChange={e=>{setMetadataText(current=>({...current,[key]:e.target.value}));updateField(key,e.target.value.split(',').map(tag=>tag.trim().toLowerCase()).filter(Boolean).slice(0,12).map(tag=>tag.slice(0,80)))}} /><p className="mt-1 text-xs text-ink-muted">Comma-separated, up to 12 verified tags. Add only suitability supported by product facts.</p></Field>)}
            <Field label="Who this suits"><Textarea maxLength={2000} rows={3} value={form.best_for} onChange={e => updateField('best_for', e.target.value)} placeholder="Describe the person or situation this pick is well suited to." /></Field>
            <Field label="What to consider"><Textarea maxLength={2000} rows={3} value={form.considerations} onChange={e => updateField('considerations', e.target.value)} placeholder="Trade-offs, limitations, compatibility, or who should choose something else." /></Field>
            <Field label="Basis for selection"><select aria-label="Basis for selection" value={form.selection_basis} onChange={e => updateField('selection_basis', e.target.value as SelectionBasis)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">{Object.entries(SELECTION_BASES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
            <p className="text-xs leading-relaxed text-on-surface-variant">Choose personally used only when the curator has used this exact product. Research and design selections do not imply testing.</p>
            <Field label="Verified specifications"><Textarea aria-label="Verified specifications" maxLength={8000} rows={5} value={form.specifications} onChange={e => updateField('specifications', e.target.value)} placeholder={'One fact per line: Label: value\nOnly include facts checked against a reliable source.'} /></Field>
          </section>
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
          {allImages.length > 0 ? <div className="grid grid-cols-2 gap-3">{allImages.map(({key, url}, index) => <div key={key} className="overflow-hidden rounded-lg border border-outline-variant bg-background">
            <div className="relative aspect-square"><img src={url} alt={`Product image ${index + 1}`} className="h-full w-full object-contain p-3" /><button type="button" disabled={saving} onClick={() => { setImageOrder(current => current.filter(image => image !== key)) }} aria-label={`Remove image ${index + 1}`} className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white"><X className="h-4 w-4" /></button></div>
            <div className="flex items-center justify-between gap-1 border-t border-outline-variant p-2">
              <button type="button" disabled={index === 0 || saving} onClick={() => moveImage(index, 0)} className="text-xs font-medium text-primary disabled:text-on-surface-variant">{index === 0 ? 'Cover' : 'Set cover'}</button>
              <div className="flex gap-1"><button type="button" disabled={index === 0 || saving} onClick={() => moveImage(index, index - 1)} aria-label={`Move image ${index + 1} earlier`} className="rounded p-1 disabled:opacity-30"><ArrowLeft className="h-4 w-4" /></button><button type="button" disabled={index === allImages.length - 1 || saving} onClick={() => moveImage(index, index + 1)} aria-label={`Move image ${index + 1} later`} className="rounded p-1 disabled:opacity-30"><ArrowRight className="h-4 w-4" /></button></div>
            </div>
          </div>)}</div> : <div className="rounded-lg bg-background px-4 py-6 text-center text-sm text-on-surface-variant">No images added yet.</div>}
          <p className="text-xs leading-relaxed text-on-surface-variant">The cover appears first on cards. Use the arrows to arrange the product gallery before saving.</p>
          <p className="text-xs leading-relaxed text-on-surface-variant">Existing external image links are supported. New uploads require the reviewed Supabase storage setup.</p>
        </aside>
      </div>
      <div className="flex flex-wrap gap-3 border-t border-outline-variant pt-5"><Button type="submit" disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{form.is_active ? (initialData ? 'Save published product' : 'Publish product') : 'Save draft'}</Button><Button type="button" variant="outline" onClick={() => router.push('/admin/products')} disabled={saving}>Cancel</Button></div>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const id = useId()
  const control = isValidElement<{ id?: string }>(children) ? cloneElement(children, { id }) : children
  return <div className="space-y-2"><Label htmlFor={id} className="text-xs uppercase tracking-[0.12em] text-on-surface-variant">{label}</Label>{control}</div>
}
function Toggle({ checked, onChange, children }: { checked: boolean; onChange: (value: boolean) => void; children: React.ReactNode }) {
  return <label className="flex cursor-pointer items-center gap-2 text-sm text-on-surface-variant"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-primary" />{children}</label>
}
