/**
 * Vesna — API Module
 * Handles all Airtable data fetching via Netlify serverless function
 */

// Mock products fallback for local development
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
  }
];

const API = {
  // Base URL for Netlify function (same origin)
  baseUrl: '/api',

  /**
   * Fetch all products from Airtable via serverless function
   * @param {Object} options - Filter options
   * @param {string} options.category - Filter by category
   * @param {boolean} options.featured - Only featured products
   * @returns {Promise<Array>} Products array
   */
  async getProducts(options = {}) {
    try {
      const params = new URLSearchParams();

      if (options.category) {
        params.append('category', options.category);
      }
      if (options.featured) {
        params.append('featured', 'true');
      }

      const url = `${this.baseUrl}/products${params.toString() ? '?' + params.toString() : ''}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.lastSource = data.source || 'unknown';
      return data.products ? data.products.map(p => ({ ...p, source: this.lastSource })) : [];
    } catch (error) {
      console.log('API unavailable, using mock products:', error.message);
      // Fallback to mock products
      let products = MOCK_PRODUCTS;
      this.lastSource = 'mock';

      if (options.featured) {
        products = products.filter(p => p.featured);
      }
      if (options.category) {
        products = products.filter(p => p.category === options.category);
      }

      return products.map(p => ({ ...p, source: this.lastSource }));
    }
  },

  /**
   * Fetch a single product by ID
   * @param {string} productId - Airtable record ID
   * @returns {Promise<Object|null>} Product object or null
   */
  async getProduct(productId) {
    try {
      const products = await this.getProducts();
      return products.find(p => p.id === productId) || null;
    } catch (error) {
      console.error('Failed to fetch product:', error);
      throw error;
    }
  },

  /**
   * Fetch products by category
   * @param {string} category - Category name
   * @returns {Promise<Array>} Products array
   */
  async getProductsByCategory(category) {
    return this.getProducts({ category });
  },

  /**
   * Fetch featured products only
   * @returns {Promise<Array>} Featured products array
   */
  async getFeaturedProducts() {
    return this.getProducts({ featured: true });
  },

  /**
   * Get all unique categories from products
   * @param {Array} products - Products array
   * @returns {Array} Categories with counts
   */
  getCategories(products) {
    const categoryMap = {};

    products.forEach(product => {
      const category = product.category || 'Other';
      if (!categoryMap[category]) {
        categoryMap[category] = {
          name: category,
          count: 0
        };
      }
      categoryMap[category].count++;
    });

    return Object.values(categoryMap).sort((a, b) => a.name.localeCompare(b.name));
  },

  /**
   * Get related products (same category, excluding current)
   * @param {Array} products - All products
   * @param {string} currentId - Current product ID
   * @param {string} category - Current product category
   * @param {number} limit - Max products to return
   * @returns {Array} Related products
   */
  getRelatedProducts(products, currentId, category, limit = 3) {
    return products
      .filter(p => p.id !== currentId && p.category === category)
      .slice(0, limit);
  },

  /**
   * Format price in Naira
   * @param {number} price - Price in Naira
   * @returns {string} Formatted price string
   */
  formatPrice(price) {
    if (!price && price !== 0) return '';
    return '₦' + Number(price).toLocaleString('en-NG');
  },

  /**
   * Check if product is new (added within 30 days)
   * @param {string} dateAdded - ISO date string
   * @returns {boolean}
   */
  isNew(dateAdded) {
    if (!dateAdded) return false;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(dateAdded) > thirtyDaysAgo;
  }
};

// Export for use in other modules
window.API = API;
