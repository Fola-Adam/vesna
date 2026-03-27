/**
 * Vesna — Main Application
 * Initializes and coordinates all page functionality
 */

const App = {
  // Store products in memory for reuse
  products: [],
  categories: [],

  /**
   * Initialize the application
   */
  async init() {
    try {
      // Fetch products
      this.products = await API.getProducts();
      this.categories = API.getCategories(this.products);

      // Initialize page-specific functionality
      this.initPage();

      // Setup common functionality
      this.setupNavigation();
    } catch (error) {
      console.error('Failed to initialize app:', error);
      Components.toast('Failed to load products. Please refresh the page.', 'error');
    }
  },

  /**
   * Initialize page-specific functionality based on body class or data attribute
   */
  initPage() {
    const page = document.body.dataset.page;

    switch (page) {
      case 'home':
        this.initHomePage();
        break;
      case 'products':
        this.initProductsPage();
        break;
      case 'product-detail':
        this.initProductDetailPage();
        break;
      case 'category':
        this.initCategoryPage();
        break;
      case 'about':
        // No dynamic content needed
        break;
    }
  },

  /**
   * Initialize homepage
   */
  async initHomePage() {
    const featuredGrid = document.getElementById('featured-products');
    const categoriesGrid = document.getElementById('categories');

    if (featuredGrid) {
      // Show skeletons
      featuredGrid.innerHTML = Components.skeletonCards(3);

      try {
        const featuredProducts = await API.getFeaturedProducts();

        if (featuredProducts.length > 0) {
          featuredGrid.innerHTML = featuredProducts
            .slice(0, 6)
            .map(p => Components.productCard(p))
            .join('');
        } else {
          // If no featured products, show latest products
          const latestProducts = this.products.slice(0, 3);
          featuredGrid.innerHTML = latestProducts
            .map(p => Components.productCard(p))
            .join('');
        }
      } catch (error) {
        featuredGrid.innerHTML = Components.emptyState(
          'Unable to load products',
          'Check your connection and try again.',
          'Refresh Page',
          window.location.href
        );
      }
    }

    if (categoriesGrid) {
      categoriesGrid.innerHTML = this.categories
        .map(cat => Components.categoryCard(cat, `pages/category.html?name=${encodeURIComponent(cat.name)}`))
        .join('');
    }
  },

  /**
   * Initialize products page
   */
  async initProductsPage() {
    const productsGrid = document.getElementById('products-grid');
    const filterBar = document.getElementById('filter-bar');

    if (!productsGrid) return;

    let activeCategory = 'All';
    let filteredProducts = [...this.products];

    // Render initial filter chips
    if (filterBar) {
      filterBar.innerHTML = Components.filterChips(this.categories, activeCategory);

      // Setup filter chip click handlers
      filterBar.addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;

        activeCategory = chip.dataset.category;

        // Update chip states
        filterBar.querySelectorAll('.chip').forEach(c => {
          c.classList.remove('chip--active');
          c.setAttribute('aria-pressed', 'false');
        });
        chip.classList.add('chip--active');
        chip.setAttribute('aria-pressed', 'true');

        // Filter products
        filteredProducts = activeCategory === 'All'
          ? this.products
          : this.products.filter(p => p.category === activeCategory);

        this.renderProducts(productsGrid, filteredProducts);
      });
    }

    // Initial render
    this.renderProducts(productsGrid, filteredProducts);
  },

  /**
   * Render products to grid
   * @param {HTMLElement} grid - Grid container
   * @param {Array} products - Products to render
   */
  renderProducts(grid, products) {
    if (products.length === 0) {
      grid.innerHTML = Components.emptyState(
        'No products found',
        'Products in this category will appear here.',
        'View All Products',
        'products.html'
      );
      return;
    }

    grid.innerHTML = products.map(p => Components.productCard(p)).join('');
  },

  /**
   * Initialize product detail page
   */
  async initProductDetailPage() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    if (!productId) {
      this.showProductNotFound();
      return;
    }

    const product = await API.getProduct(productId);

    if (!product) {
      this.showProductNotFound();
      return;
    }

    this.renderProductDetail(product);
  },

  /**
   * Render product detail page
   * @param {Object} product - Product data
   */
  renderProductDetail(product) {
    const {
      id,
      name,
      price,
      salePrice,
      image,
      category,
      description,
      affiliateLink,
      featured,
      dateAdded
    } = product;

    const hasSale = salePrice && salePrice < price;
    const isNew = API.isNew(dateAdded);

    // Determine badge
    let badgeHtml = '';
    if (hasSale) badgeHtml = '<span class="badge badge--sale">Sale</span>';
    else if (featured) badgeHtml = '<span class="badge badge--featured">Featured</span>';
    else if (isNew) badgeHtml = '<span class="badge badge--new">New</span>';

    // Price display
    const priceHtml = hasSale
      ? `<span class="product-detail__price">${API.formatPrice(salePrice)}</span>
         <span class="product-detail__price--original">${API.formatPrice(price)}</span>`
      : `<span class="product-detail__price">${API.formatPrice(price)}</span>`;

    // Image
    const imageHtml = image
      ? `<img src="${image}" alt="${name}" class="product-detail__image">`
      : `<div class="card__image-placeholder" style="width:100%;height:100%;">No Image</div>`;

    // Related products
    const relatedProducts = API.getRelatedProducts(this.products, id, category, 3);
    const relatedGrid = document.getElementById('related-products');

    // Update page elements
    const imageWrap = document.querySelector('.product-detail__image-wrap');
    if (imageWrap) {
      imageWrap.innerHTML = `${imageHtml}${badgeHtml ? `<div class="product-detail__badge">${badgeHtml}</div>` : ''}`;
    }

    const categoryEl = document.querySelector('.product-detail__category');
    if (categoryEl) categoryEl.textContent = category || 'Product';

    const titleEl = document.querySelector('.product-detail__title');
    if (titleEl) titleEl.textContent = name;

    const priceWrap = document.querySelector('.product-detail__price-wrap');
    if (priceWrap) priceWrap.innerHTML = priceHtml;

    const descEl = document.querySelector('.product-detail__description');
    if (descEl) descEl.textContent = description || 'No description available.';

    const ctaBtn = document.querySelector('.product-detail__cta .btn');
    if (ctaBtn && affiliateLink) {
      ctaBtn.href = affiliateLink;
    }

    // Update page title
    document.title = `${name} — Vesna`;

    // Render related products
    if (relatedGrid) {
      if (relatedProducts.length > 0) {
        relatedGrid.innerHTML = `
          ${Components.sectionLabel('Related Products')}
          <div class="product-grid product-grid--featured">
            ${relatedProducts.map(p => Components.productCard(p)).join('')}
          </div>
        `;
      } else {
        relatedGrid.style.display = 'none';
      }
    }
  },

  /**
   * Show product not found state
   */
  showProductNotFound() {
    const grid = document.querySelector('.product-detail__grid');
    if (grid) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1;">
          <div class="empty-state__icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <h3 class="empty-state__title">Product Not Found</h3>
          <p class="empty-state__text">This product may have been removed or the link is incorrect.</p>
          <a href="products.html" class="btn btn--primary">Browse Products</a>
        </div>
      `;
    }
  },

  /**
   * Initialize category page
   */
  async initCategoryPage() {
    const params = new URLSearchParams(window.location.search);
    const categoryName = params.get('name');

    if (!categoryName) {
      window.location.href = 'products.html';
      return;
    }

    const productsGrid = document.getElementById('category-products');
    const categoryTitle = document.getElementById('category-title');
    const categoryCount = document.getElementById('category-count');

    const filteredProducts = this.products.filter(p => p.category === categoryName);

    if (categoryTitle) {
      categoryTitle.textContent = categoryName;
    }

    if (categoryCount) {
      categoryCount.textContent = `${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''}`;
    }

    if (productsGrid) {
      if (filteredProducts.length === 0) {
        productsGrid.innerHTML = Components.emptyState(
          `No ${categoryName} yet`,
          'Products in this category will appear here soon.',
          'Browse All Products',
          'products.html'
        );
      } else {
        productsGrid.innerHTML = filteredProducts.map(p => Components.productCard(p)).join('');
      }
    }

    // Update page title
    document.title = `${categoryName} — Vesna`;
  },

  /**
   * Setup navigation functionality
   */
  setupNavigation() {
    // Set active nav link based on current page
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav__link');

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (currentPath.includes(href) && href !== '/') {
        link.classList.add('nav__link--active');
      } else if (href === '/' && currentPath === '/') {
        link.classList.add('nav__link--active');
      }
    });

    // Mobile menu toggle (basic implementation)
    const menuToggle = document.querySelector('.nav__menu-toggle');
    const navLinksContainer = document.querySelector('.nav__links');

    if (menuToggle && navLinksContainer) {
      menuToggle.addEventListener('click', () => {
        navLinksContainer.classList.toggle('nav__links--open');
      });
    }
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

// Export for use in other modules
window.App = App;

// Submit a review
async function submitReview(productId, rating, review) {
  try {
    const response = await fetch('/.netlify/functions/submit-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, rating, review })
    });

    if (!response.ok) {
      throw new Error('Failed to submit review');
    }

    Components.toast('Thank you for your review!', 'success');
    // Refresh the page or show success message
  } catch (error) {
    Components.toast('Something went wrong. Try again later.', 'error');
  }
}

// Star rating interaction
document.querySelectorAll('.star').forEach(star => {
  star.addEventListener('click', () => {
    const rating = parseInt(star.dataset.rating);
    document.querySelectorAll('.star').forEach(s => s.classList.remove('active'));
    for (let i = 1; i <= rating; i++) {
      document.querySelector(`.star[data-rating="${i}"]`).classList.add('active');
    }
  });
});

// Submit review
document.getElementById('submit-review')?.addEventListener('click', () => {
  const productId = new URLSearchParams(window.location.search).get('id');
  const rating = Array.from(document.querySelectorAll('.star.active')).length;
  const review = document.querySelector('.review-textarea').value;

  if (!rating || !review) {
    Components.toast('Please rate and leave a review.', 'error');
    return;
  }

  submitReview(productId, rating, review);
});

// Save to local storage
function saveToWishlist(productId) {
  let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
  if (!wishlist.includes(productId)) {
    wishlist.push(productId);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    Components.toast('Saved to wishlist!', 'success');
  } else {
    Components.toast('Already saved!', 'info');
  }
}

// Render “Save to Wishlist” button
function renderWishlistButton() {
  const saveBtn = document.getElementById('save-to-wishlist');
  if (saveBtn) {
    const productId = new URLSearchParams(window.location.search).get('id');
    if (!productId) return;

    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    if (wishlist.includes(productId)) {
      saveBtn.innerHTML = `
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
          <path d="M12 2l-2 6-6 2 6 2 2 6 6-2-6-2z"></path>
        </svg>
        Saved to Wishlist
      `;
    } else {
      saveBtn.innerHTML = `
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
        </svg>
        Save to Wishlist
      `;
    }
  }
}