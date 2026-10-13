import {test} from 'node:test'
import assert from 'node:assert/strict'
import {planVenusAction, validVenusAction} from '../../lib/venus-actions.ts'
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
