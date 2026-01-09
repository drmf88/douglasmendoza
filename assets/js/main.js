/**
 * main.js
 * Portfolio – Douglas Mendoza
 * Autor: Douglas Mendoza
 * Última actualización: 2026-01
 */

(() => {
  'use strict';

  /* ---------------------------
     Helpers
  --------------------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const prefersReducedMotion = () =>
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================
     1) Footer: año automático
  ========================================================== */
  function initYear() {
    const yearEl = document.getElementById('year');
    if (!yearEl) return;

    const startYear = 2024;
    const currentYear = new Date().getFullYear();

    yearEl.textContent =
      currentYear > startYear
        ? `${startYear} – ${currentYear}`
        : `${startYear}`;
  }


  /* ==========================================================
     2) Menú móvil
  ========================================================== */
  function initMobileNav() {
    const navMobile = $('#navMobile');
    if (!navMobile) return;

    const closeMobileNav = () => {
      if (navMobile.open) navMobile.open = false;
    };

    // Delegación: cierra si se clickea un link dentro del panel móvil
    document.addEventListener('click', (e) => {
      // Cerrar al tocar link del menú
      if (e.target.closest('.nav-panel a')) {
        closeMobileNav();
        return;
      }

      // Si está abierto y se clickea fuera del <details>, cerrar
      if (navMobile.open && !e.target.closest('#navMobile')) {
        closeMobileNav();
      }
    });

    // Touch: mejor experiencia en móvil
    document.addEventListener(
      'touchstart',
      (e) => {
        if (navMobile.open && !e.target.closest('#navMobile')) {
          closeMobileNav();
        }
      },
      { passive: true }
    );

    // Exponer cierre para el ESC global
    return { closeMobileNav };
  }

  /* ==========================================================
     3) Lightbox (certificados u otras imágenes)
  ========================================================== */
  function initLightbox() {
    const lightbox = $('#lightbox');
    const lightboxImg = $('#lightboxImg');
    const lightboxCaption = $('#lightboxCaption');

    // Si no existe el markup del lightbox, no se inicia.
    if (!lightbox || !lightboxImg || !lightboxCaption) return;

    const isOpen = () => lightbox.classList.contains('open');

    const openLightbox = (src, alt) => {
      if (!src) return;
      lightboxImg.src = src;
      lightboxImg.alt = alt || 'Imagen';
      lightboxCaption.textContent = alt || '';
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
    };

    const closeLightbox = () => {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      lightboxImg.src = '';
      lightboxImg.alt = '';
      lightboxCaption.textContent = '';
      document.body.classList.remove('no-scroll');
    };

    // Delegación de eventos:
    // - abrir si se clickea .js-lightbox
    // - cerrar si se clickea [data-close]
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.js-lightbox');
      if (btn) {
        openLightbox(btn.dataset.src, btn.dataset.alt);
        return;
      }

      if (e.target.matches('[data-close]')) {
        closeLightbox();
      }
    });

    return { isOpen, closeLightbox };
  }

  /* ==========================================================
     4) Tabs de certificaciones
  ========================================================== */
  function initCertTabs() {
    const tabs = $$('.cert-tab');
    const panels = $$('.cert-panel');

    if (!tabs.length || !panels.length) return;

    // Colapsar SOLO galerías por defecto
    $$('.cert-gallery').forEach((g) => g.classList.add('is-collapsed'));

    // Guardar el texto original del botón ("Ver 27 más") y toggle
    $$('.cert-more').forEach((btn) => {
      btn.dataset.textMore = btn.textContent;

      btn.addEventListener('click', () => {
        const panel = btn.closest('.cert-panel');
        if (!panel) return;

        const gallery = $('.cert-gallery', panel);
        if (!gallery) return;

        const collapsed = gallery.classList.toggle('is-collapsed');
        btn.textContent = collapsed ? btn.dataset.textMore : 'Ver menos';
      });
    });

    // Click en pestaña
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        // Desactivar todo
        tabs.forEach((t) => {
          t.classList.remove('is-active');
          t.setAttribute('aria-selected', 'false');
        });

        panels.forEach((p) => {
          p.classList.remove('is-active');
          p.hidden = true;
        });

        // Activar seleccionado
        tab.classList.add('is-active');
        tab.setAttribute('aria-selected', 'true');

        const targetSel = tab.dataset.target;
        const target = targetSel ? $(targetSel) : null;
        if (!target) return;

        target.hidden = false;
        target.classList.add('is-active');

        // Al cambiar de categoría: colapsar y resetear botón
        const gallery = $('.cert-gallery', target);
        const btn = $('.cert-more', target);

        if (gallery) gallery.classList.add('is-collapsed');
        if (btn) btn.textContent = btn.dataset.textMore || 'Ver todos';
      });
    });
  }

  /* ==========================================================
     5) Modal de zoom de logos
  ========================================================== */
  function initImageModal() {
    const modal = $('#img-modal');
    const modalImg = $('#img-modal-src');
    const closeBtn = modal ? $('.img-close', modal) : null;

    if (!modal || !modalImg || !closeBtn) return;

    const isOpen = () => modal.classList.contains('is-open');

    const openModal = (src, alt) => {
      if (!src) return;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      modalImg.src = src;
      modalImg.alt = alt || 'Logo';
      document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      modalImg.src = '';
      modalImg.alt = '';
      document.body.style.overflow = '';
    };

    // Abrir con click en logos / elementos zoomables
    $$('.xp-logo img, .zoomable').forEach((img) => {
      img.addEventListener('click', () => openModal(img.src, img.alt));
    });

    // Cerrar con X
    closeBtn.addEventListener('click', closeModal);

    // Cerrar al hacer click fuera de la imagen
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    return { isOpen, closeModal };
  }

  /* ==========================================================
     6) Kicker dinámico (rotación de frases)
  ========================================================== */
  function initKickerDynamic() {
    const el = $('.kicker-dynamic .kicker-word');
    if (!el) return;

    const words = [
      'Apps · Administración · Implementación · Soporte Funcional',
      'Infraestructura · Seguridad · SysAdmin · Cloud · Escalabilidad',
      'DB · Observabilidad · Métricas · Performance · Optimización',
      'Programación · Python · PowerShell · Bash · Automatización',
      'Oil & Gas · Ingeniería · Perforación · Workover · Geonavegación',
    ];

    if (prefersReducedMotion()) {
      el.textContent = words[0];
      return;
    }

    let i = 0;
    const OUT_CLASS = 'is-out';
    const INTERVAL_MS = 5000;
    const OUT_MS = 220;

    setInterval(() => {
      el.classList.add(OUT_CLASS);
      window.setTimeout(() => {
        i = (i + 1) % words.length;
        el.textContent = words[i];
        el.classList.remove(OUT_CLASS);
      }, OUT_MS);
    }, INTERVAL_MS);
  }

  /* ==========================================================
     7) Efecto typing en H1
  ========================================================== */
  function initH1Typing() {
    const el = $('.h1-typing');
    if (!el) return;
    if (prefersReducedMotion()) return;

    const text = el.textContent.trim();
    if (!text) return;

    el.textContent = '';
    let i = 0;

    const SPEED_MS = 38;

    const type = () => {
      el.textContent = text.slice(0, i++);
      if (i <= text.length) window.setTimeout(type, SPEED_MS);
    };

    type();
  }

  /* ==========================================================
     8) ESC global (cierra lo que esté abierto)
  ========================================================== */
  function initGlobalEscapeHandlers(deps) {
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;

      // 1) Lightbox
      if (deps.lightbox?.isOpen?.()) {
        deps.lightbox.closeLightbox();
        return;
      }

      // 2) Modal de imagen
      if (deps.imageModal?.isOpen?.()) {
        deps.imageModal.closeModal();
        return;
      }

      // 3) Menú móvil
      deps.mobileNav?.closeMobileNav?.();
    });
  }

  /* ==========================================================
     Boot (arranque)
  ========================================================== */
  function boot() {
    initYear();

    const mobileNav = initMobileNav();     // devuelve { closeMobileNav }
    const lightbox = initLightbox();       // devuelve { isOpen, closeLightbox }
    const imageModal = initImageModal();   // devuelve { isOpen, closeModal }

    initCertTabs();
    initKickerDynamic();
    initH1Typing();

    initGlobalEscapeHandlers({ mobileNav, lightbox, imageModal });
  }

  // Si usás <script defer>, DOMContentLoaded igual es seguro.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
