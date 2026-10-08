'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2, Plus, X } from 'lucide-react'

interface Category {
  id: string
  name: string
}

interface ProductFormData {
  name: string
  slug: string
  description: string | null
  price: string
  sale_price: string
  affiliate_link: string | null
  category_id: string | null
  image_urls: string[]
  why_victory: string | null
  item_type: 'curated' | 'shop' | 'archive'
  is_featured: boolean
  is_active: boolean
}

interface ProductFormProps {
  categories: Category[]
  initialData?: ProductFormData & { id: string }
}

const ITEM_TYPES = [
  { value: 'curated', label: 'Curated' },
  { value: 'shop', label: 'Shop' },
  { value: 'archive', label: 'Archive' },
] as const

function toSlug(str: string) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export default function ProductForm({ categories, initialData }: ProductFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [manualSlug, setManualSlug] = useState(!!initialData)

  const [form, setForm] = useState<ProductFormData>({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || null,
    price: initialData?.price || '',
    sale_price: initialData?.sale_price || '',
    affiliate_link: initialData?.affiliate_link || null,
    category_id: initialData?.category_id || null,
    image_urls: initialData?.image_urls || [],
    why_victory: initialData?.why_victory || null,
    item_type: initialData?.item_type || 'shop',
    is_featured: initialData?.is_featured || false,
    is_active: initialData?.is_active ?? true,
  })

  function updateField<K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'name' && !manualSlug) {
        next.slug = toSlug(value as string)
      }
      return next
    })
  }

  function addImageUrl() {
    setForm((prev) => ({ ...prev, image_urls: [...prev.image_urls, ''] }))
  }

  function updateImageUrl(index: number, value: string) {
    setForm((prev) => {
      const urls = [...prev.image_urls]
      urls[index] = value
      return { ...prev, image_urls: urls }
    })
  }

  function removeImageUrl(index: number) {
    setForm((prev) => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    if (!supabase) {
      setError?.('Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_* env vars).')
      return
    }
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description || null,
      price: form.price ? parseFloat(form.price) : null,
      sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
      affiliate_link: form.affiliate_link || null,
      category_id: form.category_id || null,
      image_urls: form.image_urls.filter(Boolean),
      why_victory: form.why_victory || null,
      item_type: form.item_type,
      is_featured: form.is_featured,
      is_active: form.is_active,
    }

    if (initialData) {
      const { error: updateError } = await supabase
        .from('products')
        .update(payload)
        .eq('id', initialData.id)

      if (updateError) {
        setError(updateError.message)
        setSaving(false)
        return
      }
    } else {
      const { error: insertError } = await supabase
        .from('products')
        .insert(payload)

      if (insertError) {
        setError(insertError.message)
        setSaving(false)
        return
      }
    }

    router.push('/admin/products')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      {error && (
        <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="font-section-header text-[10px] tracking-[0.15em] text-on-surface-variant">
            Product Name
          </Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="e.g. Heritage Silk Scarf"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug" className="font-section-header text-[10px] tracking-[0.15em] text-on-surface-variant">
            Slug
          </Label>
          <div className="flex gap-2">
            <Input
              id="slug"
              value={form.slug}
              onChange={(e) => {
                setManualSlug(true)
                updateField('slug', e.target.value)
              }}
              placeholder="heritage-silk-scarf"
              required
              className="font-mono text-xs"
            />
            {!manualSlug && (
              <span className="font-section-header text-[10px] text-on-surface-variant self-center shrink-0">
                Auto
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="font-section-header text-[10px] tracking-[0.15em] text-on-surface-variant">
          Description
        </Label>
        <Textarea
          id="description"
          value={form.description || ''}
          onChange={(e) => updateField('description', e.target.value || null)}
          placeholder="Product description..."
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="price" className="font-section-header text-[10px] tracking-[0.15em] text-on-surface-variant">
            Price ($)
          </Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => updateField('price', e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sale_price" className="font-section-header text-[10px] tracking-[0.15em] text-on-surface-variant">
            Sale Price ($)
          </Label>
          <Input
            id="sale_price"
            type="number"
            step="0.01"
            min="0"
            value={form.sale_price}
            onChange={(e) => updateField('sale_price', e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="item_type" className="font-section-header text-[10px] tracking-[0.15em] text-on-surface-variant">
            Item Type
          </Label>
          <select
            id="item_type"
            value={form.item_type}
            onChange={(e) => updateField('item_type', e.target.value as ProductFormData['item_type'])}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-on-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {ITEM_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="category" className="font-section-header text-[10px] tracking-[0.15em] text-on-surface-variant">
            Category
          </Label>
          <select
            id="category"
            value={form.category_id || ''}
            onChange={(e) => updateField('category_id', e.target.value || null)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-on-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">No category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="affiliate_link" className="font-section-header text-[10px] tracking-[0.15em] text-on-surface-variant">
            Affiliate Link
          </Label>
          <Input
            id="affiliate_link"
            value={form.affiliate_link || ''}
            onChange={(e) => updateField('affiliate_link', e.target.value || null)}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="font-section-header text-[10px] tracking-[0.15em] text-on-surface-variant">
            Image URLs
          </Label>
          <Button type="button" variant="outline" size="sm" onClick={addImageUrl}>
            <Plus className="w-3 h-3 mr-1" />
            Add Image
          </Button>
        </div>
        {form.image_urls.map((url, i) => (
          <div key={i} className="flex gap-2">
            <Input
              value={url}
              onChange={(e) => updateImageUrl(i, e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="font-mono text-xs flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeImageUrl(i)}
              className="shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
        {form.image_urls.length === 0 && (
          <p className="text-xs text-on-surface-variant">No images added yet.</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="why_victory" className="font-section-header text-[10px] tracking-[0.15em] text-on-surface-variant">
          Why Victory? (Personal Endorsement)
        </Label>
        <Textarea
          id="why_victory"
          value={form.why_victory || ''}
          onChange={(e) => updateField('why_victory', e.target.value || null)}
          placeholder="Why Victory personally recommends this item..."
          rows={3}
        />
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_featured}
            onChange={(e) => updateField('is_featured', e.target.checked)}
            className="w-4 h-4 rounded border-outline-variant bg-surface-container text-primary focus:ring-primary"
          />
          <span className="font-section-header text-[10px] tracking-[0.15em] text-on-surface-variant">Featured</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => updateField('is_active', e.target.checked)}
            className="w-4 h-4 rounded border-outline-variant bg-surface-container text-primary focus:ring-primary"
          />
          <span className="font-section-header text-[10px] tracking-[0.15em] text-on-surface-variant">Active</span>
        </label>
      </div>

      <div className="flex gap-4 pt-4 border-t border-outline-variant">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {initialData ? 'Update Product' : 'Create Product'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/products')}
          disabled={saving}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
