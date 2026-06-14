import { createClient } from '@supabase/supabase-js'
import { getEmbedding, embedTextForProduct } from '../lib/embeddings'

// =============================================
// Seed the VESNA database from the shop page data
// =============================================

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
}

function parsePrice(s: string | undefined): number | null {
  if (!s) return null
  return parseFloat(s.replace(/[$,]/g, ''))
}

interface ShopProduct {
  id: number
  name: string
  category: string
  price: string
  originalPrice?: string
  image: string
  badge?: string
  quote: string
}

// These are ALL 47 products from shop/page.tsx
// Extracted faithfully from the source
const SHOP_PRODUCTS: ShopProduct[] = [
  { id: 1, name: "Masterclass: Digital Curation", category: "courses", price: "$99", originalPrice: "$149", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80", badge: "Victory's pick", quote: "The only course that actually taught me how to blend aesthetic with utility." },
  { id: 2, name: "The Heritage Silk Bag", category: "fashion", price: "$280", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80", badge: "New", quote: "Victory's favorite accessory — effortless elegance for any occasion." },
  { id: 3, name: "Quiet Luxury Interiors", category: "ebooks", price: "$65", image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80", quote: "A visual guide to stripping away the noise and keeping only what speaks." },
  { id: 4, name: "Podcast Excellence Kit", category: "tech", price: "$299", originalPrice: "$350", image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&q=80", quote: "Everything you need for studio-quality audio from home." },
  { id: 5, name: "Vesna Signature Brewer", category: "home", price: "$1,200", image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80", badge: "Victory's pick", quote: "The morning ritual that changed my productivity." },
  { id: 6, name: "Quarterly Reset System", category: "templates", price: "$45", image: "https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=800&q=80", badge: "New", quote: "My personal framework for goal setting and life audit." },
  { id: 7, name: "Leather Weekender Bag", category: "fashion", price: "$450", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80", quote: "The perfect travel companion, ages beautifully." },
  { id: 8, name: "Mechanical Keyboard Pro", category: "tech", price: "$320", image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&q=80", badge: "Featured", quote: "Heavy brass weight, zero drift. The typist's dream." },
  { id: 9, name: "Artisan Paper Bag", category: "fashion", price: "$38", image: "https://images.unsplash.com/photo-1597484662317-9e7f2ea0b262?w=800&q=80", quote: "Heavy kraft paper with reinforced handles. Everyday carry refined." },
  { id: 10, name: "Artisan Ceramic Vessel", category: "home", price: "$189", image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800&q=80", quote: "Hand-thrown in Kyoto. Each piece is unique." },
  { id: 11, name: "Brass Architect Lamp", category: "home", price: "$349", image: "https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=800&q=80", quote: "Solid brass, adjustable arm. Mid-century inspired." },
  { id: 12, name: "Porcelain Ritual Mug", category: "home", price: "$79", image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80", badge: "Featured", quote: "Handcrafted with speckled glaze. Morning ritual essential." },
  { id: 13, name: "Dark Academia Desk", category: "home", price: "$2,400", image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80", quote: "Solid walnut with brass inlays. A writing desk for generations." },
  { id: 14, name: "MasterClass Subscription Bundle", category: "courses", price: "$240", originalPrice: "$360", image: "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=800&q=80", badge: "Victory's pick", quote: "Curated learning paths from the world's greatest minds." },
  { id: 15, name: "Vintage Aviator Sunglasses", category: "fashion", price: "$320", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80", quote: "Handcrafted acetate with gold-toned hinges." },
  { id: 16, name: "Handwoven Linen Throw", category: "home", price: "$230", image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&q=80", quote: "Belgian flax linen, stonewashed for softness." },
  { id: 17, name: "Artisan Coffee Subscription", category: "food", price: "$48", image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&q=80", badge: "New", quote: "Single-origin, small-batch roasted. Delivered weekly." },
  { id: 18, name: "Minimalist Wallet", category: "fashion", price: "$135", image: "https://images.unsplash.com/photo-1621607512214-68297480165e?w=800&q=80", quote: "Japanese shell cordovan. Slimmer than your phone." },
  { id: 19, name: "Japanese Chef Knife Set", category: "home", price: "$650", image: "https://images.unsplash.com/photo-1563694982-8fc29962c195?w=800&q=80", badge: "Victory's pick", quote: "VG-10 Damascus steel. These changed how I cook." },
  { id: 20, name: "Cork Yoga Mat", category: "fitness", price: "$150", image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80", quote: "Sustainable cork with natural antimicrobial properties." },
  { id: 21, name: "Scented Soy Candle Trio", category: "home", price: "$85", image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&q=80", badge: "Featured", quote: "Wood wick, coconut wax, and essential oils only." },
  { id: 22, name: "Wireless Charging Station", category: "tech", price: "$110", image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80", quote: "Bamboo base, 3-device charging, cable management." },
  { id: 23, name: "The Innovation Stack", category: "ebooks", price: "$45", image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80", quote: "A blueprint for building systems that scale." },
  { id: 24, name: "Italian Leather Backpack", category: "fashion", price: "$780", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80", badge: "Victory's pick", quote: "Tuscany-tanned leather. Patinas beautifully over time." },
  { id: 25, name: "Smart Plant Pot", category: "home", price: "$95", image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&q=80", quote: "Self-watering with moisture sensors and app integration." },
  { id: 26, name: "Acoustic Guitar (Limited)", category: "hobby", price: "$900", originalPrice: "$1,200", image: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800&q=80", badge: "Featured", quote: "Solid rosewood. Only 50 made worldwide." },
  { id: 27, name: "Productivity Planner", category: "tools", price: "$48", image: "https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=800&q=80", badge: "New", quote: "Day-level planning. Weekly reviews. Quarterly audits." },
  { id: 28, name: "Noise-Canceling Headphones", category: "tech", price: "$499", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80", quote: "40-hour battery. Studio-grade audio. Travel case included." },
  { id: 29, name: "Handmade Throw Blanket", category: "home", price: "$280", image: "https://images.unsplash.com/photo-1473496169904-658ba7c44d3a?w=800&q=80", quote: "Hand-loomed by artisans in Oaxaca. Ethical and warm." },
  { id: 30, name: "Digital Detox Kit", category: "lifestyle", price: "$220", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80", badge: "Victory's pick", quote: "Everything you need for a weekend without screens." },
  { id: 31, name: "Standing Desk Converter", category: "workspace", price: "$350", image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80", quote: "Gas-lift mechanism. Fits existing desks. Zero assembly." },
  { id: 32, name: "Vintage Film Camera", category: "hobby", price: "$890", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80", badge: "Featured", quote: "Fully mechanical. No batteries needed. Pure photography." },
  { id: 33, name: "The Daily Stoic Journal", category: "ebooks", price: "$28", image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80", quote: "Morning and evening pages for reflection and discipline." },
  { id: 34, name: "Kombucha Brewing Kit", category: "food", price: "$65", image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80", quote: "Continuous brew system. SCOBY included. Makes 2 gallons." },
  { id: 35, name: "Wool Travel Blanket", category: "fashion", price: "$195", image: "https://images.unsplash.com/photo-1473496169904-658ba7c44d3a?w=800&q=80", quote: "Merino wool. Compact enough for carry-on." },
  { id: 36, name: "Blueprint for Attention", category: "courses", price: "$120", originalPrice: "$199", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80", quote: "Master focus in a distracted world. 8-week cohort." },
  { id: 37, name: "Espresso Machine Pro", category: "home", price: "$2,800", image: "https://images.unsplash.com/photo-1590631923415-6f7a71f1ad02?w=800&q=80", quote: "Dual boiler, PID controlled. Cafe-quality at home." },
  { id: 38, name: "Canvas Tote", category: "fashion", price: "$62", image: "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800&q=80", badge: "New", quote: "Heavy-duty canvas. Vegetable-tanned leather straps." },
  { id: 39, name: "Ergonomic Foot Rest", category: "workspace", price: "$89", image: "https://images.unsplash.com/photo-1616524199847-5a5b7d7f7d3f?w=800&q=80", quote: "Adjustable angle. Memory foam. Bamboo surface." },
  { id: 40, name: "Saffron Starter Set", category: "food", price: "$120", image: "https://images.unsplash.com/photo-1519449556851-5720b33024e6?w=800&q=80", badge: "Victory's pick", quote: "Premium Persian saffron. Includes recipe book." },
  { id: 41, name: "Resin Art Kit", category: "hobby", price: "$179", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80", quote: "All tools included. Create your first piece in a weekend." },
  { id: 42, name: "Footwear Care Bundle", category: "fashion", price: "$88", image: "https://images.unsplash.com/photo-1621607512214-68297480165e?w=800&q=80", quote: "Clean, condition, protect. Everything your leather needs." },
  { id: 43, name: "Hard Drive Enclosure", category: "tech", price: "$59", image: "https://images.unsplash.com/photo-1531492746076-161ca9aad4e0?w=800&q=80", quote: "USB-C, aluminum shell. Tool-free install." },
  { id: 44, name: "Minimalist Desk Organizer", category: "workspace", price: "$72", image: "https://images.unsplash.com/photo-1612984559508-910a76bdd0cf?w=800&q=80", quote: "Bamboo with magnetic dock. Holds everything cleanly." },
  { id: 45, name: "Heirloom Recipe Book", category: "home", price: "$54", image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80", quote: "Archival paper. Lay-flat binding. Pass it down." },
  { id: 46, name: "Indoor Herb Garden Kit", category: "home", price: "$130", image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&q=80", quote: "Self-watering. LED grow light. Basil, mint, and thyme seeds." },
  { id: 47, name: "The Curator's Eye", category: "ebooks", price: "$99", image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80", badge: "New", quote: "Victory's personal framework for spotting quality." },
]

// ------ Seed Logic ------


async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // ---- Phase 1: Seed products ----
  console.log(`Seeding ${SHOP_PRODUCTS.length} products...`)

  function getItemType(p: ShopProduct): string {
    return p.badge === "Victory's pick" ? 'curated' : 'shop'
  }

  const { data: existing } = await supabase.from('products').select('name')
  const existingNames = new Set(existing?.map(p => p.name) || [])
  let inserted = 0
  let skipped = 0

  for (const p of SHOP_PRODUCTS) {
    if (existingNames.has(p.name)) { skipped++; continue }

    const slug = toSlug(p.name)
    const price = parsePrice(p.price)
    const salePrice = parsePrice(p.originalPrice)
    const imageUrls = p.image.startsWith('http') || p.image.startsWith('/') ? [p.image] : []

    const { error } = await supabase.from('products').insert({
      slug, name: p.name, description: p.quote, price, sale_price: salePrice,
      affiliate_link: null, category_id: null, image_urls: imageUrls,
      why_victory: p.badge === "Victory's pick" ? p.quote : null,
      item_type: getItemType(p),
      is_featured: !!p.badge && !["Victory's pick", "New"].includes(p.badge),
      is_active: true,
    })

    if (error) console.error(`  Failed: "${p.name}": ${error.message}`)
    else inserted++
  }

  console.log(`\n✓ ${inserted} inserted, ${skipped} skipped`)

  // ---- Phase 2: Generate embeddings ----
  console.log('\n--- Generating embeddings ---')

  const { data: products, error: fetchErr } = await supabase
    .from('products')
    .select('id, name, description, why_victory')

  if (fetchErr) { console.error('Fetch failed:', fetchErr.message); process.exit(1) }
  if (!products || products.length === 0) { console.log('No products to embed.'); return }

  console.log(`Embedding ${products.length} products (downloads ~23MB model on first run)...`)

  let updated = 0
  for (const product of products) {
    const text = embedTextForProduct(product.name, product.description, product.why_victory, null)
    process.stdout.write(`\r  [${updated + 1}/${products.length}] ${product.name.slice(0, 40).padEnd(42)}`)
    const embedding = await getEmbedding(text)
    const { error: updateError } = await supabase
      .from('products')
      .update({ embedding: `[${embedding.join(',')}]` })
      .eq('id', product.id)
    if (!updateError) updated++
  }

  console.log(`\n\n✓ ${updated}/${products.length} embeddings stored.`)
}

main()
