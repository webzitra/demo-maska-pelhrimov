/* ═══ MÁŠKA Pelhřimov — Main JS ═══ */
(function() {
    'use strict';

    /* ── Navbar scroll effect ── */
    const navbar = document.querySelector('.navbar');
    const logoDefault = document.querySelector('.logo-default');
    const logoScrolled = document.querySelector('.logo-scrolled');
    if (navbar) {
        const onScroll = () => {
            const scrolled = window.scrollY > 40;
            navbar.classList.toggle('scrolled', scrolled);
            if (logoDefault && logoScrolled) {
                logoDefault.style.opacity = scrolled ? '0' : '1';
                logoScrolled.style.opacity = scrolled ? '1' : '0';
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    /* ── Hamburger menu ── */
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('open');
            document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
        });
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('open') && !navLinks.contains(e.target) && !hamburger.contains(e.target)) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('open');
                document.body.style.overflow = '';
            }
        });
    }

    /* ── Scroll animations (fade-in) ── */
    const fadeEls = document.querySelectorAll('.fade-in');
    if (fadeEls.length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
        fadeEls.forEach(el => observer.observe(el));
    }

    /* ── Animated stats counter ── */
    const statNumbers = document.querySelectorAll('[data-count]');
    if (statNumbers.length) {
        const countObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseFloat(el.dataset.count);
                    const suffix = el.dataset.suffix || '';
                    const decimal = el.dataset.decimal === 'true';
                    const duration = 1500;
                    const start = performance.now();

                    function animate(now) {
                        const elapsed = now - start;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        const current = decimal
                            ? (eased * target).toFixed(1)
                            : Math.round(eased * target);
                        el.textContent = current + suffix;
                        if (progress < 1) requestAnimationFrame(animate);
                    }
                    requestAnimationFrame(animate);
                    countObserver.unobserve(el);
                }
            });
        }, { threshold: 0.5 });
        statNumbers.forEach(el => countObserver.observe(el));
    }

    /* ── Cookie banner ── */
    const cookieBanner = document.getElementById('cookie-banner');
    if (cookieBanner && !localStorage.getItem('maska-cookies')) {
        setTimeout(() => cookieBanner.classList.add('show'), 1500);
        const acceptBtn = document.getElementById('cookie-accept');
        const rejectBtn = document.getElementById('cookie-reject');
        const dismiss = () => {
            localStorage.setItem('maska-cookies', 'accepted');
            cookieBanner.classList.remove('show');
        };
        if (acceptBtn) acceptBtn.addEventListener('click', dismiss);
        if (rejectBtn) rejectBtn.addEventListener('click', dismiss);
    }

    /* ── Smooth scroll for anchor links ── */
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const id = link.getAttribute('href');
            if (id === '#') return;
            const target = document.querySelector(id);
            if (target) {
                e.preventDefault();
                const offset = navbar ? navbar.offsetHeight : 0;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    /* ── Gallery tabs ── */
    const tabBtns = document.querySelectorAll('[data-tab]');
    const tabPanels = document.querySelectorAll('[data-panel]');
    if (tabBtns.length && tabPanels.length) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                tabBtns.forEach(b => b.classList.toggle('active', b === btn));
                tabPanels.forEach(panel => {
                    panel.classList.toggle('active', panel.dataset.panel === tab);
                });
            });
        });
    }

    /* ── Lightbox ── */
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = lightbox ? lightbox.querySelector('.lightbox-img') : null;
    const lightboxClose = lightbox ? lightbox.querySelector('.lightbox-close') : null;
    const lightboxPrev = lightbox ? lightbox.querySelector('.lightbox-prev') : null;
    const lightboxNext = lightbox ? lightbox.querySelector('.lightbox-next') : null;
    let currentImages = [];
    let currentIndex = 0;

    function openLightbox(src, images, index) {
        if (!lightbox || !lightboxImg) return;
        currentImages = images;
        currentIndex = index;
        lightboxImg.src = src;
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
    }

    function navigateLightbox(dir) {
        if (!currentImages.length) return;
        currentIndex = (currentIndex + dir + currentImages.length) % currentImages.length;
        lightboxImg.src = currentImages[currentIndex];
    }

    document.querySelectorAll('.gallery-grid').forEach(grid => {
        const items = grid.querySelectorAll('.gallery-item');
        items.forEach((item, i) => {
            item.addEventListener('click', () => {
                const imgs = Array.from(items).map(el => el.querySelector('img').src);
                openLightbox(imgs[i], imgs, i);
            });
        });
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
    if (lightboxNext) lightboxNext.addEventListener('click', () => navigateLightbox(1));
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('open')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') navigateLightbox(-1);
            if (e.key === 'ArrowRight') navigateLightbox(1);
        });
    }

    /* ── Scroll to top ── */
    const scrollTop = document.getElementById('scroll-top');
    if (scrollTop) {
        window.addEventListener('scroll', () => {
            scrollTop.classList.toggle('visible', window.scrollY > 600);
        }, { passive: true });
        scrollTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ── Form handling ── */
    document.querySelectorAll('form[data-form]').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.textContent = 'Odesílám...';
            btn.disabled = true;

            setTimeout(() => {
                btn.textContent = 'Odesláno ✓';
                btn.style.background = '#22c55e';
                form.reset();
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = '';
                    btn.disabled = false;
                }, 3000);
            }, 1000);
        });
    });

})();
