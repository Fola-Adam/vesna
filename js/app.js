/**
 * Vesna — Main Application
 * Initializes and coordinates all page functionality
 */

const App = {
  // Store products in memory for reuse
  products: [],
  categories: [],
  // Callbacks registered before App finishes loading
  _readyCallbacks: [],

  /**
   * Register a function to run once App has loaded products.
   * Safe to call before or after init() completes.
   * Replaces all the setTimeout(fn, 1000) hacks in the HTML pages.
   */
  onReady(fn) {
    if (this._ready) {
      fn(this);
    } else {
      this._readyCallbacks.push(fn);
    }
  },

  _resolveReady() {
    this._ready = true;
    this._readyCallbacks.forEach(fn => fn(this));
    this._readyCallbacks = [];
  },

  /**
   * Initialize the application
   */
  async init() {
    try {
      // Initialize features
      Features.initDarkMode();

      // Fetch products
      this.products = await API.getProducts();
      Features.setLastSynced();
      this.categories = API.getCategories(this.products);

      // Initialize page-specific functionality
      this.initPage();

      // Setup common functionality
      this.setupNavigation();
      this.setupSearch();
      this.setupWishlistButtons();
      this.setupComparisonButtons();
      this.setupDarkModeToggle();
      this.initOnboarding();

      // Populate shared UI that all pages need
      this.populateFooterCategories();
      this.populateProductCount();

      // Fire any onReady callbacks (replaces setTimeout hacks in HTML files)
      this._resolveReady();

    } catch (error) {
      console.error('Failed to initialize app:', error);
      Components.toast('Failed to load products. Please refresh the page.', 'error');
      this._resolveReady(); // still resolve so pages don't hang forever
    }
  },

  /**
   * Populate footer category links on any page that has #footer-categories
   */
  populateFooterCategories() {
    const footerCats = document.getElementById('footer-categories');
    if (!footerCats) return;
    footerCats.innerHTML = this.categories
      .map(cat => `<a href="/pages/category.html?name=${encodeURIComponent(cat.name)}" class="footer__link">${cat.name}</a>`)
      .join('');
  },

  /**
   * Populate product count on pages that have #product-count
   */
  populateProductCount() {
    const countEl = document.getElementById('product-count');
    if (!countEl) return;
    const page = document.body.dataset.page;
    // On category page the count is set by initCategoryPage — skip here
    if (page === 'category') return;
    const count = this.products.length;
    countEl.textContent = `${count} product${count !== 1 ? 's' : ''}`;
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
        .map(cat => Components.categoryCard(cat, `/pages/category.html?name=${encodeURIComponent(cat.name)}`))
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
    if (!grid) return; // Safety check

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
   * Initialize new-user onboarding modal
   */
  initOnboarding() {
    if (localStorage.getItem('vesna_onboarding_completed') === 'true') {
      return;
    }

    const steps = [
      {
        title: 'Welcome to Vesna!',
        text: 'Get curated digital products and real reviews in one place. Let us show you around.',
      },
      {
        title: 'Explore Categories',
        text: 'Use the category filter to quickly find Courses, Ebooks, Tools, and more.',
      },
      {
        title: 'Try Product Details',
        text: 'Click any card to see full details and get your affiliate link. The entire app is built mobile-first.',
      },
      {
        title: 'Ready to Start',
        text: 'You can close this anytime and dive in. Enjoy the journey!',
      },
    ];

    let currentStep = 0;

    const modal = document.createElement('div');
    modal.id = 'onboarding-modal';
    modal.className = 'onboarding-overlay';
    const featherSvg = `
      <svg width="42" height="42" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.2 3.55c1.1-1.07 2.76-1.07 3.87 0l6.06 5.91c1.07 1.04 1.07 2.7 0 3.74l-9.16 8.93a.723.723 0 0 1-1.03 0 .764.764 0 0 1 0-1.08l8.1-7.88-4.3-4.20-.6-.6-2.59 2.5a.74.74 0 0 1-1.04 0 .75.75 0 0 1 0-1.06l2.23-2.14-.5-.5a.748.748 0 0 1 0-1.06l.01-.01z" fill="currentColor"/>
      </svg>
    `;

    modal.innerHTML = `
      <div class="onboarding-card" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
        <div class="onboarding-mascot">${featherSvg}</div>
        <h2 id="onboarding-title">${steps[0].title}</h2>
        <p id="onboarding-text">${steps[0].text}</p>
        <div class="onboarding-controls">
          <button id="onboarding-prev" class="btn btn--secondary" disabled>Back</button>
          <button id="onboarding-next" class="btn btn--primary">Next</button>
          <button id="onboarding-skip" class="btn btn--ghost">Skip</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const titleEl = modal.querySelector('#onboarding-title');
    const textEl = modal.querySelector('#onboarding-text');
    const prevBtn = modal.querySelector('#onboarding-prev');
    const nextBtn = modal.querySelector('#onboarding-next');
    const skipBtn = modal.querySelector('#onboarding-skip');

    const closeOnboarding = () => {
      localStorage.setItem('vesna_onboarding_completed', 'true');
      modal.remove();
    };

    const updateStep = () => {
      const step = steps[currentStep];
      titleEl.textContent = step.title;
      textEl.textContent = step.text;

      prevBtn.disabled = currentStep === 0;
      nextBtn.textContent = currentStep === steps.length - 1 ? 'Finish' : 'Next';
    };

    prevBtn.addEventListener('click', () => {
      if (currentStep > 0) {
        currentStep -= 1;
        updateStep();
      }
    });

    nextBtn.addEventListener('click', () => {
      if (currentStep < steps.length - 1) {
        currentStep += 1;
        updateStep();
      } else {
        closeOnboarding();
      }
    });

    skipBtn.addEventListener('click', closeOnboarding);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeOnboarding();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeOnboarding();
    });

    updateStep();
  },

  /**
   * Setup navigation functionality
   */
  setupNavigation() {
    // Active nav link — match by filename
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav__link');

    navLinks.forEach(link => {
      link.classList.remove('nav__link--active');
      const href = link.getAttribute('href') || '';
      const linkFile = href.split('/').pop().split('?')[0];
      const currentFile = currentPath.split('/').pop().split('?')[0] || 'index.html';

      if (
        linkFile === currentFile ||
        (currentFile === '' && linkFile === 'index.html')
      ) {
        link.classList.add('nav__link--active');
      }
    });

    // Mobile menu toggle
    const menuToggle = document.querySelector('.nav__menu-toggle');
    const navLinksContainer = document.querySelector('.nav__links');

    if (menuToggle && navLinksContainer) {
      menuToggle.addEventListener('click', () => {
        const isOpen = navLinksContainer.classList.toggle('nav__links--open');
        menuToggle.setAttribute('aria-expanded', isOpen);
        menuToggle.classList.toggle('nav__menu-toggle--active', isOpen);
      });

      // Keyboard support
      menuToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const isOpen = navLinksContainer.classList.toggle('nav__links--open');
          menuToggle.setAttribute('aria-expanded', isOpen);
          menuToggle.classList.toggle('nav__menu-toggle--active', isOpen);
        }
      });

      // Close on Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinksContainer.classList.contains('nav__links--open')) {
          navLinksContainer.classList.remove('nav__links--open');
          menuToggle.setAttribute('aria-expanded', 'false');
          menuToggle.classList.remove('nav__menu-toggle--active');
        }
      });

      // Close mobile menu when a link is clicked
      navLinksContainer.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', () => {
          navLinksContainer.classList.remove('nav__links--open');
          menuToggle.setAttribute('aria-expanded', 'false');
          menuToggle.classList.remove('nav__menu-toggle--active');
        });
      });

      // Close menu on outside click
      document.addEventListener('click', (e) => {
        if (!menuToggle.contains(e.target) && !navLinksContainer.contains(e.target)) {
          navLinksContainer.classList.remove('nav__links--open');
          menuToggle.setAttribute('aria-expanded', 'false');
          menuToggle.classList.remove('nav__menu-toggle--active');
        }
      });
    }

    // Scroll-triggered fade-in (replaces CSS-only animation)
    // Elements with .fade-in animate when they enter the viewport
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('fade-in--visible');
              observer.unobserve(entry.target); // only animate once
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
      );

      document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
    } else {
      // Fallback for browsers without IntersectionObserver
      document.querySelectorAll('.fade-in').forEach(el => {
        el.classList.add('fade-in--visible');
      });
    }
  },

  /**
   * Setup search functionality with fuzzy matching
   */
  setupSearch() {
    const container = document.getElementById('search-container');
    if (!container) return;

    try {
      container.innerHTML = Components.searchBar();
    } catch (e) {
      console.error('Error rendering search bar:', e);
      return;
    }

    const searchInput = document.getElementById('product-search');
    const clearBtn = document.getElementById('search-clear');

    if (!searchInput) return;

    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);

      const query = e.target.value;
      clearBtn.style.display = query ? 'block' : 'none';

      debounceTimer = setTimeout(() => {
        const page = document.body.dataset.page;
        if (page === 'products') {
          const grid = document.getElementById('products-grid');
          if (grid) {
            const results = Features.fuzzySearch(this.products, query);
            this.renderProducts(grid, results);
          }
        } else if (page === 'category') {
          const grid = document.getElementById('category-products');
          if (grid) {
            const results = Features.fuzzySearch(this.products, query);
            this.renderProducts(grid, results);
          }
        }
      }, 300);
    });

    clearBtn?.addEventListener('click', () => {
      searchInput.value = '';
      clearBtn.style.display = 'none';
      const grid = document.getElementById('products-grid');
      if (grid && document.body.dataset.page === 'products') {
        this.renderProducts(grid, this.products);
      }
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        clearBtn.style.display = 'none';
      }
    });
  },

  /**
   * Setup dark mode toggle button
   */
  setupDarkModeToggle() {
    // Add theme toggle to nav
    const nav = document.querySelector('.nav__inner');
    if (!nav) return;

    if (document.getElementById('theme-toggle')) return; // already exists

    const toggle = document.createElement('button');
    toggle.id = 'theme-toggle';
    toggle.className = 'btn-icon btn-icon--theme';
    toggle.setAttribute('aria-label', 'Toggle dark mode');
    toggle.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-sun">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/>
        <line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-moon" style="display:none;">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    `;

    toggle.addEventListener('click', () => {
      Features.toggleDarkMode();
      const isDark = Features.getCurrentTheme() === 'dark';
      toggle.querySelector('.icon-sun').style.display = isDark ? 'none' : 'block';
      toggle.querySelector('.icon-moon').style.display = isDark ? 'block' : 'none';
    });

    // Set initial state
    const isDark = Features.getCurrentTheme() === 'dark';
    toggle.querySelector('.icon-sun').style.display = isDark ? 'none' : 'block';
    toggle.querySelector('.icon-moon').style.display = isDark ? 'block' : 'none';

    nav.appendChild(toggle);
  },

  /**
   * Setup wishlist button handlers
   */
  setupWishlistButtons() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-icon--wishlist');
      if (!btn) return;

      const productId = btn.dataset.productId;
      const isInWishlist = Features.isInWishlist(productId);

      if (isInWishlist) {
        Features.removeFromWishlist(productId);
        btn.classList.remove('btn-icon--active');
        Components.toast('Removed from wishlist', 'success', 3000);
      } else {
        Features.addToWishlist(productId);
        btn.classList.add('btn-icon--active');
        Components.toast('Added to wishlist', 'success', 3000);
      }
    });
  },

  /**
   * Setup comparison button handlers
   */
  setupComparisonButtons() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-icon--compare');
      if (!btn) return;

      const productId = btn.dataset.productId;
      const isInComparison = Features.isInComparison(productId);

      if (isInComparison) {
        Features.removeFromComparison(productId);
        btn.classList.remove('btn-icon--active');
        btn.disabled = false;
        Components.toast('Removed from comparison', 'success', 3000);
      } else {
        const comparison = Features.getComparison();
        if (comparison.length >= 4) {
          Components.toast('Max 4 products to compare', 'error', 3000);
        } else {
          Features.addToComparison(productId);
          btn.classList.add('btn-icon--active');
          Components.toast('Added to comparison', 'success', 3000);

          // Disable other buttons if at limit
          if (comparison.length + 1 >= 4) {
            document.querySelectorAll('.btn-icon--compare:not(.btn-icon--active)').forEach(b => {
              b.disabled = true;
            });
          }
        }
      }
    });
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

// Export for use in other modules
window.App = App;

// Future features (reviews, wishlist) will be added here when needed