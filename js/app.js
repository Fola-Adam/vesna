// Vesna JavaScript
document.addEventListener('DOMContentLoaded', () => {
    console.log('Vesna JS loaded');

    // Note: Loading screen is controlled by typewriter animation in index.html

    // Newsletter Form Validation
    const newsletterForm = document.getElementById('newsletter-form');
    const newsletterEmail = document.getElementById('newsletter-email');
    const emailError = document.getElementById('email-error');
    const newsletterSuccess = document.getElementById('newsletter-success');
    const newsletterSubtitle = document.getElementById('newsletter-subtitle');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = newsletterEmail.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(email)) {
                emailError.classList.remove('hidden');
                newsletterEmail.classList.add('border-red-500');
                return;
            }

            // Valid email - show success
            emailError.classList.add('hidden');
            newsletterEmail.classList.remove('border-red-500');
            newsletterForm.classList.add('hidden');
            newsletterSuccess.classList.remove('hidden');
            newsletterSubtitle.textContent = 'Thank you for joining our community of discerning readers.';

            // Optional: Confetti effect
            createConfetti();
        });

        newsletterEmail.addEventListener('input', () => {
            emailError.classList.add('hidden');
            newsletterEmail.classList.remove('border-red-500');
        });
    }

    // Simple confetti function
    function createConfetti() {
        const colors = ['#e6c364', '#ffffff', '#8b7355'];
        for (let i = 0; i < 30; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 8px;
                height: 8px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: 50%;
                top: 50%;
                pointer-events: none;
                z-index: 9999;
                animation: confetti-fall 1s ease-out forwards;
            `;
            confetti.style.transform = `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`;
            document.body.appendChild(confetti);

            setTimeout(() => confetti.remove(), 1000);
        }
    }

    // Add confetti animation CSS dynamically
    if (!document.getElementById('confetti-style')) {
        const style = document.createElement('style');
        style.id = 'confetti-style';
        style.textContent = `
            @keyframes confetti-fall {
                0% { transform: translate(-50%, -50%) rotate(0deg); opacity: 1; }
                100% { 
                    transform: translate(
                        calc(-50% + ${Math.random() * 400 - 200}px), 
                        calc(-50% + ${Math.random() * 300 + 100}px)
                    ) rotate(${Math.random() * 720}deg); 
                    opacity: 0; 
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Sticky Navigation - Solid background on scroll
    const mainNav = document.getElementById('main-nav');
    const scrollProgress = document.getElementById('scroll-progress');

    // Consolidated scroll handler with rAF throttle
    let ticking = false;
    function handleScroll() {
        const scrollY = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollY / docHeight) * 100;

        // Update scroll progress bar
        if (scrollProgress) {
            scrollProgress.style.width = scrollPercent + '%';
        }

        // Update navigation background
        if (mainNav) {
            if (scrollY > 100) {
                mainNav.classList.add('bg-neutral-950', 'shadow-lg');
                mainNav.classList.remove('bg-neutral-950/80');
            } else {
                mainNav.classList.remove('bg-neutral-950', 'shadow-lg');
                mainNav.classList.add('bg-neutral-950/80');
            }
        }

        // Hero images subtle scale effect
        if (heroImg1 && heroImg2) {
            const maxScroll = window.innerHeight;
            const scale = Math.max(1, 1 + (scrollY / maxScroll) * 0.1);
            heroImg1.style.transform = `scale(${scale})`;
            heroImg2.style.transform = `scale(${scale})`;
        }

        // Back to Top Button visibility
        if (backToTopBtn) {
            if (scrollY > 500) {
                backToTopBtn.classList.remove('opacity-0', 'invisible');
                backToTopBtn.classList.add('opacity-100', 'visible');
            } else {
                backToTopBtn.classList.add('opacity-0', 'invisible');
                backToTopBtn.classList.remove('opacity-100', 'visible');
            }
        }

        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(handleScroll);
            ticking = true;
        }
    }, { passive: true });

    // Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Product Quick View Modal
    const modal = document.getElementById('quick-view-modal');
    const modalBackdrop = document.getElementById('modal-backdrop');
    const modalContent = document.getElementById('modal-content');
    const modalBody = document.getElementById('modal-body');
    const modalClose = document.getElementById('modal-close');

    // Product data
    const products = [
        {
            id: 1,
            name: 'Mechanical Keyboard',
            description: 'Heavy brass weight, zero drift. Premium switches with custom keycaps for the discerning typist.',
            price: '$299',
            image: 'vesna-imgs/coloured-keyboard.png',
            badge: 'Featured'
        },
        {
            id: 2,
            name: 'Leather Journal',
            description: 'Hand-dyed Tuscan leather with hand-stitched binding. A timeless companion for your thoughts.',
            price: '$149',
            image: 'vesna-imgs/vintage-brown-leather.png',
            badge: 'New'
        },
        {
            id: 3,
            name: 'Ceramic Vessel',
            description: 'Hand-thrown in Kyoto by master artisans. Each piece is unique with subtle variations.',
            price: '$189',
            image: 'vesna-imgs/native-cinematic-vase.png',
            badge: null
        },
        {
            id: 4,
            name: 'Architect Lamp',
            description: 'Solid brass with adjustable arm. Inspired by mid-century modern design principles.',
            price: '$349',
            image: 'vesna-imgs/golden-desklamp.png',
            badge: null
        },
        {
            id: 5,
            name: 'Porcelain Mug',
            description: 'Handcrafted with speckled glaze. Perfect for your morning ritual.',
            price: '$79',
            image: 'vesna-imgs/coffee-maker-1.png',
            badge: 'Featured'
        },
        {
            id: 6,
            name: 'Oak Serving Tray',
            description: 'Natural finish with brass handles. Elegant and functional for entertaining.',
            price: '$129',
            image: 'vesna-imgs/minimal-workdesk.png',
            badge: null
        }
    ];

    function openModal(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const badgeHtml = product.badge ? `<span class="badge badge-${product.badge.toLowerCase()}">${product.badge}</span>` : '';

        modalBody.innerHTML = `
            <div class="grid md:grid-cols-2 gap-8 lg:gap-12">
                <div class="relative">
                    ${badgeHtml}
                    <img src="${product.image}" alt="${product.name}" class="w-full h-auto object-cover rounded-lg" />
                </div>
                <div class="flex flex-col justify-center">
                    <h2 class="font-display-hero text-3xl lg:text-4xl text-on-background mb-4">${product.name}</h2>
                    <p class="font-body text-lg text-outline mb-6">${product.description}</p>
                    <p class="font-display text-2xl text-primary mb-8">${product.price}</p>
                    <button class="btn-primary font-button-label text-sm tracking-[0.2em] py-4 px-8 hover:bg-primary/80 transition-all focus-ring">
                        VIEW DETAILS
                    </button>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');
        // Trigger animation
        setTimeout(() => {
            modalBackdrop.classList.remove('opacity-0');
            modalContent.querySelector('.bg-surface-container').classList.remove('scale-95', 'opacity-0');
            modalContent.querySelector('.bg-surface-container').classList.add('scale-100', 'opacity-100');
        }, 10);

        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modalBackdrop.classList.add('opacity-0');
        modalContent.querySelector('.bg-surface-container').classList.add('scale-95', 'opacity-0');
        modalContent.querySelector('.bg-surface-container').classList.remove('scale-100', 'opacity-100');

        setTimeout(() => {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }, 300);
    }

    // Add click handlers to product cards
    document.querySelectorAll('.slider-item').forEach((item, index) => {
        item.addEventListener('click', () => {
            openModal(index + 1);
        });
    });

    // Close modal handlers
    modalClose.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });

    // Animated Statistics Counter
    const statObjects = document.getElementById('stat-objects');
    const statCategories = document.getElementById('stat-categories');
    const statRating = document.getElementById('stat-rating');
    const statSubs = document.getElementById('stat-subs');

    const stats = [
        { element: statObjects, target: 50, suffix: '+', duration: 2000 },
        { element: statCategories, target: 12, suffix: '', duration: 1500 },
        { element: statRating, target: 4.9, suffix: '', duration: 2000, isDecimal: true },
        { element: statSubs, target: 2000, suffix: '+', duration: 2500 }
    ];

    function animateCounter(stat) {
        const startTime = performance.now();
        const startValue = 0;

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / stat.duration, 1);

            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = startValue + (stat.target - startValue) * easeOut;

            if (stat.isDecimal) {
                stat.element.textContent = currentValue.toFixed(1);
            } else {
                stat.element.textContent = Math.floor(currentValue) + stat.suffix;
            }

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    // Intersection Observer to trigger animation when stats are visible
    const statsSection = document.getElementById('stats-section');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    stats.forEach(stat => {
                        if (stat.element) animateCounter(stat);
                    });
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statsObserver.observe(statsSection);
    }

    // Testimonials Carousel
    const testimonialsTrack = document.getElementById('testimonials-track');
    const testimonialDots = document.querySelectorAll('.testimonial-dot');
    const testimonialPrev = document.getElementById('testimonial-prev');
    const testimonialNext = document.getElementById('testimonial-next');

    if (testimonialsTrack && testimonialDots.length > 0) {
        let currentTestimonial = 0;
        const totalTestimonials = testimonialDots.length;
        let autoSlideInterval;

        function goToTestimonial(index) {
            currentTestimonial = index;
            testimonialsTrack.style.transform = `translateX(-${index * 100}%)`;

            testimonialDots.forEach((dot, i) => {
                dot.classList.toggle('bg-primary', i === index);
                dot.classList.toggle('bg-outline/30', i !== index);
            });
        }

        function nextTestimonial() {
            goToTestimonial((currentTestimonial + 1) % totalTestimonials);
        }

        function prevTestimonial() {
            goToTestimonial((currentTestimonial - 1 + totalTestimonials) % totalTestimonials);
        }

        // Dot navigation
        testimonialDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                goToTestimonial(index);
                resetAutoSlide();
            });
        });

        // Arrow navigation
        if (testimonialPrev) {
            testimonialPrev.addEventListener('click', () => {
                prevTestimonial();
                resetAutoSlide();
            });
        }

        if (testimonialNext) {
            testimonialNext.addEventListener('click', () => {
                nextTestimonial();
                resetAutoSlide();
            });
        }

        // Auto-slide
        function startAutoSlide() {
            autoSlideInterval = setInterval(nextTestimonial, 5000);
        }

        function resetAutoSlide() {
            clearInterval(autoSlideInterval);
            startAutoSlide();
        }

        startAutoSlide();

        // Touch swipe support
        let touchStartX = 0;
        let touchEndX = 0;

        testimonialsTrack.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        testimonialsTrack.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    nextTestimonial();
                } else {
                    prevTestimonial();
                }
                resetAutoSlide();
            }
        }, { passive: true });
    }

    // Hero images for scroll handler
    const heroImg1 = document.getElementById('hero-img-1');
    const heroImg2 = document.getElementById('hero-img-2');

    // Back to Top Button
    const backToTopBtn = document.getElementById('back-to-top');

    if (backToTopBtn) {
        // Scroll to top on click
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
            mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Scroll Reveal Animations
    const revealElements = document.querySelectorAll('.reveal');

    function revealElement(el) {
        el.classList.add('active');
    }

    if (revealElements.length > 0) {
        // First: reveal elements already visible on page load
        revealElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            if (isVisible) {
                revealElement(el);
            }
        });

        // Then: observe elements not yet visible
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    revealElement(entry.target);
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0,
            rootMargin: '0px'
        });

        revealElements.forEach(el => {
            if (!el.classList.contains('active')) {
                revealObserver.observe(el);
            }
        });
    }

    // Stagger Reveal for Product Cards
    const staggerElements = document.querySelectorAll('.stagger-reveal');

    if (staggerElements.length > 0) {
        // Reveal already visible stagger elements
        staggerElements.forEach((el, index) => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                setTimeout(() => el.classList.add('active'), index * 100);
            }
        });

        // Observe remaining
        const staggerObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    staggerObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0,
            rootMargin: '0px'
        });

        staggerElements.forEach(el => {
            if (!el.classList.contains('active')) {
                staggerObserver.observe(el);
            }
        });
    }

    // Product Slider with Infinite Scroll & Auto-play
    const slider = document.getElementById('product-slider');
    const prevBtn = document.getElementById('slider-prev');
    const nextBtn = document.getElementById('slider-next');
    const dots = document.querySelectorAll('.slider-dot');
    const progressBar = document.getElementById('slider-progress');

    if (slider && prevBtn && nextBtn) {
        // Clone items for true infinite scroll
        const originalItems = slider.querySelectorAll('.slider-item');
        const itemCount = originalItems.length;
        let autoScrollInterval;
        let isPaused = false;
        const AUTO_SCROLL_DELAY = 4000; // 4 seconds between auto-scrolls

        // Clone first 3 items and append to end
        for (let i = 0; i < Math.min(3, itemCount); i++) {
            const clone = originalItems[i].cloneNode(true);
            clone.classList.add('clone-item');
            slider.appendChild(clone);
        }

        // Clone last 3 items and prepend to beginning
        for (let i = Math.max(0, itemCount - 3); i < itemCount; i++) {
            const clone = originalItems[i].cloneNode(true);
            clone.classList.add('clone-item');
            slider.insertBefore(clone, slider.firstChild);
        }

        // Set initial scroll position to start of original items (after clones)
        function setInitialPosition() {
            const firstOriginal = originalItems[0];
            const gap = parseInt(window.getComputedStyle(slider).gap) || 32;
            const cardWidth = firstOriginal.offsetWidth + gap;
            // Scroll past the 3 cloned items at the start
            slider.scrollLeft = cardWidth * 3;
        }

        // Wait for layout then set position
        setTimeout(setInitialPosition, 100);
        window.addEventListener('resize', setInitialPosition);

        // Get card width including gap
        function getCardWidth() {
            const firstCard = slider.querySelector('.slider-item:not(.clone-item)');
            if (!firstCard) return 280;
            const gap = parseInt(window.getComputedStyle(slider).gap) || 32;
            return firstCard.offsetWidth + gap;
        }

        // Navigate with infinite loop
        function goToCard(direction) {
            const cardWidth = getCardWidth();
            const currentScroll = slider.scrollLeft;
            const totalOriginal = itemCount;
            const maxOriginalScroll = cardWidth * (totalOriginal + 3); // +3 for leading clones

            let targetScroll;
            if (direction === 'next') {
                targetScroll = currentScroll + cardWidth;

                // Check if we're at the end of original items
                if (targetScroll >= maxOriginalScroll) {
                    // Instantly jump to beginning (past leading clones) without animation
                    slider.style.scrollBehavior = 'auto';
                    slider.scrollLeft = cardWidth * 3;
                    // Reset to smooth for next scroll
                    slider.style.scrollBehavior = 'smooth';
                    // Then scroll one more smoothly
                    setTimeout(() => {
                        slider.scrollLeft = cardWidth * 4;
                    }, 10);
                    return;
                }
            } else {
                targetScroll = currentScroll - cardWidth;

                // Check if we're at the beginning of original items
                if (targetScroll <= cardWidth * 2) {
                    // Instantly jump to end (before trailing clones) without animation
                    const endScroll = cardWidth * (totalOriginal + 2);
                    slider.style.scrollBehavior = 'auto';
                    slider.scrollLeft = endScroll;
                    // Reset to smooth for next scroll
                    slider.style.scrollBehavior = 'smooth';
                    // Then scroll one more back smoothly
                    setTimeout(() => {
                        slider.scrollLeft = endScroll - cardWidth;
                    }, 10);
                    return;
                }
            }

            slider.scrollTo({ left: targetScroll, behavior: 'smooth' });
        }

        // Auto-scroll functionality
        function startAutoScroll() {
            stopAutoScroll();
            autoScrollInterval = setInterval(() => {
                if (!isPaused) {
                    goToCard('next');
                }
            }, AUTO_SCROLL_DELAY);
        }

        function stopAutoScroll() {
            if (autoScrollInterval) {
                clearInterval(autoScrollInterval);
                autoScrollInterval = null;
            }
        }

        // Pause on hover
        slider.addEventListener('mouseenter', () => {
            isPaused = true;
        });

        slider.addEventListener('mouseleave', () => {
            isPaused = false;
        });

        // Pause on touch (mobile)
        slider.addEventListener('touchstart', () => {
            isPaused = true;
        }, { passive: true });

        slider.addEventListener('touchend', () => {
            setTimeout(() => {
                isPaused = false;
            }, 2000); // Resume after 2 seconds
        }, { passive: true });

        // Navigation buttons
        prevBtn.addEventListener('click', () => {
            goToCard('prev');
            stopAutoScroll();
            startAutoScroll(); // Reset timer
        });

        nextBtn.addEventListener('click', () => {
            goToCard('next');
            stopAutoScroll();
            startAutoScroll(); // Reset timer
        });

        // Update dots and progress on scroll
        slider.addEventListener('scroll', () => {
            const cardWidth = getCardWidth();
            const scrollLeft = slider.scrollLeft;
            const adjustedScroll = scrollLeft - (cardWidth * 3); // Adjust for clones
            const maxScroll = cardWidth * itemCount;
            const scrollPercent = Math.max(0, Math.min(1, adjustedScroll / maxScroll));
            const activeIndex = Math.min(Math.floor(scrollPercent * dots.length), dots.length - 1);

            dots.forEach((dot, i) => {
                dot.classList.toggle('bg-primary', i === activeIndex);
                dot.classList.toggle('bg-outline/30', i !== activeIndex);
            });

            // Update progress bar
            if (progressBar) {
                const progress = 33.33 + (scrollPercent * 66.66);
                progressBar.style.width = `${Math.min(progress, 100)}%`;
            }
        });

        // Touch swipe gestures
        let touchStartX = 0;
        let touchEndX = 0;

        slider.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        slider.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    goToCard('next');
                } else {
                    goToCard('prev');
                }
                stopAutoScroll();
                startAutoScroll();
            }
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            const rect = slider.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

            if (isVisible) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    goToCard('prev');
                    stopAutoScroll();
                    startAutoScroll();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    goToCard('next');
                    stopAutoScroll();
                    startAutoScroll();
                }
            }
        });

        // Click on dots to navigate
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                const cardWidth = getCardWidth();
                // Navigate to corresponding original item (skip 3 clones)
                const targetScroll = cardWidth * (3 + index);
                slider.scrollTo({ left: targetScroll, behavior: 'smooth' });
                stopAutoScroll();
                startAutoScroll();
            });
            dot.style.cursor = 'pointer';
        });

        // Start auto-scroll
        startAutoScroll();

        // Stop auto-scroll when tab is hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                stopAutoScroll();
            } else {
                startAutoScroll();
            }
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Mobile nav active state
    const mobileNavLinks = document.querySelectorAll('.mobile-nav a');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    mobileNavLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop();
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Text Scramble Effect for VESNA
    const scrambleElements = document.querySelectorAll('.scramble-text');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    scrambleElements.forEach(el => {
        const originalText = el.getAttribute('data-text');
        let iteration = 0;
        let interval = null;
        let isAnimating = false;

        function scramble() {
            if (isAnimating) return;
            isAnimating = true;
            iteration = 0;
            clearInterval(interval);

            interval = setInterval(() => {
                el.innerText = originalText
                    .split('')
                    .map((char, index) => {
                        if (index < iteration) {
                            return originalText[index];
                        }
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join('');

                if (iteration >= originalText.length) {
                    clearInterval(interval);
                    isAnimating = false;
                }

                iteration += 1 / 3;
            }, 30);
        }

        // Trigger on hover
        el.parentElement.addEventListener('mouseenter', scramble);

        // Trigger once on page load after loading screen
        setTimeout(() => {
            scramble();
        }, 1500);
    });

    // Image Lightbox
    const lightbox = document.getElementById('image-lightbox');
    const lightboxBackdrop = document.getElementById('lightbox-backdrop');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxClose = document.getElementById('lightbox-close');

    if (lightbox && lightboxImage) {
        // Collect all zoomable images
        const zoomableImages = document.querySelectorAll('.product-image-zoom, .category-image-zoom');
        let currentImageIndex = 0;
        const imageList = Array.from(zoomableImages);

        function openLightbox(index) {
            currentImageIndex = index;
            const img = imageList[index];
            if (!img) return;

            lightboxImage.src = img.src;
            lightboxImage.alt = img.alt;
            lightbox.classList.remove('hidden');

            // Animation
            setTimeout(() => {
                lightboxBackdrop.classList.remove('opacity-0');
                lightboxImage.classList.remove('scale-95', 'opacity-0');
                lightboxImage.classList.add('scale-100', 'opacity-100');
            }, 10);

            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            lightboxBackdrop.classList.add('opacity-0');
            lightboxImage.classList.add('scale-95', 'opacity-0');
            lightboxImage.classList.remove('scale-100', 'opacity-100');

            setTimeout(() => {
                lightbox.classList.add('hidden');
                document.body.style.overflow = '';
            }, 300);
        }

        // Add click handlers to all zoomable images
        zoomableImages.forEach((img, index) => {
            img.style.cursor = 'zoom-in';
            img.addEventListener('click', () => openLightbox(index));
        });

        // Close handlers
        lightboxClose.addEventListener('click', closeLightbox);
        lightboxBackdrop.addEventListener('click', closeLightbox);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !lightbox.classList.contains('hidden')) {
                closeLightbox();
            }
        });
    }
}); // End DOMContentLoaded
