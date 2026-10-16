import {test,after} from 'node:test'
import assert from 'node:assert/strict'
import {mkdtempSync,readFileSync,writeFileSync,rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {createRequire} from 'node:module'
import ts from 'typescript'
const directory=mkdtempSync(join(tmpdir(),'vesna-discovery-'))
writeFileSync(join(directory,'discovery.js'),ts.transpileModule(readFileSync(new URL('../../lib/venus-discovery.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2021}}).outputText)
const {readDiscovery,mergeDiscovery,readDiscoveryPlan,isOfferConfirmation}=createRequire(import.meta.url)(join(directory,'discovery.js'))
after(()=>rmSync(directory,{recursive:true,force:true}))
test('short answers preserve recipient purpose and budget while invalidating prior offers',()=>{
 const initial=mergeDiscovery(null,{purpose:'gift',budget:{amount:500,currency:'USD',mode:'per-item'}},'Who is it for?')
 const next=mergeDiscovery({...initial,proposal:'offered'},{recipient:'Dad',interests:['coffee']},null)
 assert.equal(next.purpose,'gift');assert.equal(next.budget.amount,500);assert.equal(next.recipient,'Dad');assert.equal(next.proposal,'invalidated')
 assert.equal(isOfferConfirmation('yes',initial),false)
 assert.equal(isOfferConfirmation('yes pls',{...next,proposal:'offered'}),true)
})
test('planner rejects malformed budgets and excessive terms rather than guessing',()=>{
 assert.equal(readDiscoveryPlan({intent:'search',queryTerms:['coffee'],patch:{budget:{amount:-1,currency:'USD',mode:'total'}}}),null)
 assert.equal(readDiscoveryPlan({intent:'search',queryTerms:Array(13).fill('coffee'),patch:{}}),null)
 assert.equal(readDiscovery({purpose:'gift'}),null)
})
test('non USD budgets stay explicit and planner patches preserve total mode',()=>{
 const state=mergeDiscovery(null,{budget:{amount:500,currency:'EUR',mode:'total'}},null)
 assert.equal(state.budget.currency,'EUR')
 assert.equal(mergeDiscovery(state,{recipient:'Mum'},null).budget.mode,'total')
 assert.equal(isOfferConfirmation('yes',{...state,proposal:'invalidated'}),false)
})

test('explicit correction removes one exclusion while retaining other preferences',()=>{
 const initial=mergeDiscovery(null,{recipient:'Dad',exclusions:['tech','plastic'],budget:{amount:100,currency:'USD',mode:'total'}},null)
 const corrected=mergeDiscovery(initial,{removeExclusions:['tech']},null)
 assert.deepEqual(corrected.exclusions,['plastic']);assert.equal(corrected.recipient,'Dad');assert.equal(corrected.budget.amount,100)
})
