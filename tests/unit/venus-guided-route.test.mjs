import {test,after} from 'node:test'
import assert from 'node:assert/strict'
import {mkdtempSync,readFileSync,writeFileSync,rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {createRequire} from 'node:module'
import ts from 'typescript'
const require=createRequire(import.meta.url),Module=require('module')
const dir=mkdtempSync(join(tmpdir(),'vesna-guided-'))
for(const name of ['pricing','catalog-collections','venus-actions','venus-task','venus-discovery','venus-receipt','venus-catalog','venus-readings'])writeFileSync(join(dir,name+'.js'),ts.transpileModule(readFileSync(new URL('../../lib/'+name+'.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2021,esModuleInterop:true}}).outputText)
writeFileSync(join(dir,'route.js'),ts.transpileModule(readFileSync(new URL('../../app/api/venus/route.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2021,esModuleInterop:true}}).outputText)
let replies=[],reads=0,detailReads=0,failSearch=false,ip=0,memberUser=null,memberSavedIds=[],lastSearch=null,searchResponses=[]
const product={id:'11111111-1111-4111-8111-111111111111',slug:'coffee-dripper',name:'Coffee dripper',description:'A ceramic dripper for brewing coffee.',price:40,sale_price:null,item_type:'shop',is_featured:false,categories:{name:'Home'}}
const oldLoad=Module._load
Module._load=function(id,parent,main){
 if(id==='groq-sdk')return {Groq:class {chat={completions:{create:async()=>{const reply=replies.shift();if(reply instanceof Error)throw reply;assert.ok(reply,'unexpected model call');return {choices:[{finish_reason:'stop',message:{content:JSON.stringify(reply)}}]}}}}}}
 if(id==='@/lib/data')return {searchVenusCatalog:async(input)=>{lastSearch=input;reads++;if(failSearch)throw new Error('Database unavailable');return searchResponses.length?searchResponses.shift():[product]},readVenusDetails:async()=>{detailReads++;return [product]}}
 if(id==='@/lib/supabase/server')return {createClient:async()=>({auth:{getUser:async()=>({data:{user:memberUser}})},from:()=>{const filters={};const builder={select(){return this},eq(k,v){filters[k]=v;return this},limit(){return this},abortSignal(){return this},maybeSingle:async()=>({data:memberSavedIds.includes(filters.product_id)?{product_id:filters.product_id}:null,error:null}),then(resolve){return Promise.resolve({data:memberSavedIds.map(product_id=>({product_id})),error:null}).then(resolve)}};return builder}})}
 if(id==='@/lib/venus-readings')return {selectVenusReadings:()=>[]}
 if(id==='@/lib/journal-server')return {readPublishedStories:async()=>[]}
 if(id.startsWith('@/lib/'))return require(join(dir,id.slice(6)+'.js'))
 return oldLoad.call(this,id,parent,main)
}
const {POST}=require(join(dir,'route.js'))
const {mergeDiscovery}=require(join(dir,'venus-discovery.js'))
process.env.GROQ_API_KEY='unit-test-placeholder'
after(()=>{Module._load=oldLoad;rmSync(dir,{recursive:true,force:true})})
async function request(message,task,productSlug,cookie){const response=await POST(new Request('https://preview.example/api/venus',{method:'POST',headers:{'Content-Type':'application/json','x-forwarded-for':String(++ip),...(cookie?{cookie}:{})},body:JSON.stringify({message,task,productSlug,history:[{role:'assistant',content:'Would you like me to save Coffee dripper?'}]})}));return (await response.text()).trim().split('\n').map(JSON.parse)}
const plan=(intent,patch={},question=null)=>({intent,patch,question,queryTerms:['coffee'],boostTags:[],excludedTags:[],reset:false})
test('vague gift clarifies without a single catalog/detail read; pending yes cannot save',async()=>{
 replies=[plan('clarify',{},'Who is it for, and what do they enjoy?')];reads=detailReads=0
 const first=await request('Find a good gift under 500 dollars');assert.equal(reads,0);assert.equal(detailReads,0);assert.ok(first.some(e=>e.type==='text'&&e.text.includes('Who')))
 const task=first.filter(e=>e.type==='task').at(-1).task;assert.equal(task.discovery.budget.amount,500)
 replies=[plan('clarify',{},'Who will receive the gift?')]
 const yes=await request('yes',task);assert.equal(yes.some(e=>e.type==='action'),false);assert.equal(reads,0)
})

test('a no-match reply clears stale IDs and explanation never calls planner again',async()=>{
 const task={brief:'Coffee gift',refinements:[],selectionIds:[product.id],updatedAt:Date.now(),discovery:{...mergeDiscovery(null,{interests:['coffee']},null),proposal:'offered'}}
 replies=[plan('search'),{label:'None',message:'The entire catalog contains no coffee products.',products:[]},{label:'None',products:[]}]
 const result=await request('Under $10 total',task)
 const next=result.filter(e=>e.type==='task').at(-1).task
 assert.deepEqual(next.selectionIds,[])
 assert.equal(result.some(e=>e.type==='text'&&e.text.includes('entire catalog')),false)
 replies=[]
 const explanation=await request('Explain why each selected pick fits. Don’t change the selection',next)
 assert.ok(explanation.some(e=>e.type==='text'&&e.text.includes('no current selection')))
 assert.equal(explanation.some(e=>e.type==='error'),false)
})

test('malformed planner output is retried once and cannot silently reset the retained brief',async()=>{
 const task={brief:'Coffee gift for Dad',refinements:[],selectionIds:[],updatedAt:Date.now(),discovery:mergeDiscovery(null,{recipient:'Dad',interests:['coffee']},null)}
 replies=[{intent:'invalid'}, {...plan('search'),reset:true},{label:'Coffee',products:[{slug:product.slug}]}]
 const result=await request('Under $100 total',task)
 const next=result.filter(e=>e.type==='task').at(-1).task
 assert.equal(next.discovery.recipient,'Dad');assert.deepEqual(next.discovery.interests,['coffee'])
 assert.equal(next.discovery.budget.amount,100)
 assert.ok(result.some(e=>e.type==='selection'&&e.selection.products.length===1))
})

test('generated duration claims cannot leak into recommendation cards',async()=>{
 replies=[plan('search'),{label:'Coffee',products:[{slug:product.slug,reason:'Keeps coffee hot for 48 hours and cures fatigue.'}]}]
 const result=await request('Find coffee equipment under $100')
 const selected=result.find(e=>e.type==='selection').selection.products[0]
 assert.equal(selected.rationale,undefined);assert.equal(selected.evidence,product.description)
 assert.equal(JSON.stringify(result).includes('48 hours'),false)
})
test('recorded suitability is capped to the stream rationale limit',async()=>{
 const previous=product.best_for;product.best_for='Recorded suitability. '.repeat(30)
 replies=[plan('search'),{label:'Coffee',products:[{slug:product.slug}]}]
 const result=await request('Find coffee equipment under $100')
 const selected=result.find(e=>e.type==='selection').selection.products[0]
 assert.equal(selected.rationale.length,400)
 product.best_for=previous
})
test('an empty planner search retries with meaningful words from the shopper request',async()=>{
 const previous={...product};Object.assign(product,{slug:'smart-plant-pot',name:'Smart Plant Pot',description:'Self-watering with moisture sensors and app integration.',best_for:'A helpful addition for a small home garden.'})
 searchResponses=[[],[{...product,price:95}]];reads=0
 replies=[plan('search'),{label:'Garden pick',products:[{slug:product.slug}]}]
 const result=await request('Find gardening tools under $100')
 const selection=result.find(e=>e.type==='selection').selection
 assert.equal(reads,2);assert.ok(lastSearch.queryTerms.includes('gardening'));assert.ok(lastSearch.queryTerms.includes('tools'))
 assert.equal(selection.products[0].slug,'smart-plant-pot')
 Object.assign(product,previous)
})
test('short clarification answer retains cap and yields inspected selection and exact confirmation',async()=>{
 const task={brief:'Find a gift under $500',refinements:[],selectionIds:[],updatedAt:Date.now(),discovery:mergeDiscovery(null,{purpose:'gift',budget:{amount:500,currency:'USD',mode:'per-item'}},'Who is it for?')}
 replies=[plan('search',{recipient:'Dad',interests:['coffee']}),{label:'Coffee gift',products:[{slug:'coffee-dripper',reason:'For his coffee brewing.'}]}]
 const result=await request('Dad loves coffee',task);assert.ok(result.some(e=>e.type==='selection'&&e.selection.products.length===1))
 const next=result.filter(e=>e.type==='task').at(-1).task;assert.equal(next.discovery.budget.amount,500)
 const confirmation=await request('yes pls',next);assert.equal(confirmation.find(e=>e.type==='action').action.products[0].id,product.id)
})
test('failed refinement invalidates previous offer and old prose cannot restore it',async()=>{
 const task={brief:'coffee',refinements:[],selectionIds:[product.id],updatedAt:Date.now(),discovery:{...mergeDiscovery(null,{interests:['coffee']},null),proposal:'offered'}}
 replies=[plan('search')];failSearch=true
 const failure=await request('Make it cheaper',task);failSearch=false
 const invalid=failure.filter(e=>e.type==='task').at(-1).task;assert.equal(invalid.discovery.proposal,'invalidated');assert.ok(failure.some(e=>e.type==='error'))
 replies=[plan('direct')]
 const yes=await request('yes',invalid);assert.equal(yes.some(e=>e.type==='action'),false)
})

test('yes answering total-budget question continues search instead of saving',async()=>{
 const task={brief:'Coffee kit under $100',refinements:[],selectionIds:[product.id],updatedAt:Date.now(),discovery:mergeDiscovery(null,{purpose:'coffee kit',budget:{amount:100,currency:'USD',mode:'per-item'}},'Is $100 your total budget?')}
 replies=[plan('search',{budget:{amount:100,currency:'USD',mode:'total'}}),{label:'Coffee set',products:[{slug:product.slug}]}]
 const result=await request('yes',task)
 assert.equal(result.some(e=>e.type==='action'),false);assert.ok(result.some(e=>e.type==='selection'))
})
test('open and clear shortlist need no product retrieval',async()=>{
 for(const message of ['open my shortlist','clear my shortlist']){
  replies=[{...plan('direct'),queryTerms:[]}];reads=detailReads=0
  const result=await request(message)
  assert.ok(result.some(e=>e.type==='action'));assert.equal(reads,0);assert.equal(detailReads,0)
 }
})
test('page context does not override explicit named product requests',async()=>{
 replies=[plan('direct')];reads=0
 const result=await request('save Coffee dripper',undefined,'unrelated-page-pick')
 assert.equal(reads,1);assert.ok(result.some(e=>e.type==='action'&&e.action.id===product.id))
})
test('please do cannot restore an old prose offer',async()=>{
 replies=[plan('direct')]
 assert.equal((await request('please do')).some(e=>e.type==='action'),false)
})

test('misclassified pending affirmation cannot fall into legacy prose confirmation',async()=>{
 const task={brief:'Coffee gift',refinements:[],selectionIds:[product.id],updatedAt:Date.now(),discovery:mergeDiscovery(null,{interests:['coffee']},'Who is the gift for?')}
 replies=[plan('direct')]
 assert.equal((await request('yes',task)).some(e=>e.type==='action'),false)
})

test('explicit named comparison searches rather than comparing prior selection',async()=>{
 const task={brief:'Earlier options',refinements:[],selectionIds:[product.id, '22222222-2222-4222-8222-222222222222'],updatedAt:Date.now(),discovery:mergeDiscovery(null,{},null)}
 replies=[{...plan('compare'),queryTerms:['Sony WH-1000XM6','Sonos Era 100']}];reads=0
 await request('Compare Sony WH-1000XM6 and Sonos Era 100',task)
 assert.equal(reads,1)
})

test('already cancelled request cannot search or emit an action',async()=>{
 reads=0;replies=[]
 const result=await POST(new Request('https://preview.example/api/venus',{method:'POST',headers:{'Content-Type':'application/json','x-forwarded-for':String(++ip)},body:JSON.stringify({message:'Find coffee'}),signal:AbortSignal.abort()}))
 const events=(await result.text()).trim().split('\n').map(JSON.parse)
 assert.equal(reads,0);assert.equal(events.some(e=>e.type==='action'),false);assert.ok(events.some(e=>e.type==='error'))
})

test('transcript: explanation stays bound to the offered set and yes please saves that exact set',async()=>{
 const task={brief:'Coffee gift',refinements:[],selectionIds:[product.id],updatedAt:Date.now(),discovery:{...mergeDiscovery(null,{interests:['coffee'],budget:{amount:100,currency:'USD',mode:'total'}},null),proposal:'offered'}}
 replies=[];reads=0
 const explained=await request('Explain why each option fits, and tell me anything you’re unsure about.',task)
 assert.equal(reads,0);assert.equal(explained.some(e=>e.type==='error'),false)
 const current=explained.filter(e=>e.type==='task').at(-1).task
 assert.equal(current.discovery.proposal,'offered');assert.deepEqual(current.selectionIds,[product.id])
 const text=explained.filter(e=>e.type==='text').map(e=>e.text).join(' ')
 assert.equal(text.includes('Ember'),false);assert.equal(text.includes('health-boosting'),false)
 const saved=await request('Yes please, save those picks',current)
 assert.deepEqual(saved.find(e=>e.type==='action').action.products.map(p=>p.id),[product.id])
 const wrongCount=await request('save those two',current)
 assert.equal(wrongCount.some(e=>e.type==='action'),false)
})
test('budget refinement preserves coffee focus and no-subscription lexical exclusion',async()=>{
 const task={brief:'Gift for coffee-loving Dad',refinements:[],selectionIds:[],updatedAt:Date.now(),discovery:mergeDiscovery(null,{interests:['coffee']},null)}
 replies=[plan('search',{interests:[],exclusions:['No subscriptions']}),{label:'Coffee gift',products:[{slug:product.slug}]}]
 await request('Make it under $100 total. No subscriptions.',task)
 assert.ok(lastSearch.focusTerms.includes('coffee'));assert.ok(lastSearch.excludedTerms.includes('subscriptions'))
})
test('last-added removal requires a signed receipt AND currently saved membership row',async()=>{
 const {signVenusReceipt}=require(join(dir,'venus-receipt.js'))
 const key='unit-fixture-key';const previousKey=process.env.VENUS_RECEIPT_SECRET;process.env.VENUS_RECEIPT_SECRET=key
 memberUser={id:'33333333-3333-4333-8333-333333333333',email_confirmed_at:new Date().toISOString(),is_anonymous:false}
 memberSavedIds=[product.id]
 try{
  const noReceipt=await request('remove the last pik you added to my shortlist')
  assert.equal(noReceipt.some(e=>e.type==='action'),false)
  const token=signVenusReceipt({userId:memberUser.id,addedIds:[product.id],at:Date.now()},key)
  const removed=await request('Actually, remove the last pick you added',undefined,undefined,'vesna_venus_last_add='+token)
  assert.equal(removed.find(e=>e.type==='action').action.id,product.id)
  memberSavedIds=[]
  const alreadyRemoved=await request('remove the last pick you added',undefined,undefined,'vesna_venus_last_add='+token)
  assert.equal(alreadyRemoved.some(e=>e.type==='action'),false)
 } finally {memberUser=null;memberSavedIds=[];if(previousKey===undefined)delete process.env.VENUS_RECEIPT_SECRET;else process.env.VENUS_RECEIPT_SECRET=previousKey}
})
