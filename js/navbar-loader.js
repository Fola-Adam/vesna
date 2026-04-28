// Universal Navbar Loader - Injects the same navbar into all pages
(function () {
  // Determine root path based on current location
  const path = window.location.pathname;
  const isInPagesFolder = path.includes('/pages/');
  const root = isInPagesFolder ? '../' : '';

  // Fetch and inject navbar
  fetch(root + 'components/navbar.html')
    .then(response => response.text())
    .then(html => {
      // Replace {{root}} placeholder with actual root path
      const processedHtml = html.replace(/\{\{root\}\}/g, root);

      // Find placeholder or inject at body start
      const placeholder = document.getElementById('navbar-placeholder');
      if (placeholder) {
        placeholder.outerHTML = processedHtml;
      } else {
        // Insert after scroll progress or before main content
        const scrollProgress = document.getElementById('scroll-progress');
        if (scrollProgress) {
          scrollProgress.insertAdjacentHTML('afterend', processedHtml);
        } else {
          const main = document.querySelector('main');
          if (main) {
            main.insertAdjacentHTML('beforebegin', processedHtml);
          }
        }
      }

      // Execute embedded active state logic
      highlightActiveNav();

      // Mobile menu toggle
      const mobileBtn = document.getElementById('mobile-menu-btn');
      if (mobileBtn) {
        mobileBtn.addEventListener('click', function () {
          const menu = document.getElementById('mobile-menu');
          const isExpanded = this.getAttribute('aria-expanded') === 'true';
          this.setAttribute('aria-expanded', !isExpanded);
          menu.classList.toggle('hidden');
        });
      }
    })
    .catch(error => console.error('Failed to load navbar:', error));

  // Highlight active navigation based on current page
  function highlightActiveNav() {
    const page = path.split('/').pop().replace('.html', '') || 'index';
    const navMap = {
      'index': 'home',
      'picks': 'picks',
      'collections': 'archive',
      'atelier': 'archive',
      'archive': 'archive',
      'product': 'atelier',
      'guide': 'journal',
      'journal': 'journal',
      'about': 'about'
    };
    const activeNav = navMap[page];
    if (activeNav) {
      document.querySelectorAll('[data-nav="' + activeNav + '"]').forEach(link => {
        // Remove default styling
        link.classList.remove('text-on-surface-variant');
        link.classList.remove('hover:text-on-background');
        link.classList.remove('nav-underline-anim');

        // Add active styling - green color and underline
        link.classList.add('text-secondary');
        if (link.closest('#desktop-nav')) {
          link.classList.add('border-b', 'border-secondary', 'pb-1');
        } else {
          link.classList.add('text-on-background');
        }
      });
    }
  }
})();
