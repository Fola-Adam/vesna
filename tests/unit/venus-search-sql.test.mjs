import {test,after} from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {PGlite} from '@electric-sql/pglite'
const db=new PGlite()
after(()=>db.close())
await db.exec(`create role anon;create role authenticated;
create table categories(id uuid primary key,name text);
create table products(id uuid primary key,slug text,name text,description text,best_for text,why_victory text,specifications text,price numeric,sale_price numeric,is_active boolean,item_type text,category_id uuid);
grant usage on schema public to anon,authenticated;grant select on products,categories to anon,authenticated;`)
await db.exec(readFileSync(new URL('../../supabase/migrations/202610160001_venus_discovery_search.sql',import.meta.url),'utf8'))
await db.exec(`insert into products(id,slug,name,description,price,is_active,item_type)
select md5(i::text)::uuid,'unrelated-'||i,'Object '||i,'Unrelated object',10,true,'shop' from generate_series(1,210) i;
insert into products values ('11111111-1111-4111-8111-111111111111','coffee-dripper','Coffee dripper','For brewing filter coffee',null,null,'Precision gooseneck pouring',100,70,true,'shop',null,null,ARRAY['coffee brewing'],ARRAY['coffee'],'{}','{}',default);
insert into products(id,slug,name,description,price,is_active,item_type) values
('22222222-2222-4222-8222-222222222222','hidden-coffee','Coffee appliance','coffee',1,false,'shop'),
('33333333-3333-4333-8333-333333333333','archive-coffee','Coffee archive','coffee',1,true,'archive');`)
test('indexed retrieval finds beyond 200, filters sale price and hides inactive/archive even for owner',async()=>{
 const result=await db.query("select * from venus_search_products(array['coffee'],80)")
 assert.deepEqual(result.rows.map(x=>x.slug),['coffee-dripper']);assert.equal(Number(result.rows[0].price),70)
})
test('RPC clamps candidates, distinguishes zero matches and enforces metadata bounds',async()=>{
 assert.equal((await db.query("select * from venus_search_products('{}',null,'{}','{}',true,10000)")).rows.length,12)
 assert.equal((await db.query("select * from venus_search_products(array['rollerskating'])")).rows.length,0)
 await assert.rejects(()=>db.query("update products set uses=array_fill('tag',array[13]) where slug='coffee-dripper'"))
})
test('metadata edits update search immediately and anon sees only active nonarchive rows',async()=>{
 await db.exec("update products set interests=array['gardening'] where slug='coffee-dripper';set role anon")
 assert.deepEqual((await db.query("select slug from venus_search_products(array['gardening'])")).rows.map(x=>x.slug),['coffee-dripper'])
 assert.equal((await db.query("select * from venus_search_products(array['coffee'],60)")).rows.length,0)
 await db.exec('reset role')
})

test('specifications are searchable and tags normalized for exclusions',async()=>{
 assert.equal((await db.query("select * from venus_search_products(array['gooseneck'])")).rows.length,1)
 await db.exec("update products set uses=array['  ELECTRONICS  '] where slug='coffee-dripper'")
 assert.equal((await db.query("select * from venus_search_products(array['coffee'],null,'{}',array['electronics'])")).rows.length,0)
})

test('invoker RPC respects caller RLS in addition to public visibility filters',async()=>{
 await db.exec("alter table products enable row level security;create policy test_visibility on products for select to anon using(slug<>'coffee-dripper');set role anon")
 assert.equal((await db.query("select * from venus_search_products(array['coffee'])")).rows.length,0)
 await db.exec('reset role;drop policy test_visibility on products;alter table products disable row level security')
})
test('SQL price rule matches null base, higher sale and zero price',async()=>{
 await db.exec("insert into products(id,slug,name,price,sale_price,is_active,item_type) values (md5('zero')::uuid,'zero-coffee','Coffee zero',0,5,true,'shop'),(md5('null')::uuid,'null-coffee','Coffee null',null,1,true,'shop'),(md5('higher')::uuid,'higher-coffee','Coffee higher',30,80,true,'shop')")
 const rows=(await db.query("select slug,price from venus_search_products(array['coffee'],40)")).rows
 assert.equal(Number(rows.find(p=>p.slug==='zero-coffee').price),0);assert.equal(Number(rows.find(p=>p.slug==='higher-coffee').price),30);assert.equal(rows.some(p=>p.slug==='null-coffee'),false)
})
