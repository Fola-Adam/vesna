/**
 * Vesna — Features Module
 * Handles reviews, wishlist, dark mode, and other user features
 */

const Features = {
    /**
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     * REVIEWS & RATINGS
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     */

    /**
     * Get all reviews for a product
     * @param {string} productId - Product ID
     * @returns {Array} Array of review objects
     */
    getProductReviews(productId) {
        const reviews = JSON.parse(localStorage.getItem('vesna_reviews') || '{}');
        return reviews[productId] || [];
    },

    /**
     * Add a review to a product
     * @param {string} productId - Product ID
     * @param {number} rating - 1-5 star rating
     * @param {string} text - Review text
     */
    addReview(productId, rating, text) {
        const reviews = JSON.parse(localStorage.getItem('vesna_reviews') || '{}');
        if (!reviews[productId]) reviews[productId] = [];

        reviews[productId].unshift({
            id: Date.now(),
            rating: Math.min(5, Math.max(1, rating)),
            text: text.substring(0, 500),
            date: new Date().toISOString(),
            helpful: 0
        });

        // Keep only last 50 reviews per product
        reviews[productId] = reviews[productId].slice(0, 50);
        localStorage.setItem('vesna_reviews', JSON.stringify(reviews));
    },

    /**
     * Get average rating for a product
     * @param {string} productId - Product ID
     * @returns {number} Average rating (0-5)
     */
    getAverageRating(productId) {
        const reviews = this.getProductReviews(productId);
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        return (sum / reviews.length).toFixed(1);
    },

    /**
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     * WISHLIST
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     */

    /**
     * Get all wishlist items
     * @returns {Array} Array of product IDs
     */
    getWishlist() {
        return JSON.parse(localStorage.getItem('vesna_wishlist') || '[]');
    },

    /**
     * Check if product is in wishlist
     * @param {string} productId - Product ID
     * @returns {boolean}
     */
    isInWishlist(productId) {
        return this.getWishlist().includes(productId);
    },

    /**
     * Add product to wishlist
     * @param {string} productId - Product ID
     */
    addToWishlist(productId) {
        const wishlist = this.getWishlist();
        if (!wishlist.includes(productId)) {
            wishlist.push(productId);
            localStorage.setItem('vesna_wishlist', JSON.stringify(wishlist));
        }
    },

    /**
     * Remove product from wishlist
     * @param {string} productId - Product ID
     */
    removeFromWishlist(productId) {
        const wishlist = this.getWishlist().filter(id => id !== productId);
        localStorage.setItem('vesna_wishlist', JSON.stringify(wishlist));
    },

    /**
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     * DARK MODE
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     */

    /**
     * Initialize dark mode toggle
     */
    initDarkMode() {
        const isDark = localStorage.getItem('vesna_dark_mode') === 'true';
        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    },

    /**
     * Toggle dark mode
     */
    toggleDarkMode() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const newState = !isDark;
        document.documentElement.setAttribute('data-theme', newState ? 'dark' : 'light');
        localStorage.setItem('vesna_dark_mode', newState);
    },

    /**
     * Get current theme
     * @returns {string} 'light' or 'dark'
     */
    getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    },

    /**
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     * SEARCH & FILTER
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     */

    /**
     * Fuzzy search products
     * @param {Array} products - Products array
     * @param {string} query - Search query
     * @returns {Array} Matching products, scored by relevance
     */
    fuzzySearch(products, query) {
        if (!query.trim()) return products;

        const q = query.toLowerCase();
        const scored = products
            .map(product => {
                const name = (product.name || '').toLowerCase();
                const desc = (product.description || '').toLowerCase();
                const category = (product.category || '').toLowerCase();

                // Exact match highest score
                let score = 0;
                if (name === q) score = 1000;
                else if (name.startsWith(q)) score = 500;
                else if (name.includes(q)) score = 300;
                else if (desc.includes(q)) score = 100;
                else if (category.includes(q)) score = 50;
                // Fuzzy match: count characters in order
                else {
                    let j = 0;
                    for (let i = 0; i < q.length && j < name.length; i++) {
                        j = name.indexOf(q[i], j) + 1;
                        if (j > 0) score += 10;
                    }
                }

                return { product, score };
            })
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(item => item.product);

        return scored;
    },

    /**
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     * LAST SYNCED INDICATOR
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     */

    /**
     * Set last synced time
     */
    setLastSynced() {
        localStorage.setItem('vesna_last_synced', new Date().toISOString());
    },

    /**
     * Get last synced time as human-readable string
     * @returns {string} e.g., "2 minutes ago" or "Just now"
     */
    getLastSyncedText() {
        const synced = localStorage.getItem('vesna_last_synced');
        if (!synced) return 'Never synced';

        const ms = Date.now() - new Date(synced).getTime();
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;

        return new Date(synced).toLocaleDateString();
    },

    /**
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     * PRODUCT COMPARISON
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     */

    /**
     * Get products in comparison cart
     * @returns {Array} Product IDs
     */
    getComparison() {
        return JSON.parse(localStorage.getItem('vesna_comparison') || '[]');
    },

    /**
     * Add product to comparison
     * @param {string} productId - Product ID
     */
    addToComparison(productId) {
        const comparison = this.getComparison();
        if (!comparison.includes(productId) && comparison.length < 4) {
            comparison.push(productId);
            localStorage.setItem('vesna_comparison', JSON.stringify(comparison));
        }
    },

    /**
     * Remove from comparison
     * @param {string} productId - Product ID
     */
    removeFromComparison(productId) {
        const comparison = this.getComparison().filter(id => id !== productId);
        localStorage.setItem('vesna_comparison', JSON.stringify(comparison));
    },

    /**
     * Clear comparison cart
     */
    clearComparison() {
        localStorage.setItem('vesna_comparison', JSON.stringify([]));
    },

    /**
     * Check if in comparison
     * @param {string} productId - Product ID
     * @returns {boolean}
     */
    isInComparison(productId) {
        return this.getComparison().includes(productId);
    }
};

// Export for use
window.Features = Features;
