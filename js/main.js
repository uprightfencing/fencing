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

        // Timeline: draw the line, then pop in each milestone
        gsap.utils.toArray('.timeline').forEach(function (timeline) {
          var tl = gsap.timeline({
            scrollTrigger: { trigger: timeline, start: 'top 80%', once: true }
          });
          tl.fromTo(timeline, { '--progress': 0 }, { '--progress': 1, duration: 1.2, ease: 'power2.inOut' })
            .from(timeline.querySelectorAll('.timeline-item'), {
              opacity: 0, y: 30, duration: 0.6, stagger: 0.2, ease: 'back.out(1.6)'
            }, '-=0.9');
        });

        // Zoom-in split images: gentle zoom as they reveal
        gsap.utils.toArray('.split-image.zoom-in img').forEach(function (img) {
          gsap.from(img, {
            scale: 1.08, duration: 1.4, ease: 'power2.out',
            scrollTrigger: { trigger: img, start: 'top 85%', once: true }
          });
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

document.addEventListener('click', function (e) {
  var link = e.target.closest ? e.target.closest('a[href^="tel:"]') : null;
  if (!link || typeof gtag !== 'function') return;
  gtag('event', 'conversion', {
    'send_to': 'AW-774245879/Q5hlCJ_38KcdEPebmPEC',
    'value': 1.0,
    'currency': 'USD'
  });
});

/* --- Phone menu: Services list opens on tap --- */
(function () {
  'use strict';

  var sub = document.querySelector('.mobile-menu .mobile-sub');
  var link = sub ? sub.previousElementSibling : null;
  if (!link || link.tagName !== 'A') return;

  var allServices = document.createElement('a');
  allServices.href = link.getAttribute('href');
  allServices.textContent = 'All Services';
  sub.insertBefore(allServices, sub.firstChild);

  var toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'mobile-sub-toggle';
  toggle.textContent = link.textContent;
  toggle.setAttribute('aria-expanded', 'false');
  toggle.addEventListener('click', function () {
    var open = sub.hidden;
    sub.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
  });
  sub.hidden = true;
  link.parentNode.replaceChild(toggle, link);
})();

/* --- Installable app --- */
(function () {
  'use strict';

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* The site works without it. */ });
    });
  }

  var installed = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if (installed) return;

  var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var buttons = [];
  var installEvent = null;

  function showIOSSteps() {
    var dialog = document.querySelector('.app-steps');
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.className = 'app-steps';
      dialog.setAttribute('aria-labelledby', 'app-steps-title');
      dialog.innerHTML =
        '<h2 id="app-steps-title">Add Upright Fencing to your home screen</h2>' +
        '<ol><li>Tap the <strong>Share</strong> button in your browser.</li>' +
        '<li>Choose <strong>Add to Home Screen</strong>. You may need to scroll or tap <strong>More</strong> to find it.</li>' +
        '<li>Tap <strong>Add</strong>.</li></ol>' +
        '<button type="button" class="btn btn-primary">Close</button>';
      dialog.querySelector('button').addEventListener('click', function () { dialog.close(); });
      document.body.appendChild(dialog);
    }
    dialog.showModal();
  }

  function removeButtons() {
    buttons.forEach(function (button) { button.remove(); });
    buttons = [];
  }

  function addButton(place) {
    if (!place) return;
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'app-install-btn';
    button.textContent = 'Get the App';
    button.addEventListener('click', function () {
      if (installEvent) {
        installEvent.prompt();
        installEvent = null;
        removeButtons();
      } else if (isIOS) {
        showIOSSteps();
      }
    });
    place.appendChild(button);
    buttons.push(button);
  }

  function showButton() {
    if (buttons.length) return;
    addButton(document.querySelector('.footer-brand'));
    addButton(document.querySelector('.mobile-menu-cta'));
  }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    installEvent = e;
    showButton();
  });

  window.addEventListener('appinstalled', removeButtons);

  if (isIOS) showButton();
})();
