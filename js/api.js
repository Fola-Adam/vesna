/**
 * Vesna — API Module
 * Handles all Airtable data fetching via Netlify serverless function
 */

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

      return data.products || [];
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw error;
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
