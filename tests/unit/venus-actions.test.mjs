import {test} from 'node:test'
import assert from 'node:assert/strict'
import {actionClaimWithoutReceipt, compareVenusPicks, planVenusAction, resolveVenusTool, validVenusAction} from '../../lib/venus-actions.ts'
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
