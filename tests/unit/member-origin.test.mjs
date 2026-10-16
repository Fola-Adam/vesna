import {test,after} from 'node:test'
import assert from 'node:assert/strict'
import {mkdtempSync,readFileSync,writeFileSync,rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {createRequire} from 'node:module'
import ts from 'typescript'
const directory=mkdtempSync(join(tmpdir(),'vesna-origin-'))
writeFileSync(join(directory,'origin.js'),ts.transpileModule(readFileSync(new URL('../../lib/member-origin.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2021}}).outputText)
const {memberRequestOrigin}=createRequire(import.meta.url)(join(directory,'origin.js'))
after(()=>rmSync(directory,{recursive:true,force:true}))
test('trusted preview HTTPS origin is accepted behind an internal HTTP adapter',()=>{
 const origin='https://deploy-preview-2--ves-na.netlify.app'
 assert.equal(memberRequestOrigin(new Request('http://localhost:3000/api/member/confirm',{headers:{Origin:origin}})),origin)
})
test('missing, foreign, lookalike and insecure origins are rejected',()=>{
 for(const origin of [undefined,'null','https://evil.example','https://ves-na.netlify.app.evil.example','https://deploy-preview-2--another.netlify.app','http://ves-na.netlify.app']) {
  const request=new Request('https://deploy-preview-2--ves-na.netlify.app/api/member/shortlist',{headers:origin ? {Origin:origin} : {}})
  assert.equal(memberRequestOrigin(request),null)
 }
})
