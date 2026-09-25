/* ============================================
   UPRIGHT FENCING HAWAII LLC - Main JS
   ============================================ */

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* --- DOM Ready --- */
  document.addEventListener('DOMContentLoaded', function () {

    /* --- Mobile Navigation --- */
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileOverlay = document.querySelector('.mobile-overlay');

    function toggleMobileMenu() {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      mobileOverlay.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    }

    if (hamburger) {
      hamburger.addEventListener('click', toggleMobileMenu);
    }
    if (mobileOverlay) {
      mobileOverlay.addEventListener('click', toggleMobileMenu);
    }

    // Close mobile menu on link click
    if (mobileMenu) {
      mobileMenu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          if (mobileMenu.classList.contains('active')) toggleMobileMenu();
        });
      });
    }

    /* --- Header Scroll --- */
    var header = document.querySelector('.site-header');
    if (header) {
      window.addEventListener('scroll', function () {
        header.classList.toggle('scrolled', window.scrollY > 50);
      });
    }

    /* --- FAQ Accordion --- */
    document.querySelectorAll('.faq-question').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = this.closest('.faq-item');
        var answer = item.querySelector('.faq-answer');
        var isActive = item.classList.contains('active');

        // Close all
        document.querySelectorAll('.faq-item.active').forEach(function (openItem) {
          openItem.classList.remove('active');
          openItem.querySelector('.faq-answer').style.maxHeight = null;
          openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        });

        // Open clicked if it was closed
        if (!isActive) {
          item.classList.add('active');
          answer.style.maxHeight = answer.scrollHeight + 'px';
          this.setAttribute('aria-expanded', 'true');
        }
      });
    });

    /* --- Gallery Filter --- */
    var filterBtns = document.querySelectorAll('.filter-btn');
    var galleryItems = document.querySelectorAll('.gallery-item');

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = this.getAttribute('data-filter');

        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');

        galleryItems.forEach(function (item) {
          if (filter === 'all' || item.getAttribute('data-category') === filter) {
            item.classList.remove('hidden');
          } else {
            item.classList.add('hidden');
          }
        });
      });
    });

    /* --- Lightbox --- */
    var lightbox = document.querySelector('.lightbox');
    var lightboxImg = lightbox ? lightbox.querySelector('img') : null;
    var lightboxClose = lightbox ? lightbox.querySelector('.lightbox-close') : null;

    document.querySelectorAll('.gallery-item').forEach(function (item) {
      item.addEventListener('click', function () {
        var img = this.querySelector('img');
        if (lightbox && lightboxImg && img) {
          // Use the highest resolution version
          var src = img.getAttribute('data-full') || img.src;
          lightboxImg.src = src;
          lightboxImg.alt = img.alt;
          lightbox.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      });
    });

    function closeLightbox() {
      if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
      }
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightbox) {
      lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) closeLightbox();
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLightbox();
    });

    /* --- Dynamic Year --- */
    document.querySelectorAll('.current-year').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });

    /* --- GSAP Animations --- */
    if (!reduceMotion && typeof gsap !== 'undefined') {
      try {
        gsap.registerPlugin(ScrollTrigger);

        // Reveal animations
        gsap.utils.toArray('.reveal').forEach(function (el) {
          gsap.fromTo(el,
            { opacity: 0, y: 30 },
            {
              opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
              scrollTrigger: { trigger: el, start: 'top 85%', once: true }
            }
          );
        });

        // Stagger service cards
        gsap.utils.toArray('.service-card').forEach(function (card, i) {
          gsap.fromTo(card,
            { opacity: 0, y: 30 },
            {
              opacity: 1, y: 0, duration: 0.6, delay: i * 0.1, ease: 'power2.out',
              scrollTrigger: { trigger: card, start: 'top 85%', once: true }
            }
          );
        });

        // Stagger benefit cards
        gsap.utils.toArray('.benefit-card').forEach(function (card, i) {
          gsap.fromTo(card,
            { opacity: 0, x: -30 },
            {
              opacity: 1, x: 0, duration: 0.6, delay: i * 0.15, ease: 'power2.out',
              scrollTrigger: { trigger: card, start: 'top 85%', once: true }
            }
          );
        });

        // Stat numbers
        gsap.utils.toArray('.stat-number').forEach(function (stat) {
          var target = parseInt(stat.getAttribute('data-count'), 10);
          if (!target) return;
          var suffix = stat.getAttribute('data-suffix') || '';
          gsap.fromTo(stat,
            { textContent: 0 },
            {
              textContent: target,
              duration: 2,
              ease: 'power1.out',
              snap: { textContent: 1 },
              scrollTrigger: { trigger: stat, start: 'top 85%', once: true },
              onUpdate: function () {
                stat.textContent = Math.round(parseFloat(stat.textContent)) + suffix;
              }
            }
          );
        });

        // Gallery items stagger
        ScrollTrigger.batch('.gallery-item', {
          start: 'top 90%',
          once: true,
          onEnter: function (batch) {
            gsap.fromTo(batch,
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, duration: 0.5, stagger: 0.05 }
            );
          }
        });

      } catch (e) {
        console.warn('GSAP init failed:', e);
        // Make all reveal elements visible
        document.querySelectorAll('.reveal').forEach(function (el) {
          el.style.opacity = '1';
          el.style.transform = 'none';
        });
      }
    } else {
      // No GSAP or reduced motion -- make everything visible
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    }

    /* --- Smooth scroll for anchor links --- */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
        }
      });
    });

  });
})();
