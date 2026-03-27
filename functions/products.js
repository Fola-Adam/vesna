/**
 * Vesna — Airtable Products API
 * Netlify Serverless Function
 *
 * ⚠️  FILE MUST LIVE AT: functions/products.js
 *     NOT at: functions/api/products.js
 *
 * The redirect in netlify.toml maps:
 *   /api/products  →  /.netlify/functions/products
 * So Netlify looks for: functions/products.js  (no subfolder)
 *
 * Environment Variables (Netlify Dashboard → Site → Environment Variables):
 *   AIRTABLE_API_KEY    →  Personal Access Token (starts with "pat...")
 *   AIRTABLE_BASE_ID    →  Base ID from URL (starts with "app...")
 *   AIRTABLE_TABLE_NAME →  Table name, default: Products
 *
 * ⚠️  IMPORTANT: Airtable deprecated old "key..." API keys in 2024.
 *     Generate a new Personal Access Token at: airtable.com/create/tokens
 *     Required scope: data.records:read
 */

/* ── Mock data (fallback when Airtable not configured) ───────── */
const MOCK_PRODUCTS = [
    {
        id: 'rec001',
        name: 'Digital Marketing Masterclass',
        price: 25000,
        salePrice: 20000,
        image: '',
        affiliateLink: 'https://selar.co/example1',
        category: 'Courses',
        description: 'A comprehensive course covering social media marketing, SEO, content strategy, and paid advertising.',
        featured: true,
        dateAdded: '2026-03-01T00:00:00.000Z'
    },
    {
        id: 'rec002',
        name: "The Content Creator's Playbook",
        price: 8500,
        salePrice: null,
        image: '',
        affiliateLink: 'https://selar.co/example2',
        category: 'Ebooks',
        description: 'Everything you need to know about creating viral content, building an audience, and monetizing your creative work.',
        featured: true,
        dateAdded: '2026-03-05T00:00:00.000Z'
    },
    {
        id: 'rec003',
        name: 'Notion Business OS Template',
        price: 5000,
        salePrice: 3500,
        image: '',
        affiliateLink: 'https://selar.co/example3',
        category: 'Templates',
        description: 'A complete Notion workspace for managing your business. CRM, project management, finance tracking, and goal setting.',
        featured: true,
        dateAdded: '2026-03-10T00:00:00.000Z'
    },
    {
        id: 'rec004',
        name: 'Email Marketing Essentials',
        price: 15000,
        salePrice: null,
        image: '',
        affiliateLink: 'https://selar.co/example4',
        category: 'Courses',
        description: 'Build an email list, write compelling emails, and automate your marketing for consistent sales on autopilot.',
        featured: false,
        dateAdded: '2026-03-12T00:00:00.000Z'
    },
    {
        id: 'rec005',
        name: 'Social Media Scheduling Tool',
        price: 12000,
        salePrice: 9000,
        image: '',
        affiliateLink: 'https://selar.co/example5',
        category: 'Tools',
        description: 'Schedule posts across all major social platforms with analytics, content calendar, and team collaboration.',
        featured: false,
        dateAdded: '2026-03-15T00:00:00.000Z'
    },
    {
        id: 'rec006',
        name: 'Affiliate Marketing Blueprint',
        price: 18000,
        salePrice: null,
        image: '',
        affiliateLink: 'https://selar.co/example6',
        category: 'Ebooks',
        description: 'My personal guide to building a sustainable affiliate marketing business from scratch.',
        featured: false,
        dateAdded: '2026-03-18T00:00:00.000Z'
    },
    {
        id: 'rec007',
        name: 'Canva Pro Account (1 Year)',
        price: 25000,
        salePrice: 19999,
        image: '',
        affiliateLink: 'https://selar.co/example7',
        category: 'Tools',
        description: 'Full Canva Pro access: brand kits, magic resize, premium templates, and team collaboration.',
        featured: true,
        dateAdded: '2026-03-20T00:00:00.000Z'
    },
    {
        id: 'rec008',
        name: 'Website Launch Checklist',
        price: 2500,
        salePrice: null,
        image: '',
        affiliateLink: 'https://selar.co/example8',
        category: 'Templates',
        description: "A comprehensive checklist so you don't miss any critical steps when launching your website.",
        featured: false,
        dateAdded: '2026-03-22T00:00:00.000Z'
    }
];

