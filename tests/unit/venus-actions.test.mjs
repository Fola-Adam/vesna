import {test,after} from 'node:test'
import assert from 'node:assert/strict'
import {mkdtempSync,readFileSync,writeFileSync,rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {createRequire} from 'node:module'
import ts from 'typescript'
const directory=mkdtempSync(join(tmpdir(),'vesna-actions-'))
for(const name of ['pricing','catalog-collections','venus-actions']) writeFileSync(join(directory,`${name}.js`),ts.transpileModule(readFileSync(new URL(`../../lib/${name}.ts`,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2021}}).outputText)
const {actionClaimWithoutReceipt, compareVenusPicks, planVenusAction, resolveVenusTool, validVenusAction}=createRequire(import.meta.url)(join(directory,'venus-actions.js'))
after(()=>rmSync(directory,{recursive:true,force:true}))
const one={id:'11111111-1111-4111-8111-111111111111',name:'Sony WH-1000XM6',slug:'sony-wh-1000xm6',categories:{name:'Audio'}}
const two={id:'22222222-2222-4222-8222-222222222222',name:'Sony Speaker',slug:'sony-speaker',categories:{name:'Audio'}}
const catalog=[one,two]
test('save resolves a live product; ambiguous names produce clarification',()=>{
 assert.equal(planVenusAction(catalog,'Save Sony WH-1000XM6 to my shortlist').action.id,one.id)
 assert.equal(planVenusAction(catalog,'Save Sony').action,undefined)
 assert.equal(planVenusAction(catalog,'How can I save a pick?'),null)
})
test('removal requires a saved catalog item and contextual commands need one unique focus',()=>{
 assert.equal(planVenusAction(catalog,'Remove Sony WH-1000XM6 from my shortlist',[],null,[]).action,undefined)
 assert.equal(planVenusAction(catalog,'Remove Sony WH-1000XM6 from my shortlist',[],null,[one.id]).action.kind,'remove')
 assert.equal(planVenusAction(catalog,'Save this pick',[],one.slug).action.id,one.id)
 assert.equal(planVenusAction(catalog,'Save that', [{role:'assistant',content:`/shop/${one.slug} /shop/${two.slug}`}]).action,undefined)
})
test('clear is explicit and filter navigation preserves category and budget',()=>{
 assert.equal(planVenusAction(catalog,'Clear my shortlist').action.kind,'clear')
 assert.notEqual(planVenusAction(catalog,'Remove all headphones from my shortlist')?.action?.kind,'clear')
 assert.equal(planVenusAction(catalog,'Show audio picks under $200').action.path,'/picks?category=audio&maxPrice=200')
 assert.equal(planVenusAction(catalog,'Open my wishlist').action.path,'/shortlist')
})
test('the browser action boundary rejects external and administrative destinations',()=>{
 assert.equal(validVenusAction({kind:'navigate',path:'/admin/products'}),false)
 assert.equal(validVenusAction({kind:'navigate',path:'//evil.example'}),false)
 assert.equal(validVenusAction({kind:'navigate',path:'/picks?redirect=https://evil.example'}),false)
 assert.equal(validVenusAction({kind:'navigate',path:'/picks?maxPrice=-1'}),false)
})

test('comparison reports missing facts and uses only supplied records',()=>{
 const result=compareVenusPicks([{...one,price:378,category:'Audio',considerations:null,specifications:null}])
 assert.match(result,/\$378\.00/)
 assert.match(result,/Not recorded/)
 assert.match(result,/Detailed specifications are not recorded/)
 assert.match(result,/\/shop\/sony-wh-1000xm6/)
 assert.doesNotMatch(result,/tested|battery life|waterproof/i)
})

const sonos={id:'33333333-3333-4333-8333-333333333333',name:'Sonos Era 100',slug:'sonos-era-100',categories:{name:'Audio'}}
test('a named pick proposes saving and yes executes the specific offered action',()=>{
 const offer=planVenusAction([sonos],'Sonos Era 100')
 assert.equal(offer.action,undefined)
 const result=planVenusAction([sonos],'yes',[{role:'user',content:'Sonos Era 100'},{role:'assistant',content:offer.message}])
 assert.equal(result.action.kind,'save')
 assert.equal(result.action.id,sonos.id)
})
test('no, ambiguous yes, and stale success prose do not authorize an action',()=>{
 assert.equal(planVenusAction([one,two],'yes',[{role:'assistant',content:'Would you like to add Sony WH-1000XM6 or Sony Speaker to your shortlist?'}]).action,undefined)
 assert.equal(planVenusAction([sonos],'no',[{role:'assistant',content:'Would you like to add Sonos Era 100 to your shortlist?'}]).action,undefined)
 assert.equal(planVenusAction([sonos],'yes',[{role:'assistant',content:'Sonos Era 100 was added to your shortlist.'}]).action,undefined)
})
test('done checks actual browser shortlist state rather than prior completion prose',()=>{
 const history=[{role:'assistant',content:'Sonos Era 100 has been added to your shortlist.'}]
 assert.match(planVenusAction([sonos],'done?',history,null,[]).message,/not in your shortlist/)
 assert.match(planVenusAction([sonos],'done?',history,null,[sonos.id]).message,/currently in your shortlist/)
})
test('real tool requests accept informal intent and reject fabricated products, wrong targets, and advice questions',()=>{
 assert.equal(resolveVenusTool([sonos],'save_pick',{slug:sonos.slug},'Could you pop Sonos Era 100 onto my wishlist?').action.id,sonos.id)
 assert.equal(resolveVenusTool([sonos],'save_pick',{slug:'made-up'},'Save the made up product').action,undefined)
 assert.equal(resolveVenusTool([one,sonos],'save_pick',{slug:one.slug},'Pop Sonos Era 100 onto my wishlist').action,undefined)
 assert.equal(resolveVenusTool([sonos],'save_pick',{slug:sonos.slug},'Tell me how to save Sonos Era 100').action,undefined)
 assert.equal(resolveVenusTool([sonos],'save_pick',{slug:sonos.slug},'Do not save Sonos Era 100').action,undefined)
})
test('ordinary AI prose cannot masquerade as an action receipt',()=>{
 assert.equal(actionClaimWithoutReceipt('Your request to add Sonos Era 100 to the Shortlist has been received and will be processed by the application.'),true)
 assert.equal(actionClaimWithoutReceipt('The Shortlist update has been processed by the system.'),true)
 assert.equal(actionClaimWithoutReceipt('Would you like me to add Sonos Era 100 to your shortlist?'),false)
})

test('the screenshot wording Era100 resolves to the canonical Era 100 record',()=>{
 const offer=planVenusAction([sonos],'Sonos Era100')
 assert.equal(offer.action,undefined)
 assert.match(offer.message,/Sonos Era 100/)
 assert.equal(planVenusAction([sonos],'yes',[{role:'assistant',content:'Would you like to add **Sonos Era100** to your Shortlist?'}]).action.id,sonos.id)
})

const keyboard={...one,id:'44444444-4444-4444-8444-444444444444',name:'Logitech MX Keys S',slug:'logitech-mx-keys-s',categories:{name:'Workspace'}}
const charger={...two,id:'55555555-5555-4555-8555-555555555555',name:'Anker Charger',slug:'anker-charger',categories:{name:'Tech'}}
const mug={...two,id:'66666666-6666-4666-8666-666666666666',name:'Ember Mug',slug:'ember-mug',categories:{name:'Home'},description:'Keeps coffee warm during a work session.'}
const workspaceCatalog=[keyboard,charger,mug,sonos]
test('bulk workspace saves include related Tech and recorded work use without including unrelated home audio',()=>{
 const plan=planVenusAction(workspaceCatalog,'add all the products that can be used in a workspace to my shortlost')
 assert.equal(plan.action.kind,'save_many')
 assert.deepEqual(plan.action.products.map(product=>product.id),[keyboard.id,charger.id,mug.id])
 assert.equal(validVenusAction(plan.action),true)
})
test('a group clarification keeps the earlier bulk intent while a discovery question does not mutate',()=>{
 const history=[{role:'user',content:'add all workspace products to my shortlist'},{role:'assistant',content:'Which pick do you mean? Give me its product name.'}]
 assert.equal(planVenusAction(workspaceCatalog,'any that can be used in a workspace is what i mean.',history).action.kind,'save_many')
 const discovery=planVenusAction(workspaceCatalog,'tellme products that can be used in a workspace',history)
 assert.equal(discovery.action,undefined)
 assert.equal(discovery.productSlugs.length,3)
 assert.match(discovery.message,/Anker Charger/)
})
test('ordinary shortlist advice does not get mistaken for a completed action',()=>{
 assert.equal(actionClaimWithoutReceipt('Here are workspace picks. You can add any of these to your shortlist, or keep your previously saved picks.'),false)
 assert.equal(actionClaimWithoutReceipt('You removed a pick earlier. These are the current workspace options.'),false)
 assert.equal(validVenusAction({kind:'save_many',label:'workspace',products:[{kind:'navigate',path:'/shortlist'}]}),false)
})

test('a contextual tool call still resolves a single previously named pick',()=>{
 assert.equal(resolveVenusTool([sonos],'save_pick',{slug:sonos.slug},'Pop that onto my wishlist',[{role:'assistant',content:'Sonos Era 100 is a room speaker.'}]).action.id,sonos.id)
})
