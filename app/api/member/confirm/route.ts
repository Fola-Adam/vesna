import { createClient } from '@/lib/supabase/server'
export async function POST(request:Request) {
  if(request.headers.get('origin')!==new URL(request.url).origin) return Response.json({error:'Invalid request origin.'},{status:403})
  try {
    const {token}=await request.json()
    if(typeof token!=='string' || !/^[a-zA-Z0-9_-]{20,256}$/.test(token)) return Response.json({error:'This sign-in link is invalid.'},{status:400})
    const client=await createClient();const {error}=await client.auth.verifyOtp({token_hash:token,type:'email'})
    if(error) return Response.json({error:'This link has expired or was already used. Request a fresh sign-in link.'},{status:400})
    return Response.json({ok:true},{headers:{'Cache-Control':'private, no-store'}})
  } catch {return Response.json({error:'Could not complete sign-in. Please try again.'},{status:503})}
}
