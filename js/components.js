/**
 * Vesna — Components Module
 * Reusable UI component renderers
 */

const Components = {

  /**
   * Render a product card
   * @param {Object} product - Product data
   * @returns {string} HTML string
   */
  productCard(product) {
    const {
      id,
      name,
      price,
      salePrice,
      image,
      category,
      description,
      featured,
      dateAdded
    } = product;

    const hasSale = salePrice && salePrice < price;
    const isNew = API.isNew(dateAdded);

    // Determine badges
    const badges = [];
    if (hasSale) badges.push('<span class="badge badge--sale">Sale</span>');
    if (featured) badges.push('<span class="badge badge--featured">Featured</span>');
    if (isNew && !featured) badges.push('<span class="badge badge--new">New</span>');

    const badgesHtml = badges.length
      ? `<div class="card__badge">${badges.join('')}</div>`
      : '';

    const priceHtml = hasSale
      ? `<span class="card__price">${API.formatPrice(salePrice)}</span>
         <span class="card__price--original">${API.formatPrice(price)}</span>`
      : `<span class="card__price">${API.formatPrice(price)}</span>`;

    const imageHtml = image
      ? `<img src="${image}" alt="${name}" class="card__image" loading="lazy">`
      : `<div class="card__image-placeholder">No Image</div>`;

    // Determine correct product detail path for routing context
    const productUrl = window.location.pathname.startsWith('/pages/')
      ? `product.html?id=${encodeURIComponent(id)}`
      : `/pages/product.html?id=${encodeURIComponent(id)}`;

    const sourceLabel = product.source === 'mock' ? 'Demo' : product.source === 'airtable' ? 'Live' : 'Fallback';
    const avgRating = Features.getAverageRating(id);
    const reviewCount = Features.getProductReviews(id).length;

    return `
      <article class="card fade-in fade-in--visible">
        <div class="card__image-wrap">
          ${imageHtml}
          ${badgesHtml}
          ${this.wishlistButton(id)}
          ${this.comparisonButton(id)}
        </div>
        <div class="card__body">
          <div class="card__meta">
            <p class="card__category">${category || 'Product'}</p>
            <span class="card__source">${sourceLabel}</span>
          </div>
          <h3 class="card__title">${name}</h3>
          ${reviewCount > 0 ? this.starRating(avgRating, reviewCount) : ''}
          ${description ? `<p class="card__description">${description}</p>` : ''}
          <div class="card__price-wrap">
            ${priceHtml}
          </div>
        </div>
        <div class="card__footer">
          <a href="${productUrl}" class="btn btn--primary" onclick="event.stopPropagation()">
            View Details
          </a>
          ${product.affiliateLink ? `<a href="${product.affiliateLink}" class="btn btn--secondary" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">
            Buy Now
          </a>` : ''}
        </div>
      </article>
    `;
  },

  /**
   * Render a skeleton loading card
   * @returns {string} HTML string
   */
  skeletonCard() {
    return `
      <article class="card card--skeleton">
        <div class="card__image-wrap">
          <div class="skeleton" style="width:100%;height:100%;"></div>
        </div>
        <div class="card__body">
          <div class="skeleton skeleton--text" style="width: 50%;"></div>
          <div class="skeleton skeleton--title"></div>
          <div class="skeleton skeleton--price"></div>
        </div>
        <div class="card__footer">
          <div class="skeleton skeleton--btn"></div>
        </div>
      </article>
    `;
  },

  /**
   * Render skeleton cards
   * @param {number} count - Number of skeletons
   * @returns {string} HTML string
   */
  skeletonCards(count = 4) {
    return Array(count).fill(this.skeletonCard()).join('');
  },

  /**
   * Render filter chips
   * @param {Array} categories - Category objects with name and count
   * @param {string} activeCategory - Currently active category
   * @returns {string} HTML string
   */
  filterChips(categories, activeCategory = 'All') {
    const allCount = categories.reduce((sum, cat) => sum + cat.count, 0);

    const chips = [
      { name: 'All', count: allCount }
    ].concat(categories);

    return `
      <div class="filter-bar" role="group" aria-label="Filter by category">
        ${chips.map(cat => `
          <button
            class="chip ${cat.name === activeCategory ? 'chip--active' : ''}"
            data-category="${cat.name}"
            aria-pressed="${cat.name === activeCategory}"
          >
            ${cat.name}
            <span style="opacity:0.6;margin-left:4px;">(${cat.count})</span>
          </button>
        `).join('')}
      </div>
    `;
  },

  /**
   * Render empty state
   * @param {string} title - Title message
   * @param {string} text - Description text
   * @param {string} actionText - CTA button text
   * @param {string} actionHref - CTA button link
   * @returns {string} HTML string
   */
  emptyState(title = 'No products found', text = 'Try adjusting your filters or check back later.', actionText = 'View All', actionHref = '../products.html') {
    return `
      <div class="empty-state">
        <div class="empty-state__icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
        </div>
        <h3 class="empty-state__title">${title}</h3>
        <p class="empty-state__text">${text}</p>
        <a href="${actionHref}" class="btn btn--secondary">${actionText}</a>
      </div>
    `;
  },

  /**
   * Render toast notification
   * @param {string} message - Toast message
   * @param {string} type - 'success' or 'error'
   * @param {number} duration - Auto dismiss duration in ms
   */
  toast(message, type = 'success', duration = 5000) {
    const container = document.getElementById('toast-container') || this.createToastContainer();

    const icon = type === 'success'
      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>'
      : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
      <span class="toast__icon">${icon}</span>
      <span class="toast__message">${message}</span>
      <button class="toast__close" aria-label="Dismiss">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    `;

    container.appendChild(toast);

    // Auto dismiss
    const timeoutId = setTimeout(() => {
      this.dismissToast(toast);
    }, duration);

    // Manual dismiss
    toast.querySelector('.toast__close').addEventListener('click', () => {
      clearTimeout(timeoutId);
      this.dismissToast(toast);
    });
  },

  /**
   * Create toast container if not exists
   * @returns {HTMLElement}
   */
  createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
  },

  /**
   * Dismiss a toast with animation
   * @param {HTMLElement} toast - Toast element
   */
  dismissToast(toast) {
    if (!toast || !toast.parentNode) return;

    toast.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  },

  /**
   * Render category card
   * @param {Object} category - Category data
   * @param {string} href - Link to category page
   * @returns {string} HTML string
   */
  categoryCard(category, href) {
    const icons = {
      'Courses': '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
      'Ebooks': '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
      'Tools': '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
      'Templates': '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>'
    };

    const icon = icons[category.name] || '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/></svg>';

    return `
      <a href="${href}" class="category-card fade-in">
        <div class="category-card__icon">${icon}</div>
        <p class="category-card__name">${category.name}</p>
        <p class="category-card__count">${category.count} products</p>
      </a>
    `;
  },

  /**
   * Render section label with line
   * @param {string} title - Section title
   * @returns {string} HTML string
   */
  sectionLabel(title) {
    return `
      <div class="section-label">
        <span class="heading-sm">${title}</span>
      </div>
    `;
  },

  /**
   * Render search bar
   * @param {string} placeholder - Input placeholder
   * @returns {string} HTML string
   */
  searchBar(placeholder = 'Search products...') {
    return `
      <div class="search-bar">
        <input
          type="search"
          id="product-search"
          class="search-bar__input"
          placeholder="${placeholder}"
          aria-label="Search products"
        />
        <svg class="search-bar__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        <button class="search-bar__clear" id="search-clear" aria-label="Clear search" style="display:none;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    `;
  },

  /**
   * Render star rating
   * @param {number} rating - Rating 0-5
   * @param {number} count - Number of reviews
   * @returns {string} HTML string
   */
  starRating(rating = 0, count = 0) {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

    let stars = '';
    for (let i = 0; i < fullStars; i++) {
      stars += '<span class="star star--full">★</span>';
    }
    if (hasHalf) {
      stars += '<span class="star star--half">★</span>';
    }
    for (let i = 0; i < emptyStars; i++) {
      stars += '<span class="star star--empty">★</span>';
    }

    return `
      <div class="rating">
        <div class="rating__stars">${stars}</div>
        ${count > 0 ? `<span class="rating__count">${rating.toFixed(1)} (${count})</span>` : ''}
      </div>
    `;
  },

  /**
   * Render review item
   * @param {Object} review - Review data
   * @returns {string} HTML string
   */
  reviewItem(review) {
    const { rating, text, date } = review;
    const dateObj = new Date(date);
    const timeAgo = this.getTimeAgo(dateObj);

    return `
      <div class="review">
        <div class="review__header">
          ${this.starRating(rating)}
          <span class="review__date">${timeAgo}</span>
        </div>
        <p class="review__text">${text}</p>
      </div>
    `;
  },

  /**
   * Render reviews section
   * @param {string} productId - Product ID
   * @returns {string} HTML string
   */
  reviewsSection(productId) {
    const reviews = Features.getProductReviews(productId);
    const avgRating = Features.getAverageRating(productId);

    const reviewsHtml = reviews.slice(0, 3).map(r => this.reviewItem(r)).join('');
    const moreCount = reviews.length > 3 ? reviews.length - 3 : 0;

    return `
      <section class="reviews-section">
        <div class="reviews-section__header">
          <h3>Reviews from Users</h3>
          ${this.starRating(avgRating, reviews.length)}
        </div>
        ${reviews.length > 0 ? `
          <div class="reviews-list">
            ${reviewsHtml}
            ${moreCount > 0 ? `<p class="reviews-more">+ ${moreCount} more reviews</p>` : ''}
          </div>
        ` : `<p class="reviews-empty">No reviews yet. Be the first!</p>`}
        <form class="review-form" id="review-form">
          <div class="form-group">
            <label for="review-rating">Rating:</label>
            <select id="review-rating" class="form-control" required>
              <option value="">Select rating...</option>
              <option value="5">★★★★★ Excellent</option>
              <option value="4">★★★★☆ Good</option>
              <option value="3">★★★☆☆ Average</option>
              <option value="2">★★☆☆☆ Poor</option>
              <option value="1">★☆☆☆☆ Terrible</option>
            </select>
          </div>
          <div class="form-group">
            <label for="review-text">Your review:</label>
            <textarea id="review-text" class="form-control" placeholder="Share your thoughts..." maxlength="500"></textarea>
          </div>
          <button type="submit" class="btn btn--primary">Submit Review</button>
        </form>
      </section>
    `;
  },

  /**
   * Render wishlist button
   * @param {string} productId - Product ID
   * @returns {string} HTML string
   */
  wishlistButton(productId) {
    const isInWishlist = Features.isInWishlist(productId);
    return `
      <button
        class="btn-icon btn-icon--wishlist ${isInWishlist ? 'btn-icon--active' : ''}"
        data-product-id="${productId}"
        aria-label="Add to wishlist"
        title="Add to wishlist"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="${isInWishlist ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>
    `;
  },

  /**
   * Render comparison button
   * @param {string} productId - Product ID
   * @returns {string} HTML string
   */
  comparisonButton(productId) {
    const isInComparison = Features.isInComparison(productId);
    const comparisonCount = Features.getComparison().length;
    return `
      <button
        class="btn-icon btn-icon--compare ${isInComparison ? 'btn-icon--active' : ''}"
        data-product-id="${productId}"
        aria-label="Add to comparison"
        title="Compare products (max 4)"
        ${comparisonCount >= 4 && !isInComparison ? 'disabled' : ''}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 3v18M3 9h18M3 15h18"/>
        </svg>
      </button>
    `;
  },

  /**
   * Helper: Get time ago string
   * @param {Date} date - Date object
   * @returns {string} e.g., "2 days ago"
   */
  getTimeAgo(date) {
    const ms = Date.now() - date.getTime();
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    return `${months}mo ago`;
  }
};

// Export for use in other modules
window.Components = Components;