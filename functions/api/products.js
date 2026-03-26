/**
 * Vesna — Airtable Products API
 * Netlify Serverless Function
 *
 * This function proxies requests to Airtable, keeping the API key secure.
 *
 * Environment Variables (set in Netlify dashboard):
 * - AIRTABLE_API_KEY: Your Airtable API key
 * - AIRTABLE_BASE_ID: Your Airtable base ID
 * - AIRTABLE_TABLE_NAME: Table name (default: Products)
 */

// Mock data for development/demo (when Airtable isn't configured)
const MOCK_PRODUCTS = [
  {
    id: 'rec001',
    name: 'Digital Marketing Masterclass',
    price: 25000,
    salePrice: 20000,
    image: '',
    affiliateLink: 'https://selar.co/example1',
    category: 'Courses',
    description: 'A comprehensive course covering social media marketing, SEO, content strategy, and paid advertising. Perfect for beginners and intermediate marketers looking to level up their skills.',
    featured: true,
    dateAdded: '2026-03-01T00:00:00.000Z'
  },
  {
    id: 'rec002',
    name: 'The Content Creator\'s Playbook',
    price: 8500,
    salePrice: null,
    image: '',
    affiliateLink: 'https://selar.co/example2',
    category: 'Ebooks',
    description: 'Everything you need to know about creating viral content, building an audience, and monetizing your creative work. Includes templates and case studies.',
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
    description: 'A complete Notion workspace template for managing your business. Includes CRM, project management, finance tracking, and goal setting modules.',
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
    description: 'Learn how to build an email list, write compelling emails, and automate your email marketing for consistent sales on autopilot.',
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
    description: 'Schedule posts across all major social platforms, analytics dashboard, content calendar, and team collaboration features included.',
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
    description: 'My personal guide to building a sustainable affiliate marketing business from scratch. No hype, just proven strategies that actually work.',
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
    description: 'Full access to Canva Pro features including brand kits, magic resize, premium templates, and team collaboration. Save hours on design work.',
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
    description: 'A comprehensive checklist ensuring you don\'t miss any critical steps when launching your website. Includes pre-launch, launch day, and post-launch tasks.',
    featured: false,
    dateAdded: '2026-03-22T00:00:00.000Z'
  }
];

/**
 * Transform Airtable record to our product format
 */
function transformRecord(record) {
  const fields = record.fields || {};

  // Get the first attachment URL if image exists
  let imageUrl = '';
  if (fields.Image && fields.Image.length > 0) {
    imageUrl = fields.Image[0].thumbnails?.large?.url || fields.Image[0].url || '';
  }

  return {
    id: record.id,
    name: fields['Product Name'] || 'Untitled Product',
    price: fields.Price || 0,
    salePrice: fields['Sale Price'] || null,
    image: imageUrl,
    affiliateLink: fields['Affiliate Link'] || '#',
    category: fields.Category || 'Other',
    description: fields.Description || '',
    featured: fields.Featured || false,
    dateAdded: record.createdTime
  };
}

/**
 * Main handler for the serverless function
 */
exports.handler = async function(event, context) {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Parse query parameters
  const params = event.queryStringParameters || {};
  const category = params.category;
  const featured = params.featured === 'true';

  // Check if Airtable is configured
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_TABLE_NAME || 'Products';

  // If Airtable is not configured, return mock data
  if (!apiKey || !baseId) {
    console.log('Airtable not configured, returning mock data');

    let products = [...MOCK_PRODUCTS];

    // Apply filters
    if (category) {
      products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (featured) {
      products = products.filter(p => p.featured);
    }

    // Sort: featured first, then by date
    products.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(b.dateAdded) - new Date(a.dateAdded);
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ products })
    };
  }

  // Build Airtable API URL
  const filterFormula = [];
  filterFormula.push('{Active}'); // Only show active products

  if (category) {
    filterFormula.push(`{Category}='${category}'`);
  }

  const formula = filterFormula.length > 1
    ? `AND(${filterFormula.join(',')})`
    : filterFormula[0];

  const sortParam = encodeURIComponent('Date Added');
  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?filterByFormula=${encodeURIComponent(formula)}&sort[0][field]=Featured&sort[0][direction]=desc&sort[1][field]=Date Added&sort[1][direction]=desc`;

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Airtable API error:', errorData);
      throw new Error(`Airtable API returned ${response.status}`);
    }

    const data = await response.json();

    let products = (data.records || []).map(transformRecord);

    // Additional filter for featured if needed (since Airtable sort is limited)
    if (featured) {
      products = products.filter(p => p.featured);
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ products })
    };
  } catch (error) {
    console.error('Error fetching from Airtable:', error);

    // Fallback to mock data on error
    console.log('Falling back to mock data');
    let products = [...MOCK_PRODUCTS];

    if (category) {
      products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (featured) {
      products = products.filter(p => p.featured);
    }

    products.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(b.dateAdded) - new Date(a.dateAdded);
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ products, note: 'Using cached data' })
    };
  }
};
