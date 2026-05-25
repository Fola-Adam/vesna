// Netlify serverless function — Fetch products from Airtable
// Falls back to empty array if Airtable is not configured

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=300', // 5 minute cache
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  const API_KEY = process.env.AIRTABLE_API_KEY;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;
  const TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'Products';

  // If Airtable is not configured, return empty (site uses hardcoded fallback)
  if (!API_KEY || !BASE_ID) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ products: [], source: 'none' }),
    };
  }

  try {
    // Fetch active products, featured first
    const filterFormula = encodeURIComponent('{Active} = TRUE()');
    const sortParam = encodeURIComponent(JSON.stringify([
      { field: 'Featured', direction: 'desc' },
      { field: 'Date Added', direction: 'desc' }
    ]));

    const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?filterByFormula=${filterFormula}&sort=${sortParam}`;

    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${API_KEY}` },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Airtable error:', response.status, errorText);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ products: [], source: 'error' }),
      };
    }

    const data = await response.json();

    // Transform Airtable records to clean product objects
    const products = (data.records || []).map(record => {
      const f = record.fields;
      const img = f.Image && f.Image[0];

      return {
        id: record.id,
        name: f['Product Name'] || 'Untitled',
        price: f.Price || 0,
        salePrice: f['Sale Price'] || null,
        image: img ? img.url : null,
        affiliateLink: f['Affiliate Link'] || null,
        category: f.Category || 'Uncategorized',
        description: f.Description || '',
        whyVictory: f['Why Victory'] || '',
        featured: f.Featured || false,
        active: f.Active !== false,
        platform: f.Platform || null,
        whatsapp: f.Whatsapp || null,
        dateAdded: f['Date Added'] || record.createdTime,
      };
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ products, source: 'airtable' }),
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ products: [], source: 'error' }),
    };
  }
};
