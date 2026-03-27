/**
 * Onboarding Guide Module
 * First-visit interactive tour with 7 steps using raven mascots
 * Navigates user to relevant pages/features with each step
 */

const Onboarding = {
    storageKey: 'vesna_onboarding_completed',
    currentStep: 0,

    steps: [
        {
            id: 'welcome',
            title: 'Welcome to Vesna',
            description: 'Your personal guide to curated digital products. Let\'s explore together!',
            raven: 'animal.png',
            action: 'home',
            highlight: '.hero__title'
        },
        {
            id: 'search',
            title: 'Search & Filter',
            description: 'Find exactly what you need using our powerful search and filter options. Try searching by category, price, or keywords.',
            raven: 'black.png',
            action: 'products',
            highlight: '.search-input'
        },
        {
            id: 'wishlist',
            title: 'Save to Wishlist',
            description: 'Click the ♥️ icon on any product to save it to your personal wishlist. Access it anytime to compare or purchase later.',
            raven: 'magic.png',
            action: 'products',
            highlight: '.btn-icon--wishlist'
        },
        {
            id: 'product-details',
            title: 'Explore Product Details',
            description: 'Click any product to see full details, user ratings, reviews, and affiliate links to make informed decisions.',
            raven: 'nature (1).png',
            action: 'products',
            highlight: '.product-card'
        },
        {
            id: 'compare',
            title: 'Compare Products',
            description: 'Want to decide between options? Head to the Compare page to view up to 4 products side-by-side with all specifications.',
            raven: 'nature.png',
            action: 'compare',
            highlight: '.compare-hero'
        },
        {
            id: 'categories',
            title: 'Browse by Category',
            description: 'Explore our curated collections organized by category. Each category features handpicked products from that niche.',
            raven: 'raven.png',
            action: 'products',
            highlight: '.category-filter'
        },
        {
            id: 'settings',
            title: 'Customize Your Experience',
            description: 'Use the theme toggle (☀️/🌙) in the navigation to switch between light and dark mode. Your preference is saved automatically.',
            raven: 'sky.png',
            action: 'home',
            highlight: '.nav__theme-toggle'
        }
    ],

    /**
     * Initialize onboarding
     */
    init() {
        if (this.hasCompletedOnboarding()) {
            return;
        }

        // Show onboarding on first visit
        this.create();
        this.show();
    },

    /**
     * Check if user has completed onboarding
     */
    hasCompletedOnboarding() {
        return localStorage.getItem(this.storageKey) === 'true';
    },

    /**
     * Mark onboarding as completed
     */
    markCompleted() {
        localStorage.setItem(this.storageKey, 'true');
    },

    /**
     * Create the onboarding modal
     */
    create() {
        if (document.getElementById('onboarding-overlay')) {
            return; // Already created
        }

        const overlay = document.createElement('div');
        overlay.id = 'onboarding-overlay';
        overlay.className = 'onboarding-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-hidden', 'true');
        overlay.innerHTML = `
      <div class="onboarding-modal">
        <button class="onboarding-close" aria-label="Close guide">✕</button>
        
        <div class="onboarding-raven">
          <img id="onboarding-raven-img" src="img/animal.png" alt="Vesna Guide" />
        </div>

        <div class="onboarding-content">
          <h2 id="onboarding-title">Welcome to Vesna</h2>
          <p id="onboarding-description">Your personal guide to curated digital products. Let's explore together!</p>
        </div>

        <div class="onboarding-progress">
          <div class="onboarding-dots">
            ${this.steps.map((_, i) => `<span class="onboarding-dot ${i === 0 ? 'active' : ''}" data-step="${i}"></span>`).join('')}
          </div>
          <span class="onboarding-counter"><span id="onboarding-current">1</span>/<span id="onboarding-total">${this.steps.length}</span></span>
        </div>

        <div class="onboarding-actions">
          <button id="onboarding-skip" class="btn btn--outline btn--sm">Skip</button>
          <button id="onboarding-next" class="btn btn--primary btn--sm">Next</button>
        </div>
      </div>
    `;

        document.body.appendChild(overlay);
        this.attachEventListeners();
    },

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        const nextBtn = document.getElementById('onboarding-next');
        const skipBtn = document.getElementById('onboarding-skip');
        const closeBtn = document.querySelector('.onboarding-close');
        const dots = document.querySelectorAll('.onboarding-dot');

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.next());
        }

        if (skipBtn) {
            skipBtn.addEventListener('click', () => this.complete());
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.complete());
        }

        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                const step = parseInt(e.target.dataset.step);
                this.goToStep(step);
            });
        });
    },

    /**
     * Show the onboarding overlay
     */
    show() {
        const overlay = document.getElementById('onboarding-overlay');
        if (overlay) {
            overlay.classList.add('visible');
            overlay.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }
    },

    /**
     * Hide the onboarding overlay
     */
    hide() {
        const overlay = document.getElementById('onboarding-overlay');
        if (overlay) {
            overlay.classList.remove('visible');
            overlay.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
        this.removeSpotlightOverlay();
    },

    /**
     * Go to specific step
     */
    async goToStep(stepIndex) {
        if (stepIndex < 0 || stepIndex >= this.steps.length) {
            return;
        }

        // Clean up previous spotlight before moving
        this.removeSpotlightOverlay();

        this.currentStep = stepIndex;
        // ...existing code...
        if (nextBtn) {
            nextBtn.textContent = stepIndex === this.steps.length - 1 ? 'Finish' : 'Next';
        }

        // Navigate to relevant page
        await this.navigateToStep(step);
    },

    /**
     * Navigate to the relevant page/section for this step
     */
    async navigateToStep(step) {
        const currentPage = this.getCurrentPage();

        if (step.action === 'home' && currentPage !== 'home') {
            window.location.href = '../index.html';
            return;
        }

        if (step.action === 'products' && currentPage !== 'products') {
            window.location.href = 'products.html';
            return;
        }

        if (step.action === 'compare' && currentPage !== 'compare') {
            window.location.href = 'compare.html';
            return;
        }

        // Same page - just highlight the relevant element
        await this.highlightElement(step.highlight);
    },

    /**
     * Highlight the relevant element with enhanced spotlight effect
     */
    async highlightElement(selector) {
        if (!selector) return;

        // Remove any existing highlight
        document.querySelectorAll('.onboarding-highlight').forEach(el => {
            el.classList.remove('onboarding-highlight');
        });

        // Wait for element to be available
        let element = document.querySelector(selector);
        let attempts = 0;
        while (!element && attempts < 30) {
            await new Promise(r => setTimeout(r, 100));
            element = document.querySelector(selector);
            attempts++;
        }

        if (element) {
            // Calculate position for smooth scroll
            const elementRect = element.getBoundingClientRect();
            const isElementVisible = (
                elementRect.top >= 0 &&
                elementRect.left >= 0 &&
                elementRect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                elementRect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );

            // Only scroll if element is not fully visible
            if (!isElementVisible) {
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'nearest'
                });
            }

            // Add highlight with stronger effect
            element.classList.add('onboarding-highlight');

            // Add click-through overlay for mobile
            this.addSpotlightOverlay(element);
        }
    },

    /**
     * Add a semi-transparent overlay that spotlights the element
     */
    addSpotlightOverlay(element) {
        // Remove existing spotlight
        const existingSpotlight = document.getElementById('onboarding-spotlight');
        if (existingSpotlight) {
            existingSpotlight.remove();
        }

        const rect = element.getBoundingClientRect();
        const spotlight = document.createElement('div');
        spotlight.id = 'onboarding-spotlight';
        spotlight.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 10000;
            background: radial-gradient(
                circle at ${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px,
                transparent 0px,
                transparent ${Math.max(rect.width, rect.height) / 2}px,
                rgba(0, 0, 0, 0.7) ${Math.max(rect.width, rect.height) / 2 + 20}px
            );
            transition: background 0.3s ease;
        `;

        document.body.appendChild(spotlight);
    },

    /**
     * Remove spotlight overlay
     */
    removeSpotlightOverlay() {
        const spotlight = document.getElementById('onboarding-spotlight');
        if (spotlight) {
            spotlight.remove();
        }
    },

    /**
     * Get current page identifier
     */
    getCurrentPage() {
        const path = window.location.pathname.toLowerCase();
        if (path.includes('compare')) return 'compare';
        if (path.includes('products')) return 'products';
        if (path.includes('guide')) return 'guide';
        if (path.includes('about')) return 'about';
        return 'home';
    },

    /**
     * Go to next step
     */
    next() {
        if (this.currentStep < this.steps.length - 1) {
            this.goToStep(this.currentStep + 1);
        } else {
            this.complete();
        }
    },

    /**
     * Complete onboarding
     */
    complete() {
        this.hide();
        this.markCompleted();
        // Optional: show a small toast or notification
        if (window.Components && window.Components.toast) {
            window.Components.toast('Tour complete! Explore Vesna and enjoy.', 'success', 2000);
        }
    }
};

// Initialize onboarding when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Delay initialization to let other modules load
        setTimeout(() => {
            Onboarding.init();
        }, 500);
    });
} else {
    setTimeout(() => {
        Onboarding.init();
    }, 500);
}
