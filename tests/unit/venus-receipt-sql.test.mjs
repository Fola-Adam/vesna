import {test,after} from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {PGlite} from '@electric-sql/pglite'
const db=new PGlite();after(()=>db.close())
const owner='11111111-1111-4111-8111-111111111111',a='22222222-2222-4222-8222-222222222222',b='33333333-3333-4333-8333-333333333333'
await db.exec(`create role anon;create role authenticated;create schema auth;
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.user_id',true),'')::uuid$$;
create function auth.jwt() returns jsonb language sql stable as $$select '{"is_anonymous":false}'::jsonb$$;
create table products(id uuid primary key,is_active boolean,item_type text);
create table member_shortlist(user_id uuid,product_id uuid references products,created_at timestamptz default now(),primary key(user_id,product_id));
insert into products values ('${a}',true,'shop'),('${b}',true,'shop');set request.user_id='${owner}';`)
await db.exec(readFileSync(new URL('../../supabase/migrations/202610160003_venus_verified_addition_receipts.sql',import.meta.url),'utf8'))
test('addition receipts contain only actually inserted IDs in requested order',async()=>{
 const call=async ids=>(await db.query('select change_member_shortlist($1,$2::uuid[]) receipt',['add',ids])).rows[0].receipt
 const first=await call([b,a]);assert.equal(first.added,2);assert.deepEqual(first.addedIds,[b,a])
 const repeated=await call([a,b]);assert.equal(repeated.added,0);assert.deepEqual(repeated.addedIds,[])
 await db.query('select change_member_shortlist($1,$2::uuid[])',['remove',[a]])
 const third=await call([b,a,a]);assert.equal(third.added,1);assert.deepEqual(third.addedIds,[a])
})
