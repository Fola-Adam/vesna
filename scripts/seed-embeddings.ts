import { createClient } from '@supabase/supabase-js'
import { getEmbedding, embedTextForProduct } from '../lib/embeddings'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars. Run:\n  npx tsx --env-file=.env.local scripts/seed-embeddings.ts')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  console.log('Fetching products...')

  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, description, why_victory')

  if (error) {
    console.error('Failed to fetch products:', error.message)
    console.log(
      '\nRun these RLS policies in Supabase SQL Editor first:\n\n' +
      'CREATE POLICY "Products are viewable by everyone"\n' +
      '  ON public.products FOR SELECT\n' +
      '  TO PUBLIC\n' +
      '  USING (is_active = true);'
    )
    process.exit(1)
  }

  if (!products || products.length === 0) {
    console.log('No products found.')
    process.exit(0)
  }

  console.log(`Found ${products.length} products. Generating embeddings (this downloads ~23MB model on first run)...`)

  const sqlStatements: string[] = []
  let i = 0

  for (const product of products) {
    i++
    const text = embedTextForProduct(product.name, product.description, product.why_victory, null)

    process.stdout.write(`\r  [${i}/${products.length}] ${product.name.slice(0, 40).padEnd(42)}`)

    const embedding = await getEmbedding(text)
    const vectorStr = `[${embedding.join(',')}]`
    sqlStatements.push(
      `UPDATE products SET embedding = '${vectorStr}'::vector(384) WHERE id = '${product.id}';`,
    )
  }

  console.log('\n\n-- Copy and paste into Supabase SQL Editor:\n')
  for (const stmt of sqlStatements) {
    console.log(stmt)
  }
  console.log(`\n-- Done. ${products.length} products embedded.`)

  // Also write to a file
  const fs = await import('fs')
  fs.writeFileSync('seed-embeddings.sql', sqlStatements.join('\n'), 'utf-8')
  console.log(`\nAlso written to seed-embeddings.sql`)
}

main().catch((err) => {
  console.error('\nError:', err)
  process.exit(1)
})
