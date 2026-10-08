import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'

let db
const alice = '00000000-0000-4000-8000-000000000001'
const bob = '00000000-0000-4000-8000-000000000002'
before(async () => {
  db = new PGlite()
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
    CREATE SCHEMA auth;
    CREATE TABLE auth.users (id uuid PRIMARY KEY, email text, raw_user_meta_data jsonb);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    CREATE FUNCTION public.uuid_generate_v4() RETURNS uuid LANGUAGE sql AS $$ SELECT gen_random_uuid() $$;
    GRANT USAGE ON SCHEMA public, auth TO anon, authenticated, service_role;
    GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated, service_role;`)
  const schema = (await readFile(new URL('../fixtures/legacy-schema.sql', import.meta.url), 'utf8')).replace('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";', '')
  await db.exec(schema)
  // Mirror Supabase's standard API grants before applying the migration.
  await db.exec('GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;')
  try { await db.exec(await readFile(new URL('../../supabase/migrations/202610070001_protect_profile_roles.sql', import.meta.url), 'utf8')) }
  catch (error) { if (error.code !== 'ENOENT') throw error }
  await db.exec(`INSERT INTO auth.users VALUES ('${alice}', 'alice@example.com', '{"role":"admin"}'), ('${bob}', 'bob@example.com', '{}');`)
})
after(async () => { await db?.close() })

// A metadata-to-role assignment would fail this test.
test('signup metadata cannot grant an admin role', async () => {
  const result = await db.query('SELECT role FROM profiles WHERE id = $1', [alice])
  assert.equal(result.rows[0].role, 'user')
})

// Granting UPDATE(role) or unrestricted table UPDATE would fail this test.
test('authenticated users cannot promote their own role', async () => {
  await db.exec(`SET ROLE authenticated; SET "request.jwt.claim.sub" = '${alice}';`)
  try {
    await assert.rejects(db.query("UPDATE profiles SET role = 'admin' WHERE id = $1", [alice]), /permission denied|role/i)
  } finally { await db.exec('RESET ROLE') }
})

test('users can edit their own name but cannot read other profiles', async () => {
  await db.exec(`SET ROLE authenticated; SET "request.jwt.claim.sub" = '${alice}';`)
  try {
    await db.query("UPDATE profiles SET full_name = 'Alice' WHERE id = $1", [alice])
    const result = await db.query('SELECT id, full_name FROM profiles')
    assert.deepEqual(result.rows, [{ id: alice, full_name: 'Alice' }])
  } finally { await db.exec('RESET ROLE') }
})

test('anonymous users cannot enumerate profile emails', async () => {
  await db.exec('SET ROLE anon')
  try { await assert.rejects(db.query('SELECT email FROM profiles'), /permission denied/) }
  finally { await db.exec('RESET ROLE') }
})

test('trusted role assignments survive an idempotent migration and allow inactive-product reads', async () => {
  await db.query("UPDATE profiles SET role = 'admin' WHERE id = $1", [bob])
  const migration = await readFile(new URL('../../supabase/migrations/202610070001_protect_profile_roles.sql', import.meta.url), 'utf8')
  await db.exec(migration)
  await db.query("INSERT INTO products (slug, name, is_active) VALUES ('inactive-test', 'Inactive', false)")
  await db.exec(`SET ROLE authenticated; SET "request.jwt.claim.sub" = '${bob}';`)
  try {
    assert.equal((await db.query('SELECT role FROM profiles')).rows[0].role, 'admin')
    assert.equal((await db.query("SELECT name FROM products WHERE slug = 'inactive-test'")).rows[0].name, 'Inactive')
  } finally { await db.exec('RESET ROLE') }
})

test('role trigger remains protective if a future grant accidentally exposes the role column', async () => {
  await db.exec('GRANT UPDATE(role) ON profiles TO authenticated')
  await db.exec(`SET ROLE authenticated; SET "request.jwt.claim.sub" = '${alice}';`)
  try { await assert.rejects(db.query("UPDATE profiles SET role = 'admin' WHERE id = $1", [alice]), /trusted administrator/) }
  finally { await db.exec('RESET ROLE') }
})

test('subscriber data stays private while the trusted server can save signups', async () => {
  await db.exec('SET ROLE service_role')
  try { await db.query("INSERT INTO email_subscribers (email) VALUES ('fixture-reader@example.com')") }
  finally { await db.exec('RESET ROLE') }
  await db.exec('SET ROLE anon')
  try { await assert.rejects(db.query('SELECT email FROM email_subscribers'), /permission denied/) }
  finally { await db.exec('RESET ROLE') }
})