/* ── CORS headers ─────────────────────────────────────────────── */
const CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
};

/* ── Transform Airtable record → product object ──────────────── */
function transformRecord(record) {
    const f = record.fields || {};

    let imageUrl = '';
    if (Array.isArray(f.Image) && f.Image.length > 0) {
        imageUrl =
            f.Image[0].thumbnails?.large?.url ||
            f.Image[0].thumbnails?.full?.url ||
            f.Image[0].url ||
            '';
    }

    return {
        id: record.id,
        name: f['Product Name'] || 'Untitled Product',
        price: typeof f.Price === 'number' ? f.Price : 0,
        salePrice: typeof f['Sale Price'] === 'number' ? f['Sale Price'] : null,
        image: imageUrl,
        affiliateLink: f['Affiliate Link'] || '#',
        category: f.Category || 'Other',
        description: f.Description || '',
        featured: f.Featured === true,
        dateAdded: record.createdTime || new Date().toISOString()
    };
}

/* ── Fetch ALL pages from Airtable (handles 100-record cap) ──── */
async function fetchAllRecords(apiKey, baseId, tableName, filterFormula) {
    const records = [];
    let offset = null;

    do {
        const params = new URLSearchParams({
            filterByFormula: filterFormula,
            'sort[0][field]': 'Featured',
            'sort[0][direction]': 'desc',
            'sort[1][field]': 'Date Added',
            'sort[1][direction]': 'desc',
            pageSize: '100'
        });

        if (offset) params.append('offset', offset);

        const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?${params}`;

        const res = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            const body = await res.text();
            // This message appears in your Netlify function logs — very readable
            throw new Error(`Airtable API error ${res.status}: ${body}`);
        }

        const data = await res.json();
        records.push(...(data.records || []));
        offset = data.offset || null;

    } while (offset);

    return records;
}

/* ── Filter + sort mock data ─────────────────────────────────── */
function applyFilters(products, { category, featured }) {
    let result = [...products];

    if (category) {
        result = result.filter(
            p => p.category.toLowerCase() === category.toLowerCase()
        );
    }

    if (featured) {
        result = result.filter(p => p.featured);
    }

    result.sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return new Date(b.dateAdded) - new Date(a.dateAdded);
    });

    return result;
}

/* ── Main Netlify function handler ───────────────────────────── */
exports.handler = async function (event) {

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: CORS_HEADERS, body: '' };
    }

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    const qs = event.queryStringParameters || {};
    const category = qs.category || null;
    const featured = qs.featured === 'true';

    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const table = process.env.AIRTABLE_TABLE_NAME || 'Products';

    /* ── Env vars missing → mock data ── */
    if (!apiKey || !baseId) {
        console.log('[Vesna] No Airtable env vars — serving mock data');
        const products = applyFilters(MOCK_PRODUCTS, { category, featured });
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ products, source: 'mock' })
        };
    }

    /* ── Warn about deprecated key format ── */
    if (apiKey.startsWith('key')) {
        console.warn(
            '[Vesna] AIRTABLE_API_KEY starts with "key" — this is a legacy format deprecated in 2024. ' +
            'Generate a Personal Access Token at airtable.com/create/tokens'
        );
    }

    /* ── Build Airtable filter ── */
    const filterFormula = category
        ? `AND({Active}, {Category}='${category.replace(/'/g, "\\'")}')`
        : '{Active}';

    try {
        const rawRecords = await fetchAllRecords(apiKey, baseId, table, filterFormula);
        let products = rawRecords.map(transformRecord);

        if (featured) {
            products = products.filter(p => p.featured);
        }

        console.log(`[Vesna] Served ${products.length} products from Airtable`);

        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ products, source: 'airtable' })
        };

    } catch (error) {
        console.error('[Vesna] Airtable error:', error.message);

        // Site stays alive — falls back to mock data silently
        const products = applyFilters(MOCK_PRODUCTS, { category, featured });

        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ products, source: 'fallback' })
        };
    }
};