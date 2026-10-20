'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Save, X } from 'lucide-react'

type PartnerType = 'vendor' | 'maker'
type PartnerStatus = 'prospect' | 'active' | 'paused' | 'archived'
interface Partner { id: string; partner_type: PartnerType; name: string; status: PartnerStatus; contact_name: string | null; contact_email: string | null; website: string | null; notes: string | null; created_at: string }
const emptyPartner = { partner_type: 'vendor' as PartnerType, name: '', status: 'prospect' as PartnerStatus, contact_name: '', contact_email: '', website: '', notes: '' }

function safeWebsite(value: string | null) {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null
  } catch { return null }
}

export default function PartnersPage() {
  const supabase = createClient()
  const [partners, setPartners] = useState<Partner[]>([])
  const [productCounts, setProductCounts] = useState<Record<string, number>>({})
  const [form, setForm] = useState(emptyPartner)
  const [editing, setEditing] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!supabase) { setError('Supabase is not configured.'); setLoading(false); return }
    setLoading(true); setError(null)
    const [{ data, error: partnerError }, { data: products, error: productsError }] = await Promise.all([
      supabase.from('catalog_partners').select('id,partner_type,name,status,contact_name,contact_email,website,notes,created_at').order('created_at', { ascending: false }),
      supabase.from('products').select('partner_id').not('partner_id', 'is', null),
    ])
    if (partnerError || productsError) {
      const message = [partnerError?.message, productsError?.message].filter(Boolean).join(' · ')
      setError(/catalog_partners|partner_id|schema cache/i.test(message) ? 'The Partners data structure is not installed yet. Apply supabase/migrations/20261019143340_admin_reporting_and_partners.sql to enable this module.' : message)
    } else {
      setPartners((data ?? []) as Partner[])
      setProductCounts((products ?? []).reduce((counts: Record<string, number>, product: { partner_id: string | null }) => { if (product.partner_id) counts[product.partner_id] = (counts[product.partner_id] ?? 0) + 1; return counts }, {}))
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => { const frame = window.requestAnimationFrame(() => { void load() }); return () => window.cancelAnimationFrame(frame) }, [load])

  function beginEdit(partner: Partner) {
    setEditing(partner.id); setForm({ partner_type: partner.partner_type, name: partner.name, status: partner.status, contact_name: partner.contact_name ?? '', contact_email: partner.contact_email ?? '', website: partner.website ?? '', notes: partner.notes ?? '' }); setShowForm(true); setNotice(null)
  }

  async function savePartner(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase) { setError('Supabase is not configured.'); return }
    if (!form.name.trim()) { setError('Add a vendor or maker name first.'); return }
    setSaving(true); setError(null); setNotice(null)
    const payload = { ...form, name: form.name.trim(), contact_name: form.contact_name.trim() || null, contact_email: form.contact_email.trim() || null, website: form.website.trim() || null, notes: form.notes.trim() || null, updated_at: new Date().toISOString() }
    const result = editing ? await supabase.from('catalog_partners').update(payload).eq('id', editing).select('id').maybeSingle() : await supabase.from('catalog_partners').insert(payload).select('id').single()
    if (result.error) setError(result.error.message)
    else if (editing && !result.data) setError('No partner record was updated. Refresh and try again.')
    else { setNotice(editing ? 'Partner details saved.' : 'Partner added.'); setShowForm(false); setEditing(null); setForm(emptyPartner); await load() }
    setSaving(false)
  }

  async function updateStatus(partner: Partner, status: PartnerStatus) {
    if (!supabase) return
    setError(null); setNotice(null)
    const { data, error: updateError } = await supabase.from('catalog_partners').update({ status, updated_at: new Date().toISOString() }).eq('id', partner.id).select('id').maybeSingle()
    if (updateError) setError(updateError.message)
    else if (!data) setError('No partner record was updated. Refresh and try again.')
    else { setNotice(`${partner.name} is now ${status}.`); await load() }
  }

  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.18em] text-ink-muted">Relationships</p><h1 className="mt-1 font-display-hero text-4xl text-ink">Partners</h1><p className="mt-2 max-w-2xl text-sm text-ink-muted">Keep track of the makers and vendors behind the collection. Vesna remains the sole administrator; partners do not get accounts or dashboard access.</p></div><Button onClick={() => { setForm(emptyPartner); setEditing(null); setShowForm(true); setNotice(null); setError(null) }}><Plus className="mr-2 h-4 w-4" />Add partner</Button></div>
    {error && <div role="alert" className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</div>}{notice && <p role="status" className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{notice}</p>}
    {showForm && <Card><CardContent className="p-4 sm:p-6"><form onSubmit={(event) => void savePartner(event)} className="space-y-5"><div className="flex items-center justify-between"><h2 className="font-display-hero text-2xl text-ink">{editing ? 'Edit partner' : 'New partner'}</h2><Button type="button" variant="ghost" size="icon" aria-label="Close form" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button></div><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="partner-type">Relationship</Label><select id="partner-type" value={form.partner_type} onChange={(event) => setForm({ ...form, partner_type: event.target.value as PartnerType })} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="vendor">Vendor</option><option value="maker">Maker</option></select></div><div className="space-y-2"><Label htmlFor="partner-name">Name</Label><Input id="partner-name" required maxLength={160} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Studio or company name" /></div><div className="space-y-2"><Label htmlFor="partner-status">Status</Label><select id="partner-status" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as PartnerStatus })} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">{['prospect', 'active', 'paused', 'archived'].map((status) => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}</select></div><div className="space-y-2"><Label htmlFor="partner-contact">Contact name</Label><Input id="partner-contact" value={form.contact_name} onChange={(event) => setForm({ ...form, contact_name: event.target.value })} /></div><div className="space-y-2"><Label htmlFor="partner-email">Contact email</Label><Input id="partner-email" type="email" value={form.contact_email} onChange={(event) => setForm({ ...form, contact_email: event.target.value })} /></div><div className="space-y-2"><Label htmlFor="partner-website">Website</Label><Input id="partner-website" type="url" value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} placeholder="https://" /></div></div><div className="space-y-2"><Label htmlFor="partner-notes">Curator notes</Label><Textarea id="partner-notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} rows={3} placeholder="Internal context for the curator" /></div><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button><Button disabled={saving}>{saving ? 'Saving…' : <><Save className="mr-2 h-4 w-4" />Save partner</>}</Button></div></form></CardContent></Card>}
    {loading ? <p className="py-10 text-center text-sm text-on-surface-variant">Loading partner records…</p> : partners.length ? <div className="grid gap-4 lg:grid-cols-2">{partners.map((partner) => { const website = safeWebsite(partner.website); return <Card key={partner.id}><CardContent className="space-y-4 p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="break-words font-medium text-on-background">{partner.name}</h2><span className="rounded-full bg-surface-container px-2 py-0.5 text-xs capitalize text-on-surface-variant">{partner.partner_type}</span></div><p className="mt-1 text-sm capitalize text-on-surface-variant">{partner.status} · {productCounts[partner.id] ?? 0} linked {productCounts[partner.id] === 1 ? 'pick' : 'picks'}</p></div><Button variant="outline" size="sm" onClick={() => beginEdit(partner)}>Edit</Button></div>{(partner.contact_name || partner.contact_email || website) && <div className="space-y-1 text-sm text-on-surface-variant">{partner.contact_name && <p>{partner.contact_name}</p>}{partner.contact_email && <a className="block break-all underline underline-offset-2" href={`mailto:${partner.contact_email}`}>{partner.contact_email}</a>}{website && <a className="block break-all underline underline-offset-2" href={website} target="_blank" rel="noreferrer">{website}</a>}</div>}{partner.notes && <p className="whitespace-pre-wrap border-t border-outline-variant pt-3 text-sm text-on-surface-variant">{partner.notes}</p>}<div className="flex flex-wrap gap-2 border-t border-outline-variant pt-3">{partner.status !== 'active' && <Button variant="outline" size="sm" onClick={() => void updateStatus(partner, 'active')}>Mark active</Button>}{partner.status !== 'paused' && partner.status !== 'archived' && <Button variant="outline" size="sm" onClick={() => void updateStatus(partner, 'paused')}>Pause</Button>}{partner.status !== 'archived' && <Button variant="ghost" size="sm" onClick={() => void updateStatus(partner, 'archived')}>Archive</Button>}</div></CardContent></Card> })}</div> : !error && <Card><CardContent className="py-14 text-center"><p className="font-medium text-on-background">No partners recorded yet.</p><p className="mt-1 text-sm text-on-surface-variant">Add the makers and vendors represented in the collection.</p></CardContent></Card>}
  </div>
}
