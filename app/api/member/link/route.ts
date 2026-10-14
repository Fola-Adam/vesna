import { memberRequestOrigin } from '@/lib/member-origin'
import { createServiceClient } from '@/lib/supabase/service'
import { sendMemberLink } from '@/lib/member-email'
export const runtime='nodejs'
const hits=new Map<string,number[]>()
function limited(key:string,limit:number,windowMs:number) {
  const now=Date.now();const recent=(hits.get(key) ?? []).filter(time=>now-time<windowMs)
  if(recent.length>=limit) return true
  hits.set(key,[...recent,now]);if(hits.size>5000) for(const [id,times] of hits) if(times.every(time=>now-time>3600000)) hits.delete(id)
  return false
}
export async function POST(request:Request) {
  const origin=memberRequestOrigin(request)
  if(!origin) return Response.json({error:'Invalid request origin.'},{status:403})
  const ip=request.headers.get('x-nf-client-connection-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if(limited('ip:'+ip,4,900000) || limited('global',100,3600000)) return Response.json({error:'Please wait before requesting another sign-in link.'},{status:429})
  try {
    const body=await request.json();if(body?.website) return Response.json({ok:true},{headers:{'Cache-Control':'no-store'}})
    const email=typeof body?.email==='string' ? body.email.trim().toLowerCase() : ''
    if(email.length>254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({error:'Enter a valid email address.'},{status:400})
    if(limited('email:'+email,1,60000)) return Response.json({error:'Check your inbox, or wait a minute before requesting a new link.'},{status:429})
    const client=createServiceClient()
    if(!client || !process.env.BREVO_API_KEY) return Response.json({error:'Member sign-in is temporarily unavailable.'},{status:503})
    const {data,error}=await client.auth.admin.generateLink({type:'magiclink',email})
    if(error || !data.properties?.hashed_token) throw new Error('Member link generation failed')
    const url=new URL('/member/confirm',origin);const next=typeof body.next==='string' && /^\/(?:shortlist|picks|shop\/[a-z0-9-]+)(?:\?[^#]*)?$/.test(body.next) ? body.next : '/shortlist';url.hash=new URLSearchParams({token_hash:data.properties.hashed_token,next}).toString()
    await sendMemberLink(email,url.toString())
    return Response.json({ok:true},{headers:{'Cache-Control':'no-store'}})
  } catch {console.error('[member] Sign-in link could not be sent');return Response.json({error:'Could not send your sign-in link. Please try again shortly.'},{status:503})}
}
