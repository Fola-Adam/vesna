/**
 * Product Comparison Module
 * Manages product selection, comparison table display, and localStorage persistence
 */

class Compare {
    constructor() {
        this.selectedProducts = [];
        this.maxProducts = 4;
        this.storageKey = 'vesna_compare_products';
        this.init();
    }

    /**
     * Initialize the comparison module
     */
    async init() {
        await this.loadComparisonState();
        this.setupEventListeners();
        this.renderComparison();
    }

    /**
     * Set up event listeners for comparison controls
     */
    setupEventListeners() {
        const searchInput = document.getElementById('compare-search');
        const addBtn = document.getElementById('add-product-btn');
        const clearBtn = document.getElementById('clear-compare-btn');

        if (searchInput) {
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.addProductFromSearch();
                }
            });
        }

        if (addBtn) {
            addBtn.addEventListener('click', () => this.addProductFromSearch());
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearAllProducts());
        }

        // Remove product buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('compare-remove')) {
                const index = parseInt(e.target.dataset.index);
                this.removeProduct(index);
            }
        });
    }

    /**
     * Search for a product by name and add it to comparison
     */
    async addProductFromSearch() {
        const searchInput = document.getElementById('compare-search');
        if (!searchInput || !searchInput.value.trim()) {
            alert('Please enter a product name');
            return;
        }

        if (this.selectedProducts.length >= this.maxProducts) {
            alert(`You can only compare up to ${this.maxProducts} products at a time`);
            return;
        }

        try {
            // Fetch all products and search for match
            const response = await fetch('/.netlify/functions/products');
            const products = await response.json();

            const query = searchInput.value.toLowerCase().trim();
            const product = products.find(p =>
                p.name.toLowerCase().includes(query) ||
                (p.id && p.id.toLowerCase().includes(query))
            );

            if (!product) {
                alert('Product not found. Try a different search term.');
                return;
            }

            // Check if product is already selected
            if (this.selectedProducts.some(p => p.id === product.id)) {
                alert('This product is already in the comparison');
                return;
            }

            this.selectedProducts.push(product);
            searchInput.value = '';
            this.saveComparisonState();
            this.renderComparison();
        } catch (error) {
            console.error('Error fetching products:', error);
            alert('Error searching for products');
        }
    }

    /**
     * Remove a product from comparison
     */
    removeProduct(index) {
        this.selectedProducts.splice(index, 1);
        this.saveComparisonState();
        this.renderComparison();
    }

    /**
     * Clear all products from comparison
     */
    clearAllProducts() {
        this.selectedProducts = [];
        this.saveComparisonState();
        this.renderComparison();
    }

    /**
     * Render the comparison table
     */
    renderComparison() {
        this.updateCounter();

        if (this.selectedProducts.length === 0) {
            document.getElementById('compare-table-wrapper').style.display = 'none';
            document.getElementById('compare-empty').style.display = 'block';
            return;
        }

        document.getElementById('compare-empty').style.display = 'none';
        document.getElementById('compare-table-wrapper').style.display = 'block';

        // Render each product column
        this.selectedProducts.forEach((product, index) => {
            this.renderProductColumn(product, index);
        });

        // Clear empty columns
        for (let i = this.selectedProducts.length; i < this.maxProducts; i++) {
            this.clearProductColumn(i);
        }
    }

    /**
     * Render a product column in the comparison table
     */
    renderProductColumn(product, index) {
        // Product name/header
        const headerCell = document.getElementById(`compare-product-${index}`);
        if (headerCell) {
            const removeBtn = headerCell.querySelector('.compare-remove');
            headerCell.innerHTML = `
        <div class="compare-product-header">
          <h4>${this.escapeHtml(product.name)}</h4>
          ${removeBtn.outerHTML}
        </div>
      `;
        }

        // Image
        const imageCell = document.getElementById(`compare-image-${index}`);
        if (imageCell) {
            imageCell.innerHTML = `
        <img src="${this.escapeHtml(product.image)}" 
             alt="${this.escapeHtml(product.name)}" 
             class="compare-image" />
      `;
        }

        // Price
        const priceCell = document.getElementById(`compare-price-${index}`);
        if (priceCell) {
            const price = product.price ? `$${parseFloat(product.price).toFixed(2)}` : 'N/A';
            priceCell.innerHTML = `<span class="compare-price">${price}</span>`;
        }

        // Rating
        const ratingCell = document.getElementById(`compare-rating-${index}`);
        if (ratingCell) {
            const rating = product.rating ? `⭐ ${product.rating}/5` : 'No ratings';
            ratingCell.innerHTML = `<span class="compare-rating">${rating}</span>`;
        }

        // Description
        const descCell = document.getElementById(`compare-description-${index}`);
        if (descCell) {
            const desc = product.description || 'No description available';
            descCell.innerHTML = `<p>${this.escapeHtml(desc)}</p>`;
        }

        // Category
        const catCell = document.getElementById(`compare-category-${index}`);
        if (catCell) {
            const category = product.category || 'Uncategorized';
            catCell.innerHTML = `<span class="compare-category">${this.escapeHtml(category)}</span>`;
        }

        // Affiliate Link
        const linkCell = document.getElementById(`compare-link-${index}`);
        if (linkCell) {
            const link = product.link || '#';
            linkCell.innerHTML = `
        <a href="${this.escapeHtml(link)}" target="_blank" rel="noopener noreferrer" class="btn btn--primary btn--sm">
          View Deal
        </a>
      `;
        }
    }

    /**
     * Clear a product column
     */
    clearProductColumn(index) {
        document.getElementById(`compare-product-${index}`).innerHTML = '';
        document.getElementById(`compare-image-${index}`).innerHTML = '';
        document.getElementById(`compare-price-${index}`).innerHTML = '';
        document.getElementById(`compare-rating-${index}`).innerHTML = '';
        document.getElementById(`compare-description-${index}`).innerHTML = '';
        document.getElementById(`compare-category-${index}`).innerHTML = '';
        document.getElementById(`compare-link-${index}`).innerHTML = '';
    }

    /**
     * Update the product counter
     */
    updateCounter() {
        const countEl = document.getElementById('selected-count');
        if (countEl) {
            countEl.textContent = this.selectedProducts.length;
        }

        // Disable add button if max reached
        const addBtn = document.getElementById('add-product-btn');
        if (addBtn) {
            addBtn.disabled = this.selectedProducts.length >= this.maxProducts;
        }
    }

    /**
     * Save comparison state to localStorage
     */
    saveComparisonState() {
        try {
            localStorage.setItem(
                this.storageKey,
                JSON.stringify(this.selectedProducts.map(p => p.id))
            );
        } catch (error) {
            console.error('Error saving comparison state:', error);
        }
    }

    /**
     * Load comparison state from localStorage
     */
    async loadComparisonState() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (!saved) return;

            const productIds = JSON.parse(saved);
            if (!productIds.length) return;

            // Fetch products and restore selected ones
            const response = await fetch('/.netlify/functions/products');
            const products = await response.json();

            this.selectedProducts = productIds
                .map(id => products.find(p => p.id === id))
                .filter(p => p); // Remove undefined entries

        } catch (error) {
            console.error('Error loading comparison state:', error);
        }
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.compare = new Compare();
    });
} else {
    window.compare = new Compare();
}
