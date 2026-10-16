import {signVenusReceipt,VENUS_RECEIPT_COOKIE} from '@/lib/venus-receipt'
import { memberRequestOrigin } from '@/lib/member-origin'
import { createClient } from '@/lib/supabase/server'

export const runtime='nodejs'
const headers={'Cache-Control':'private, no-store'}
async function member() {
  const client=await createClient()
  const {data:{user},error}=await client.auth.getUser()
  return {client,user:!error && user && !user.is_anonymous && user.email_confirmed_at ? user : null}
}
export async function GET() {
  try {
    const {client,user}=await member()
    if (!user) return Response.json({user:null,ids:[]},{headers})
    const {data,error}=await client.from('member_shortlist').select('product_id').eq('user_id',user.id).order('created_at')
    if (error) return Response.json({error:'Your saved picks could not be loaded.'},{status:503,headers})
    return Response.json({user:{id:user.id,email:user.email},ids:data.map(row=>row.product_id)},{headers})
  } catch {return Response.json({error:'Membership is temporarily unavailable.'},{status:503,headers})}
}
export async function POST(request:Request) {
  if (!memberRequestOrigin(request)) return Response.json({error:'Invalid request origin.'},{status:403,headers})
  try {
    const {client,user}=await member()
    if (!user) return Response.json({error:'Join or sign in as a Vesnaian to save picks.',code:'membership_required'},{status:401,headers})
    const input=await request.json()
    if (!['add','remove','clear'].includes(input?.operation) || !Array.isArray(input.ids) || input.ids.length>200 || !input.ids.every((id:unknown)=>typeof id==='string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))) return Response.json({error:'Invalid shortlist request.'},{status:400,headers})
    const {data,error}=await client.rpc('change_member_shortlist',{operation:input.operation,pick_ids:input.ids})
    if (error) return Response.json({error:error.code==='22023' ? 'Some picks are unavailable, or your shortlist has reached 200 picks.' : 'Your shortlist could not be updated.'},{status:409,headers})
    const addedIds=data && Array.isArray(data.addedIds)?data.addedIds:[]
    const receipt=input.source==='venus'&&input.operation==='add'&&data?.userId===user.id&&data?.added===addedIds.length&&addedIds.length>0?signVenusReceipt({userId:user.id,addedIds,at:Date.now()}):null
    return Response.json(data,{headers:receipt?{...headers,'Set-Cookie':`${VENUS_RECEIPT_COOKIE}=${receipt}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=86400${process.env.NODE_ENV==='production'?'; Secure':''}`}:headers})
  } catch {return Response.json({error:'Your shortlist could not be updated.'},{status:503,headers})}
}
