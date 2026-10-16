import {test,after} from 'node:test'
import assert from 'node:assert/strict'
import {mkdtempSync,readFileSync,writeFileSync,rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {createRequire} from 'node:module'
import ts from 'typescript'
const dir=mkdtempSync(join(tmpdir(),'vesna-receipt-'))
writeFileSync(join(dir,'receipt.js'),ts.transpileModule(readFileSync(new URL('../../lib/venus-receipt.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2021,esModuleInterop:true}}).outputText)
const {signVenusReceipt,verifyVenusReceipt}=createRequire(import.meta.url)(join(dir,'receipt.js'))
after(()=>rmSync(dir,{recursive:true,force:true}))
const owner='11111111-1111-4111-8111-111111111111',id='22222222-2222-4222-8222-222222222222',key='unit-test-only-receipt-signing-key'
test('verified addition receipt is user bound, tamper resistant and expires',()=>{
 const now=Date.now(),token=signVenusReceipt({userId:owner,addedIds:[id],at:now},key)
 assert.deepEqual(verifyVenusReceipt(token,owner,key,now).addedIds,[id])
 assert.equal(verifyVenusReceipt(token,id,key,now),null)
 assert.equal(verifyVenusReceipt(token+'x',owner,key,now),null)
 assert.equal(verifyVenusReceipt(token,owner,key,now+86400001),null)
 assert.equal(verifyVenusReceipt(token,owner,'wrong',now),null)
})
test('empty or fabricated unsigned receipts cannot supply a last saved pick',()=>{
 assert.equal(verifyVenusReceipt(JSON.stringify({userId:owner,addedIds:[id],at:Date.now()}),owner,key),null)
 assert.equal(signVenusReceipt({userId:owner,addedIds:[],at:Date.now()},key),null)
})
