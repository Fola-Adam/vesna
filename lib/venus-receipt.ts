import {createHmac,timingSafeEqual} from 'node:crypto'
export const VENUS_RECEIPT_COOKIE='vesna_venus_last_add'
export type VenusSaveReceipt={userId:string;addedIds:string[];at:number}
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
function key(){return process.env.VENUS_RECEIPT_SECRET||process.env.SUPABASE_SERVICE_ROLE_KEY}
function valid(value:unknown):value is VenusSaveReceipt {if(!value||typeof value!=='object')return false;const v=value as VenusSaveReceipt;return typeof v.userId==='string'&&uuid.test(v.userId)&&Array.isArray(v.addedIds)&&v.addedIds.length>0&&v.addedIds.length<=20&&v.addedIds.every(id=>typeof id==='string'&&uuid.test(id))&&new Set(v.addedIds).size===v.addedIds.length&&Number.isFinite(v.at)}
export function signVenusReceipt(value:VenusSaveReceipt,secret=key()):string|null {
 if(!secret||!valid(value))return null
 const payload=Buffer.from(JSON.stringify(value)).toString('base64url')
 return payload+'.'+createHmac('sha256',secret).update('vesna-venus-save-v1:'+payload).digest('base64url')
}
export function verifyVenusReceipt(token:string,userId:string,secret=key(),now=Date.now()):VenusSaveReceipt|null {
 if(!secret||typeof token!=='string'||token.length>4000)return null
 const parts=token.split('.');if(parts.length!==2)return null
 const expected=createHmac('sha256',secret).update('vesna-venus-save-v1:'+parts[0]).digest()
 const signature=Buffer.from(parts[1],'base64url');if(signature.length!==expected.length||!timingSafeEqual(signature,expected))return null
 try{const value:unknown=JSON.parse(Buffer.from(parts[0],'base64url').toString('utf8'));return valid(value)&&value.userId===userId&&value.at<=now+60000&&now-value.at<=86400000?value:null}catch{return null}
}
export function readVenusReceipt(request:Request,userId:string):VenusSaveReceipt|null {
 const value=request.headers.get('cookie')?.split(';').map(part=>part.trim()).find(part=>part.startsWith(VENUS_RECEIPT_COOKIE+'='))?.slice(VENUS_RECEIPT_COOKIE.length+1)
 return value?verifyVenusReceipt(value,userId):null
}
