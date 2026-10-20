import {test,after} from 'node:test'
import assert from 'node:assert/strict'
import {mkdtempSync,readFileSync,writeFileSync,rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {createRequire} from 'node:module'
import ts from 'typescript'
const directory=mkdtempSync(join(tmpdir(),'vesna-task-'))
for(const name of ['pricing','venus-task','venus-discovery']) writeFileSync(join(directory,`${name}.js`),ts.transpileModule(readFileSync(new URL(`../../lib/${name}.ts`,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2021}}).outputText)
const {advanceVenusTask,groundSelectionEvidence,taskBudget,validateSelection,confirmVenusSelection,catalogToolRecords}=createRequire(import.meta.url)(join(directory,'venus-task.js'))
after(()=>rmSync(directory,{recursive:true,force:true}))
const catalog=[{id:'11111111-1111-4111-8111-111111111111',name:'Small kettle',slug:'small-kettle',price:70,sale_price:null,item_type:'curated',description:'A compact kettle for making hot drinks.'},{id:'22222222-2222-4222-8222-222222222222',name:'Coffee dripper',slug:'coffee-dripper',price:40,sale_price:null,item_type:'curated',description:'A ceramic dripper for filter coffee.'}]
const selection={label:'Coffee setup',products:catalog.map(product=>({slug:product.slug,evidence:product.description}))}

test('curator receives bounded approved use and interest metadata',()=>{
 const [record]=catalogToolRecords([{...catalog[0],uses:['pour-over brewing'],interests:['coffee'],brand:'Maker'}])
 assert.deepEqual(record.uses,['pour-over brewing']);assert.deepEqual(record.interests,['coffee']);assert.equal(record.brand,'Maker')
})
test('total budgets reject a set that passes each per-item limit',()=>{
 const total=advanceVenusTask(null,'Find a coffee setup under $100 total')
 assert.equal(taskBudget(total).mode,'total')
 assert.equal(validateSelection(catalog,selection,total.brief,total),null)
 const each=advanceVenusTask(null,'Find coffee products under $100 each')
 assert.equal(validateSelection(catalog,selection,each.brief,each).products.length,2)
})
test('refinements retain the brief and budget while a new task clears prior selections',()=>{
 const initial={...advanceVenusTask(null,'Find a coffee setup under $150 total'),selectionIds:catalog.map(product=>product.id)}
 const refined=advanceVenusTask(initial,'Keep the kettle and find a cheaper alternative')
 assert.equal(refined.brief,initial.brief)
 assert.deepEqual(refined.selectionIds,initial.selectionIds)
 assert.equal(taskBudget(refined).amount,150)
 assert.equal(advanceVenusTask(refined,'Find gardening tools').selectionIds.length,0)
})
test('informal confirmation resolves the exact current set without provider inference',()=>{
 for(const message of ['yes pls','yes pls, add these two to my shortlist','Save these picks']) {
  const result=confirmVenusSelection(catalog,message,catalog.map(product=>product.id),[])
  assert.deepEqual(result.action.products.map(product=>product.id),catalog.map(product=>product.id))
 }
 assert.equal(confirmVenusSelection(catalog,'yes pls, add these three to my shortlist',catalog.map(product=>product.id),[]).action,undefined)
 assert.equal(confirmVenusSelection(catalog,'do not save these',catalog.map(product=>product.id),[]),null)
})
test('fabricated evidence and incomplete legacy offers cannot authorize a set',()=>{
 assert.equal(validateSelection(catalog,{...selection,products:[{slug:'small-kettle',evidence:'This kettle is suitable for outdoor gardening.'}]}),null)
 const result=confirmVenusSelection(catalog,'yes pls',[],[{role:'assistant',content:'Here are three picks: Small kettle, Coffee dripper, imaginary pan. Would you like me to add these three to your shortlist?'}])
 assert.equal(result.action,undefined)
})
test('field selection copies original catalog evidence and rejects unrecorded fields',()=>{
 const result=validateSelection(catalog,{label:'Kettle',products:[{slug:'small-kettle',evidenceField:'description'}]})
 assert.equal(result.products[0].evidence,catalog[0].description)
 assert.equal(validateSelection(catalog,{label:'Kettle',products:[{slug:'small-kettle',evidenceField:'specifications'}]}),null)
})

test('discovery with missing or empty evidence fields gets real source evidence',()=>{
 const proposal={label:'Coffee setup',products:catalog.map(product=>({slug:product.slug,evidenceField:'best_for'}))}
 assert.equal(validateSelection(catalog,proposal),null)
 const grounded=groundSelectionEvidence(catalog,proposal)
 assert.deepEqual(validateSelection(catalog,grounded).products.map(product=>product.evidence),catalog.map(product=>product.description))
 const overBudget=advanceVenusTask(null,'Find coffee setup under $100 total')
 assert.equal(validateSelection(catalog,grounded,overBudget.brief,overBudget),null)
 assert.equal(validateSelection(catalog,groundSelectionEvidence(catalog,{label:'Unknown',products:[{slug:'invented'}]})),null)
})
