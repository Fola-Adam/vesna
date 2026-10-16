'use client'
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
type Member={id:string;email?:string}
type State={user:Member|null;ids:string[];loading:boolean;error:string}
type Membership=State & {busy:boolean;canUndo:boolean;requireMember:()=>boolean;refresh:()=>Promise<void>;add:(id:string,source?:'venus')=>Promise<boolean>;addMany:(ids:string[],source?:'venus')=>Promise<{success:boolean;added:number}>;remove:(id:string)=>Promise<boolean>;clear:()=>Promise<boolean>;undo:()=>Promise<boolean>;toggle:(id:string)=>Promise<boolean>;signOut:()=>Promise<boolean>}
const Context=createContext<Membership|null>(null)
export function useMembership() {const value=useContext(Context);if(!value) throw new Error('Membership provider is missing');return value}
export default function MemberProvider({children}:{children:React.ReactNode}) {
  const [state,setState]=useState<State>({user:null,ids:[],loading:true,error:''})
  const stateRef=useRef(state)
  const [busy,setBusy]=useState(false)
  const busyRef=useRef(false)
  const undoRef=useRef<{userId:string;ids:string[]}|null>(null)
  const [canUndo,setCanUndo]=useState(false)
  const [gate,setGate]=useState(false)
  const generation=useRef(0)
  const refresh=useCallback(async()=>{
    const version=++generation.current
    try {
      const response=await fetch('/api/member/shortlist',{cache:'no-store'});const data=await response.json()
      if(!response.ok) throw new Error(data.error || 'Membership is unavailable.')
      if(version!==generation.current) return
      const next:State={user:data.user ?? null,ids:Array.isArray(data.ids) ? data.ids : [],loading:false,error:''}
      if(stateRef.current.user?.id!==next.user?.id) {undoRef.current=null;setCanUndo(false)}
      stateRef.current=next;setState(next)
    } catch(failure) {
      if(version!==generation.current) return
      const next:State={user:null,ids:[],loading:false,error:failure instanceof Error ? failure.message : 'Membership is unavailable.'}
      stateRef.current=next;setState(next)
    }
  },[])
  useEffect(()=>{
    const requests=generation
    void Promise.resolve().then(refresh);const client=createClient()
    const listener=client?.auth.onAuthStateChange(()=>{void Promise.resolve().then(refresh)})
    const onFocus=()=>void refresh();window.addEventListener('focus',onFocus)
    return()=>{requests.current++;listener?.data.subscription.unsubscribe();window.removeEventListener('focus',onFocus)}
  },[refresh])
  function requireMember() {if(stateRef.current.user) return true;setGate(true);return false}
  async function mutate(operation:'add'|'remove'|'clear',ids:string[],source?:'venus') {
    if(!requireMember() || busyRef.current) return null
    busyRef.current=true;setBusy(true)
    const userId=stateRef.current.user!.id
    try {
      const response=await fetch('/api/member/shortlist',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({operation,ids,source})});const data=await response.json()
      if(!response.ok) {if(response.status===401){void refresh();setGate(true)} throw new Error(data.error || 'Could not update your shortlist.')}
      if(data.userId!==userId || stateRef.current.user?.id!==userId || !Array.isArray(data.ids)) throw new Error('Your account changed. Reload your saved picks.')
      if(operation==='add' && ids.some(id=>!data.ids.includes(id)) || operation==='remove' && ids.some(id=>data.ids.includes(id)) || operation==='clear' && data.ids.length) throw new Error('The shortlist receipt could not be verified.')
      generation.current++;const next={...stateRef.current,ids:data.ids as string[],error:''};stateRef.current=next;setState(next)
      if(operation!=='add') {undoRef.current={userId,ids:Array.isArray(data.removedIds) ? data.removedIds : []};setCanUndo(!!undoRef.current.ids.length)}
      return {added:Number.isSafeInteger(data.added) ? data.added : 0}
    } catch(failure) {
      const next={...stateRef.current,error:failure instanceof Error ? failure.message : 'Could not update your shortlist.'};stateRef.current=next;setState(next);return null
    } finally {busyRef.current=false;setBusy(false)}
  }
  async function addMany(ids:string[],source?:'venus') {const result=await mutate('add',ids,source);return {success:!!result,added:result?.added ?? 0}}
  async function undo() {
    const pending=undoRef.current;if(!pending || pending.userId!==stateRef.current.user?.id) return false
    const result=await mutate('add',pending.ids);if(result){undoRef.current=null;setCanUndo(false)}return !!result
  }
  async function signOut() {
    if(busyRef.current) return false
    const client=createClient();if(!client) return false
    const {error}=await client.auth.signOut();if(error) return false
    generation.current++;undoRef.current=null;setCanUndo(false)
    const next:State={user:null,ids:[],loading:false,error:''};stateRef.current=next;setState(next);return true
  }
  return <Context.Provider value={{...state,busy,canUndo,refresh,requireMember,add:async (id,source)=>!!await mutate('add',[id],source),addMany,remove:async id=>!!await mutate('remove',[id]),clear:async()=>!!await mutate('clear',[]),undo,toggle:async id=>!!await mutate(stateRef.current.ids.includes(id) ? 'remove' : 'add',[id]),signOut}}>
    {children}
    <Dialog open={gate} onOpenChange={setGate}><DialogContent className="bg-paper-raised text-ink"><DialogHeader><DialogTitle className="font-display-hero text-3xl">A place for your considered picks.</DialogTitle><DialogDescription className="pt-3 text-sm leading-7 text-ink-muted">Join or sign in as a Vesnaian to keep a private shortlist and return to it across devices. Browsing and asking Venus are open to everyone.</DialogDescription></DialogHeader><Link href={typeof window!=='undefined' ? '/member?next='+encodeURIComponent(window.location.pathname+window.location.search) : '/member?next=%2Fshortlist'} onClick={()=>setGate(false)} className="mt-3 inline-flex min-h-12 items-center justify-center rounded-full bg-primary-ink px-6 text-sm font-medium text-paper focus-ring">Join or sign in</Link>{state.error && <p role="status" className="text-sm text-ink-muted">{state.error}</p>}</DialogContent></Dialog>
  </Context.Provider>
}
