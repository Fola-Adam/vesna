// Mobile Bottom Navigation Loader - Injects mobile nav into all pages
(function () {
  // Determine root path based on current location
  const path = window.location.pathname;
  const isInPagesFolder = path.includes('/pages/');
  const root = isInPagesFolder ? '../' : '';

  // Fetch and inject mobile bottom navigation
  fetch(root + 'components/mobile-bottom-nav.html')
    .then(response => response.text())
    .then(html => {
      // Replace {{root}} placeholder with actual root path
      const processedHtml = html.replace(/\{\{root\}\}/g, root);

      // Insert before closing body tag or at end of body
      const body = document.body;
      if (body) {
        body.insertAdjacentHTML('beforeend', processedHtml);
      }

      // Execute embedded active state logic after injection
      highlightActiveBottomNav();
    })
    .catch(error => console.error('Failed to load mobile nav:', error));

  // Highlight active bottom navigation based on current page
  function highlightActiveBottomNav() {
    const page = path.split('/').pop().replace('.html', '') || 'index';
    const navMap = {
      'index': 'home',
      'picks': 'picks',
      'collections': 'collections',
      'product': 'picks',
      'guide': 'picks',
      'journal': 'picks',
      'about': 'picks',
      'atelier': 'picks'
    };
    const activeNav = navMap[page];
    if (activeNav) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        document.querySelectorAll('.mobile-nav a[data-nav="' + activeNav + '"]').forEach(link => {
          link.classList.add('active');
        });
      }, 100);
    }
  }
})();
