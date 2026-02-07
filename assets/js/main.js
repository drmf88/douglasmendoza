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
        currentYear > startYear ? `${startYear} – ${currentYear}` : `${startYear}`;
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

      document.addEventListener('click', (e) => {
        // cerrar (x) o click en overlay
        if (e.target.matches('[data-close]') || e.target === lightbox) {
          closeLightbox();
          return;
        }
      
        // abrir desde thumbs
        const btn = e.target.closest('.js-lightbox');
        if (btn) {
          openLightbox(btn.dataset.src, btn.dataset.alt);
        }
      });


      document.addEventListener(
        'touchstart',
        (e) => {
          if (navMobile.open && !e.target.closest('#navMobile')) {
            closeMobileNav();
          }
        },
        { passive: true }
      );

      return { closeMobileNav };
    }

    /* ==========================================================
       3) Lightbox (certificados u otras imágenes)
    ========================================================== */
    function initLightbox() {
      const lightbox = $('#lightbox');
      const lightboxImg = $('#lightboxImg');
      const lightboxCaption = $('#lightboxCaption');

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
    
      // Helper: devuelve el dict actual (o ES como fallback)
      const getDict = () => window.__i18nDict || (window.i18n ? window.i18n.es : null) || {};
    
      // Helper: detecta si el panel es IT o GEO para elegir "Ver 27 más" vs "Ver 11 más"
      const getMoreKeyByPanel = (panelEl) => {
        if (!panelEl) return 'cert_more_27';
        return panelEl.id === 'certs-geo' ? 'cert_more_11' : 'cert_more_27';
      };
    
      // Helper: setea el texto correcto del botón según estado colapsado/expandido
      const setMoreButtonLabel = (btn, collapsed) => {
        if (!btn) return;
        const dict = getDict();
      
        const panel = btn.closest('.cert-panel');
        const moreKey = getMoreKeyByPanel(panel);
      
        const moreText = dict[moreKey] || btn.textContent.trim();
        const lessText = dict.cert_less || 'Ver menos';
      
        btn.textContent = collapsed ? moreText : lessText;
      };
    
      // Botones "Ver más" (por panel)
      $$('.cert-more').forEach((btn) => {
        btn.addEventListener('click', () => {
          const panel = btn.closest('.cert-panel');
          if (!panel) return;
        
          const gallery = $('.cert-gallery', panel);
          if (!gallery) return;
        
          const collapsed = gallery.classList.toggle('is-collapsed');
          setMoreButtonLabel(btn, collapsed);
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
        
          // Al cambiar de categoría: colapsar y resetear botón según idioma actual
          const gallery = $('.cert-gallery', target);
          const btn = $('.cert-more', target);
        
          if (gallery) gallery.classList.add('is-collapsed');
          setMoreButtonLabel(btn, true);
        });
      });
    
      // ✅ Importante: al iniciar, asegurá que cada botón tenga su texto correcto según idioma actual
      $$('.cert-panel').forEach((panel) => {
        const gallery = $('.cert-gallery', panel);
        const btn = $('.cert-more', panel);
        const collapsed = gallery ? gallery.classList.contains('is-collapsed') : true;
        setMoreButtonLabel(btn, collapsed);
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
    
      // ✅ SOLO logos e imágenes marcadas como zoomable
      $$('.xp-logo img, .zoomable').forEach((img) => {
        img.addEventListener('click', () => openModal(img.src, img.alt));
      });
    
      closeBtn.addEventListener('click', closeModal);

      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    
      return { isOpen, closeModal };
    }


    /* ==========================================================
       6) Kicker dinámico (rotación de frases) - i18n ready
    ========================================================== */
    function initKickerDynamic() {
      const el = $('.kicker-dynamic .kicker-word');
      if (!el) return;

      const words =
        (Array.isArray(window.__kickerWords) && window.__kickerWords.length)
          ? window.__kickerWords
          : [
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

      // evita intervalos duplicados
      if (window.__kickerIntervalId) clearInterval(window.__kickerIntervalId);

      window.__kickerIntervalId = setInterval(() => {
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
       (corre una sola vez)
    ========================================================== */
    let typingRan = false;

    function initH1Typing() {
      const el = $('.h1-typing');
      if (!el) return;
      if (prefersReducedMotion()) return;
      if (typingRan) return;

      const text = el.textContent.trim();
      if (!text) return;

      typingRan = true;
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
       8) ESC global
    ========================================================== */
    function initGlobalEscapeHandlers(deps) {
      document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
      
        // 1) Cerrar lightbox primero
        if (deps.lightbox?.isOpen?.()) {
          deps.lightbox.closeLightbox();
          return;
        }
      
        // 2) Cerrar modal de logos
        if (deps.imageModal?.isOpen?.()) {
          deps.imageModal.closeModal();
          return;
        }
      
        // 3) Cerrar menú móvil
        deps.mobileNav?.closeMobileNav?.();
      });
    }


    /* ==========================================================
       9) Idiomas (ES / EN / PT-BR)
       - data-i18n: texto
       - data-i18n-attr: atributos
       - data-i18n-data: dataset
    ========================================================== */
    function initLangSwitcher() {
      const root = document.documentElement;

      const i18n = {
        es: {
          // Accesibilidad / labels
          skip_to_content: "Saltar al contenido",
          brand_inicio_label: "Inicio",
          nav_aria_desktop: "Navegación principal",
          nav_aria_mobile: "Menú móvil",
          nav_open_menu_aria: "Abrir menú",
          lang_btn_aria: "Cambiar idioma",
          lang_menu_aria: "Idiomas",
          modal_preview_aria: "Vista previa",
          modal_close_aria: "Cerrar",
        
          // NAV
          nav_inicio: "Inicio",
          nav_servicios: "Servicios",
          nav_proyectos: "Proyectos",
          nav_experiencia: "Experiencia",
          nav_habilidades: "Habilidades",
          nav_certs: "Certificaciones",
          nav_edu: "Educación",
          nav_contacto: "Contacto",
          nav_menu: "Menú",
          lang_label: "Idioma",
        
          // HERO - Kicker (rotación)
          kicker_0: "Apps · Administración · Implementación · Soporte Funcional",
          kicker_list: JSON.stringify([
            "Apps · Administración · Implementación · Soporte Funcional",
            "Infraestructura · Seguridad · SysAdmin · Cloud · Escalabilidad",
            "DB · Observabilidad · Métricas · Performance · Optimización",
            "Programación · Python · PowerShell · Bash · Automatización",
            "Oil & Gas · Ingeniería · Perforación · Workover · Geonavegación",
          ]),
        
          // HERO
          hero_h1: "Infraestructura estable, procesos claros y menos incidentes en operaciones críticas.",
          hero_lead:
            "Soy Ingeniero Geólogo con experiencia en Oil & Gas, especializado en la integración de tecnología y operaciones. He trabajado en entornos de producción administrando e implementando soluciones de IT, automatización y soporte de infraestructuras críticas, contribuyendo a la eficiencia y continuidad de procesos de perforación, desarrollo y operación.",
          hero_cta_contacto: "Contactarme",
          hero_cta_cv: "Descargar CV (PDF)",
        
          // HERO - Perfil
          hero_profile_aria: "Perfil",
          hero_avatar_alt: "Foto de Douglas Mendoza",
          hero_profile_meta: "Neuquén, Argentina · Inglés B1",
          hero_mini_actual_label: "Actual:",
          hero_mini_actual_value: "Soporte de Aplicaciones Upstream",
          hero_mini_db_label: "DB:",
          hero_mini_db_value: "Oracle + MS SQL Server",
          hero_mini_auto_label: "Automatización:",
          hero_mini_auto_value: "Python + PowerShell",
          hero_btn_linkedin: "LinkedIn",
          hero_btn_email: "Email",
          hero_btn_whatsapp: "WhatsApp",
          hero_btn_github: "GitHub",
        
          // SERVICIOS (sección)
          sec_servicios: "Servicios",
          sec_servicios_desc:
            "Experiencia real en operación, estabilidad y continuidad de sistemas críticos en entornos de Oil & Gas, producción y TI corporativa.",
        
          srv1_title: "Soporte de Apps (Oil & Gas)",
          srv1_desc:
            "Soporte funcional y técnico de aplicaciones críticas para operaciones de pozos, asegurando continuidad, estabilidad y correcta adopción por los usuarios.",
          srv1_li1: "OpenWells, Autosync, Data Analyzer, Profile",
          srv1_li2: "RTIC: StarSteer, Corva, Pason",
          srv1_li3: "Capacitación, gestión de incidentes y continuidad",
        
          srv2_title: "Implementación & Deploy",
          srv2_desc:
            "Puesta en producción de aplicaciones y servicios, controlando configuración, estabilidad y resolución de incidencias post go-live.",
          srv2_li1: "Tomcat, Nginx, IIS, Apache, cPanel",
          srv2_li2: "Releases, validación, rollback y troubleshooting",
          srv2_li3: "Ambientes Test/Prod, parametrización y soporte",
        
          srv3_title: "Soporte IT & Admin (AD / M365)",
          srv3_desc:
            "Administración de dominio, correo y soporte IT a usuarios, garantizando operación diaria y continuidad del negocio.",
          srv3_li1: "Active Directory, GPOs, permisos y accesos",
          srv3_li2: "Microsoft 365 / Exchange: cuentas y troubleshooting",
          srv3_li3: "Soporte a PyMEs y grandes empresas (remoto / onsite)",
        
          srv4_title: "Infraestructura & SysAdmin",
          srv4_desc:
            "Gestión de infraestructura on-premises y cloud, enfocada en disponibilidad, seguridad básica y continuidad operativa.",
          srv4_li1: "Windows Server / Linux (on-premises y cloud)",
          srv4_li2: "Firewall, VPN, acceso remoto y networking",
          srv4_li3: "Parches, hardening básico y backups",
        
          srv5_title: "Databases & Performance",
          srv5_desc:
            "Administración y optimización de bases de datos, asegurando performance, integridad y acceso controlado a la información.",
          srv5_li1: "Oracle, SQL Server, MySQL",
          srv5_li2: "Roles, permisos, backups y accesos",
          srv5_li3: "Optimización de queries, SPs y triggers",
        
          srv6_title: "Observabilidad & Monitoreo",
          srv6_desc:
            "Monitoreo de aplicaciones e infraestructura para detección temprana de incidentes y análisis de causa raíz.",
          srv6_li1: "Dashboards en Grafana",
          srv6_li2: "Nagios XI, alertas y métricas",
          srv6_li3: "Análisis de logs y RCA básico",
        
          srv7_title: "Automatización & Scripting",
          srv7_desc:
            "Desarrollo de automatizaciones y herramientas internas para mejorar eficiencia operativa y reducir errores manuales.",
          srv7_li1: "Python (PySide6, pandas), PowerShell, Bash",
          srv7_li2: "ETL liviano, reportes y scripts",
          srv7_li3: "Herramientas internas a medida",
        
          srv8_title: "Drilling & Geonavegación",
          srv8_desc:
            "Asesoramiento técnico en perforación y workover, enfocado en optimización de tiempos, costos y ejecución operativa en campo.",
          srv8_li1: "Programas operativos de perforación y workover",
          srv8_li2: "Diseño de trayectorias, geonavegación y simulaciones",
          srv8_li3: "Tiempos, costos AFE, KPIs, NPT y performance",
        
          // PROYECTOS
          sec_proyectos: "Proyectos",
          sec_proyectos_desc:
            "Soluciones reales desarrolladas y operadas en entornos productivos. Automatización, monitoreo y herramientas orientadas a reducir incidentes y mejorar la eficiencia operativa.",
        
          proj1_tag: "Analítica",
          proj1_title: "Analítica de Soporte Operativo",
          proj1_li1: "Panel de KPIs para INC/REQ: volumen, estados y SLA promedio.",
          proj1_li2: "Análisis Pareto, tendencias y tortas por aplicación / CI / descripción.",
          proj1_li3: "Soporta drill-down: click en gráficos para ver el detalle y acelerar decisiones.",
          proj1_result: "visibilidad operativa y toma de decisiones",
          proj1_img1_alt: "Analítica de soporte (Totalizadores)",
          proj1_img1_alt_img: "Analítica de soporte (Totalizadores)",
          proj1_img2_alt: "KPIs y análisis (Pareto / tendencias / tortas)",
          proj1_img2_alt_img: "KPIs y análisis (Pareto / tendencias / tortas)",

          proj2_tag: "Automatización",
          proj2_title: "Aplicación de escritorio de soporte",
          proj2_li1: "Automatiza tareas repetitivas y consultas a múltiples fuentes.",
          proj2_li2: "Centraliza bases y utilidades en una sola interfaz para el equipo de soporte.",
          proj2_li3: "Enfoque en estabilidad: menos pasos manuales y menos errores operativos.",
          proj2_result: "menos tareas manuales",
          proj2_img1_alt: "App interna de soporte (Consultas, comando, ABM, Scritps)",
          proj2_img1_alt_img: "App interna de soporte (Consultas, comando, ABM, Scritps)",
          proj2_img2_alt: "App interna de soporte (Acerca de)",
          proj2_img2_alt_img: "App interna de soporte (Acerca de)",

          proj3_tag: "Monitoreo",
          proj3_title: "Dashboard de monitoreo operativo",
          proj3_li1: "Monitoreo de PCs de operaciones de pozo (Drilling, Workover, Pulling).",
          proj3_li2: "Métricas y alertas para apps críticas (OpenWells, Autosync, YClick).",
          proj3_li3: "Detección temprana para reducir incidentes y tiempos de indisponibilidad.",
          proj3_result: "detección temprana",
          proj3_img1_alt: "Estado Operativo de Equipos y Aplicaciones",
          proj3_img1_alt_img: "Estado Operativo de Equipos y Aplicaciones",
          proj3_img2_alt: "Historia del Equipo",
          proj3_img2_alt_img: "Historia del Equipo",

          proj4_tag: "Perforación",
          proj4_title: "VCDE – Macolla Cacique Chaima (Pad de 50 pozos)",
          proj4_li1: "Visualización y definición del desarrollo del pad bajo metodología FEL.",
          proj4_li2: "Ingeniería de pozo y planificación operativa (programas, materiales y servicios).",
          proj4_li3: "Ejecución y control de KPIs, NPT y performance de perforación.",
          proj4_result: "control operativo, minimizar riesgos",
          proj4_img1_alt: "Vista general del Pad (Fotografía aérea y diseño de software)",
          proj4_img1_alt_img: "Vista general del Pad (Fotografía aérea y diseño de software)",
          proj4_img2_alt: "Trayectorias de pozos – Vista 2D y 3D en Compass",
          proj4_img2_alt_img: "Trayectorias de pozos – Vista 2D y 3D en Compass",
          
          label_tip: "Tip:",
          label_stack: "Stack:",
          label_resultado: "Resultado:",
          proj_cta_demo: "Pedir demo",
        
          // EXPERIENCIA
          sec_experiencia: "Experiencia",
          sec_experiencia_desc:
            "Mi trayectoria profesional abarca distintas áreas técnicas, desde operaciones en campo hasta tecnología y soporte de aplicaciones, permitiéndome integrar conocimiento operativo con soluciones digitales.",
        
          xp_econat_logo_alt: "Logo ECONAT",
          xp_doctec_logo_alt: "Logo DOCTEC",
          xp_pdvsa_logo_alt: "Logo PDVSA",
        
          xp_remote: "Remoto",
          xp_on_site: "Presencial",
          xp_on_site_remote: "Presencial/Remoto",
          xp_loc_neuquen_ar: "Neuquén, Argentina",
          xp_loc_caba_ar: "CABA, Argentina",
          xp_loc_monagas_ve: "Monagas, Venezuela",
        
          xp1_title: "Administración y soporte de aplicaciones",
          xp1_dates: "Abril 2022 – Actual",
          xp1_li1: "Despliegue y soporte de aplicaciones de operaciones de pozos (on-prem y cloud).",
          xp1_li2: "BD Oracle/SQL Server: performance, accesos, scripts SQL (DML/DCL), SP y triggers.",
          xp1_li3: "Automatización con Python (PySide6), batch y Selenium (flujos en app propia).",
          xp1_li4: "Observabilidad e incidentes: Grafana + logs + ServiceNow ITCM (Kanban).",
          xp1_li5: "Soporte y capacitación a usuarios (OpenWells, Autosync, Data Analyzer, Profile, RTIC).",
        
          xp2_title: "Sysadmin e implementación de aplicaciones",
          xp2_dates: "Agosto 2021 – Mayo 2024",
          xp2_li1: "Linux (Ubuntu) y Windows Server (on-prem/cloud): servicios, firewall, red y acceso remoto.",
          xp2_li2: "Web/IIS/Apache/Nginx y despliegues con cPanel.",
          xp2_li3: "Tomcat + MySQL + SQL Server: implementación y mantenimiento (Testing/Prod).",
          xp2_li4: "Monitoreo con Nagios XI + troubleshooting por logs.",
          xp2_li5: "Testing y APIs: TestLink + Postman/SoapUI; releases (Mantis/ClickUp).",
        
          xp3_title: "Ingeniero de Perforación",
          xp3_dates: "Febrero 2013 – Julio 2017",
          xp3_li1: "Diseño y replanificación de trayectorias de pozos direccionales (Compass / Landmark).",
          xp3_li2: "Simulación de torque, drag, hidráulica y cementación para optimizar la perforación.",
          xp3_li3: "Elaboración de procedimientos operativos de perforación y workover.",
          xp3_li4: "Estimación de tiempos y costos (AFE) y control de ejecución en campo.",
          xp3_li5: "Análisis de KPIs y NPT para seguimiento del desempeño operativo.",
        
          // HABILIDADES
          sec_habilidades: "Habilidades",
          sec_habilidades_desc: "Tecnologías, herramientas y conocimientos aplicados en entornos productivos y operativos.",
          skills_it_title: "Tecnologías & IT",
          skills_geo_title: "Geociencias e Ingeniería",
          skills_methods_title: "Metodologías",
          skills_methods_agile: "Agile (Scrum, Kanban, SAFe)",
          skills_lang_title: "Idiomas",
          skills_lang_es: "Español — Nativo",
          skills_lang_en: "Inglés — Pre-Intermediate (B1)",
        
          // CERTIFICACIONES
          sec_certs: "Certificaciones",
          sec_certs_desc: "Formación orientada al fortalecimiento de competencias técnicas y profesionales.",
          cert_tabs_aria: "Categorías de certificaciones",
          cert_tab_it: "Tecnología & IT",
          cert_tab_geo: "Perforación & Geociencia",
          cert_more_27: "Ver 27 más",
          cert_more_11: "Ver 11 mas",
          cert_less: "Ver menos",

          cert_tec31_title: "Qt / PySide",
          cert_tec30_title: "Scrum / Agile",
          cert_tec29_title: "C# .NET",
          cert_tec28_title: "POO con IA",
          cert_tec27_title: "IA",
          cert_tec26_title: "Azure",
          cert_tec25_title: "SQL Server Programming",
          cert_tec24_title: "Javascript",
          cert_tec23_title: "Desarrollo Web",
          cert_tec22_title: "Lenguaje R",
          cert_tec21_title: "SQL Databases",
          cert_tec20_title: "SQL Server 2019",
          cert_tec19_title: "Seguridad Linux",
          cert_tec18_title: "Linux Scripting",
          cert_tec17_title: "Seguridad Web",
          cert_tec16_title: "Ethical Hacking",
          cert_tec15_title: "Redes Linux",
          cert_tec14_title: "Seguridad Redes",
          cert_tec13_title: "Informática Forense",
          cert_tec12_title: "Seguridad Windows",
          cert_tec11_title: "Mobile Hacking",
          cert_tec10_title: "HTTPS",
          cert_tec9_title: "Linux Administrador",
          cert_tec8_title: "Criptografía",
          cert_tec7_title: "Python Programming",
          cert_tec6_title: "Operador Linux",
          cert_tec5_title: "Python",
          cert_tec4_title: "Redes",
          cert_tec3_title: "Linux",
          cert_tec2_title: "Seguridad Informatica",
          cert_tec1_title: "Base de datos",

          cert_ing15_title: "Geomecanica",
          cert_ing14_title: "StressCheck / CasingSeat",
          cert_ing13_title: "WellCat",
          cert_ing12_title: "OpenWells",
          cert_ing11_title: "WellPlan",
          cert_ing10_title: "Compass",
          cert_ing9_title: "DrillWorks",
          cert_ing8_title: "Excel",
          cert_ing7_title: "Perforación Direccional",
          cert_ing6_title: "Cementación",
          cert_ing5_title: "Fluidos de Perforación",
          cert_ing4_title: "DIMS",
          cert_ing3_title: "Estratigrafía",
          cert_ing2_title: "EEII y Geología Operacional",
          cert_ing1_title: "Geología del subsuelo",

        
          // EDUCACIÓN
          sec_edu: "Educación",
          sec_edu_desc: "Formación académica y técnica complementaria a mi experiencia profesional.",
          edu_status_done: "Finalizada",
          edu1_title: "Seguridad Informática",
          edu1_meta: "Educación IT - Argentina · 2020 – 2021 ·",
          edu2_title: "Ingeniero Geólogo",
          edu2_meta: "Universidad de Oriente - Venezuela · 2004 – 2011 ·",
          edu_tag_networks: "Redes",
          edu_tag_winlinux: "Windows/Linux",
          edu_tag_eh: "Hacking ético",
          edu_tag_forensics: "Forense",
          edu_tag_geology: "Geología",
          edu_tag_engineering: "Ingeniería",
          edu_tag_reservoirs: "Reservorios",
          edu_tag_drilling: "Perforación",
          edu_btn_view_cert: "Ver Certificado",
          edu_btn_view_title: "Ver Título",
          edu1_alt: "Certificado - Ciberseguridad",
          edu2_alt: "Título - Ingeniero Geólogo",
        
          // CONTACTO
          sec_contacto: "Contacto",
          sec_contacto_desc:
            "Podés contactarme para oportunidades laborales, proyectos o colaboraciones. Estoy abierto a conversar y aportar valor.",
          contact_send_email: "Enviar email",
          contact_label_email: "Email:",
          contact_label_whatsapp: "WhatsApp:",
          contact_label_linkedin: "LinkedIn:",
        
          // FOOTER
          footer_rights: "Todos los derechos reservados.",
          footer_back_top: "Volver arriba ↑",
        },
      
        en: {
          skip_to_content: "Skip to content",
          brand_inicio_label: "Home",
          nav_aria_desktop: "Main navigation",
          nav_aria_mobile: "Mobile menu",
          nav_open_menu_aria: "Open menu",
          lang_btn_aria: "Change language",
          lang_menu_aria: "Languages",
          modal_preview_aria: "Preview",
          modal_close_aria: "Close",
        
          nav_inicio: "Home",
          nav_servicios: "Services",
          nav_proyectos: "Projects",
          nav_experiencia: "Experience",
          nav_habilidades: "Skills",
          nav_certs: "Certifications",
          nav_edu: "Education",
          nav_contacto: "Contact",
          nav_menu: "Menu",
          lang_label: "Language",
        
          kicker_0: "Apps · Administration · Implementation · Functional Support",
          kicker_list: JSON.stringify([
            "Apps · Administration · Implementation · Functional Support",
            "Infrastructure · Security · SysAdmin · Cloud · Scalability",
            "DB · Observability · Metrics · Performance · Optimization",
            "Programming · Python · PowerShell · Bash · Automation",
            "Oil & Gas · Engineering · Drilling · Workover · Geosteering",
          ]),
        
          hero_h1: "Stable infrastructure, clear processes, and fewer incidents in critical operations.",
          hero_lead:
            "Geologist Engineer with Oil & Gas experience, focused on integrating technology and operations. I’ve worked in production environments managing and deploying IT solutions, automation, and support for critical infrastructures—improving efficiency and operational continuity across drilling, development, and operations.",
          hero_cta_contacto: "Contact me",
          hero_cta_cv: "Download CV (PDF)",
        
          hero_profile_aria: "Profile",
          hero_avatar_alt: "Photo of Douglas Mendoza",
          hero_profile_meta: "Neuquén, Argentina · English B1",
          hero_mini_actual_label: "Current:",
          hero_mini_actual_value: "Upstream Applications Support",
          hero_mini_db_label: "DB:",
          hero_mini_db_value: "Oracle + MS SQL Server",
          hero_mini_auto_label: "Automation:",
          hero_mini_auto_value: "Python + PowerShell",
          hero_btn_linkedin: "LinkedIn",
          hero_btn_email: "Email",
          hero_btn_whatsapp: "WhatsApp",
          hero_btn_github: "GitHub",
        
          sec_servicios: "Services",
          sec_servicios_desc:
            "Hands-on experience operating, stabilizing, and supporting critical systems in Oil & Gas, production environments, and corporate IT.",
        
          srv1_title: "Apps Support (Oil & Gas)",
          srv1_desc:
            "Functional and technical support for mission-critical well operations applications—ensuring continuity, stability, and user adoption.",
          srv1_li1: "OpenWells, Autosync, Data Analyzer, Profile",
          srv1_li2: "RTIC: StarSteer, Corva, Pason",
          srv1_li3: "Training, incident management, and continuity",
        
          srv2_title: "Implementation & Deployment",
          srv2_desc:
            "Go-live and deployment of apps/services with configuration control, stability, and post-launch troubleshooting.",
          srv2_li1: "Tomcat, Nginx, IIS, Apache, cPanel",
          srv2_li2: "Releases, validation, rollback, and troubleshooting",
          srv2_li3: "Test/Prod environments, configuration, and support",
        
          srv3_title: "IT Support & Admin (AD / M365)",
          srv3_desc:
            "Domain and email administration plus user support—ensuring day-to-day operations and business continuity.",
          srv3_li1: "Active Directory, GPOs, permissions, and access control",
          srv3_li2: "Microsoft 365 / Exchange: accounts and troubleshooting",
          srv3_li3: "Support for SMBs and large enterprises (remote / onsite)",
        
          srv4_title: "Infrastructure & SysAdmin",
          srv4_desc:
            "On-prem and cloud infrastructure management focused on availability, baseline security, and operational continuity.",
          srv4_li1: "Windows Server / Linux (on-prem and cloud)",
          srv4_li2: "Firewall, VPN, remote access, and networking",
          srv4_li3: "Patching, baseline hardening, and backups",
        
          srv5_title: "Databases & Performance",
          srv5_desc:
            "Database administration and optimization to ensure performance, integrity, and controlled access to information.",
          srv5_li1: "Oracle, SQL Server, MySQL",
          srv5_li2: "Roles, permissions, backups, and access",
          srv5_li3: "Query optimization, stored procedures, and triggers",
        
          srv6_title: "Observability & Monitoring",
          srv6_desc:
            "Application and infrastructure monitoring for early detection of incidents and basic root cause analysis.",
          srv6_li1: "Grafana dashboards",
          srv6_li2: "Nagios XI, alerts, and metrics",
          srv6_li3: "Log analysis and basic RCA",
        
          srv7_title: "Automation & Scripting",
          srv7_desc:
            "Internal automations and tools to improve operational efficiency and reduce manual errors.",
          srv7_li1: "Python (PySide6, pandas), PowerShell, Bash",
          srv7_li2: "Lightweight ETL, reports, and scripts",
          srv7_li3: "Custom internal tools",
        
          srv8_title: "Drilling & Geosteering",
          srv8_desc:
            "Technical advisory in drilling and workover focused on optimizing time, cost, and field execution.",
          srv8_li1: "Operational programs for drilling and workover",
          srv8_li2: "Trajectory design, geosteering, and simulations",
          srv8_li3: "Time, cost (AFE), KPIs, NPT, and performance",
        
          sec_proyectos: "Projects",
          sec_proyectos_desc:
            "Real solutions developed and operated in production environments. Automation, monitoring, and tools aimed at reducing incidents and improving operational efficiency.",
        
          proj1_tag: "Analytics",
          proj1_title: "Operational Support Analytics",
          proj1_li1: "KPI panel for INC/REQ: volume, status distribution, and average SLA.",
          proj1_li2: "Pareto analysis, trends, and donut charts by application / CI / description.",
          proj1_li3: "Drill-down support: click charts to open detailed records and speed up decisions.",
          proj1_result: "operational visibility and decision-making",
          proj1_img1_alt: "Support Analytics (Totals)",
          proj1_img1_alt_img: "Support Analytics (Totals)",
          proj1_img2_alt: "KPIs & Analytics (Pareto / Trends / Donuts)",
          proj1_img2_alt_img: "KPIs & Analytics (Pareto / Trends / Donuts)",

          proj2_tag: "Automation",
          proj2_title: "Support Desktop Application",
          proj2_li1: "Automates repetitive tasks and queries across multiple sources.",
          proj2_li2: "Centralizes databases and utilities in a single interface for the support team.",
          proj2_li3: "Stability-focused: fewer manual steps and fewer operational errors.",
          proj2_result: "fewer manual tasks",
          proj2_img1_alt: "Internal Support App (Queries, Commands, CRUD, Scripts)",
          proj2_img1_alt_img: "Internal Support App (Queries, Commands, CRUD, Scripts)",
          proj2_img2_alt: "Internal Support App (About)",
          proj2_img2_alt_img: "Internal Support App (About)",

          proj3_tag: "Monitoring",
          proj3_title: "Operational Monitoring Dashboard",
          proj3_li1: "Monitoring of well operations PCs (Drilling, Workover, Pulling).",
          proj3_li2: "Metrics and alerts for critical apps (OpenWells, Autosync, YClick).",
          proj3_li3: "Early detection to reduce incidents and downtime.",
          proj3_result: "early detection",
          proj3_img1_alt: "Operational Status of Systems and Applications",
          proj3_img1_alt_img: "Operational Status of Systems and Applications",
          proj3_img2_alt: "Equipment History",
          proj3_img2_alt_img: "Equipment History",

          proj4_tag: "Drilling",
          proj4_title: "VCDE – Pad Cacique Chaima (50 wells pad)",
          proj4_li1: "Visualization and definition of pad development using FEL methodology.",
          proj4_li2: "Well engineering and operational planning (programs, materials and services).",
          proj4_li3: "Execution and monitoring of KPIs, NPT and drilling performance.",
          proj4_result: "operational control, risk mitigation",
          proj4_img1_alt: "Overall Pad View (Aerial Photography and Software Design)",
          proj4_img1_alt_img: "Overall Pad View (Aerial Photography and Software Design)",
          proj4_img2_alt: "Well Trajectories – 2D and 3D View in Compass",
          proj4_img2_alt_img: "Well Trajectories – 2D and 3D View in Compass",

          label_tip: "Tip:",
          label_stack: "Stack:",
          label_resultado: "Outcome:",
          proj_cta_demo: "Request a demo",
        
          sec_experiencia: "Experience",
          sec_experiencia_desc:
            "My professional path spans multiple technical areas, from field operations to technology and application support—allowing me to combine operational knowledge with digital solutions.",
        
          xp_econat_logo_alt: "ECONAT logo",
          xp_doctec_logo_alt: "DOCTEC logo",
          xp_pdvsa_logo_alt: "PDVSA logo",
        
          xp_remote: "Remote",
          xp_on_site: "On-site",
          xp_on_site_remote: "On-site/Remote",
          xp_loc_neuquen_ar: "Neuquén, Argentina",
          xp_loc_caba_ar: "Buenos Aires (CABA), Argentina",
          xp_loc_monagas_ve: "Monagas, Venezuela",
        
          xp1_title: "Application Administration & Support",
          xp1_dates: "April 2022 – Present",
          xp1_li1: "Deployment and support of well operations applications (on-prem and cloud).",
          xp1_li2: "Oracle/SQL Server DB: performance, access control, SQL scripts (DML/DCL), SPs and triggers.",
          xp1_li3: "Automation with Python (PySide6), batch, and Selenium (flows in internal app).",
          xp1_li4: "Observability and incidents: Grafana + logs + ServiceNow ITCM (Kanban).",
          xp1_li5: "User support and training (OpenWells, Autosync, Data Analyzer, Profile, RTIC).",
        
          xp2_title: "SysAdmin & Application Implementation",
          xp2_dates: "August 2021 – May 2024",
          xp2_li1: "Linux (Ubuntu) and Windows Server (on-prem/cloud): services, firewall, networking, remote access.",
          xp2_li2: "Web/IIS/Apache/Nginx and deployments with cPanel.",
          xp2_li3: "Tomcat + MySQL + SQL Server: implementation and maintenance (Test/Prod).",
          xp2_li4: "Monitoring with Nagios XI and log-based troubleshooting.",
          xp2_li5: "Testing and APIs: TestLink + Postman/SoapUI; releases (Mantis/ClickUp).",
        
          xp3_title: "Drilling Engineer",
          xp3_dates: "February 2013 – July 2017",
          xp3_li1: "Design and replanning of directional well trajectories (Compass / Landmark).",
          xp3_li2: "Torque/drag, hydraulics, and cementing simulations to optimize drilling.",
          xp3_li3: "Creation of drilling and workover operating procedures.",
          xp3_li4: "Time/cost estimation (AFE) and field execution control.",
          xp3_li5: "KPI and NPT analysis to track operational performance.",
        
          sec_habilidades: "Skills",
          sec_habilidades_desc: "Technologies, tools, and knowledge applied in production and operational environments.",
          skills_it_title: "Technologies & IT",
          skills_geo_title: "Geoscience & Engineering",
          skills_methods_title: "Methodologies",
          skills_methods_agile: "Agile (Scrum, Kanban, SAFe)",
          skills_lang_title: "Languages",
          skills_lang_es: "Spanish — Native",
          skills_lang_en: "English — Pre-Intermediate (B1)",
        
          sec_certs: "Certifications",
          sec_certs_desc: "Training focused on strengthening technical and professional skills.",
          cert_tabs_aria: "Certification categories",
          cert_tab_it: "Technology & IT",
          cert_tab_geo: "Drilling & Geoscience",
          cert_more_27: "View 27 more",
          cert_more_11: "View 11 more",
          cert_less: "Ver menos",

          cert_tec31_title: "Qt / PySide",
          cert_tec30_title: "Scrum / Agile",
          cert_tec29_title: "C# .NET",
          cert_tec28_title: "OOP with AI",
          cert_tec27_title: "AI",
          cert_tec26_title: "Azure",
          cert_tec25_title: "SQL Server Programming",
          cert_tec24_title: "JavaScript",
          cert_tec23_title: "Web Development",
          cert_tec22_title: "R Language",
          cert_tec21_title: "SQL Databases",
          cert_tec20_title: "SQL Server 2019",
          cert_tec19_title: "Linux Security",
          cert_tec18_title: "Linux Scripting",
          cert_tec17_title: "Web Security",
          cert_tec16_title: "Ethical Hacking",
          cert_tec15_title: "Linux Networking",
          cert_tec14_title: "Network Security",
          cert_tec13_title: "Computer Forensics",
          cert_tec12_title: "Windows Security",
          cert_tec11_title: "Mobile Hacking",
          cert_tec10_title: "HTTPS",
          cert_tec9_title: "Linux Administrator",
          cert_tec8_title: "Cryptography",
          cert_tec7_title: "Python Programming",
          cert_tec6_title: "Linux Operator",
          cert_tec5_title: "Python",
          cert_tec4_title: "Networking",
          cert_tec3_title: "Linux",
          cert_tec2_title: "Information Security",
          cert_tec1_title: "Databases",

          cert_ing15_title: "Geomechanics",
          cert_ing14_title: "StressCheck / CasingSeat",
          cert_ing13_title: "WellCat",
          cert_ing12_title: "OpenWells",
          cert_ing11_title: "WellPlan",
          cert_ing10_title: "Compass",
          cert_ing9_title: "DrillWorks",
          cert_ing8_title: "Excel",
          cert_ing7_title: "Directional Drilling",
          cert_ing6_title: "Cementing",
          cert_ing5_title: "Drilling Fluids",
          cert_ing4_title: "DIMS",
          cert_ing3_title: "Stratigraphy",
          cert_ing2_title: "Integrated Studies & Operational Geology",
          cert_ing1_title: "Subsurface Geology",


          sec_edu: "Education",
          sec_edu_desc: "Academic and technical education that complements my professional experience.",
          edu_status_done: "Completed",
          edu1_title: "Information Security",
          edu1_meta: "IT Education - Argentina · 2020 – 2021 ·",
          edu2_title: "Geologist Engineer",
          edu2_meta: "Universidad de Oriente - Venezuela · 2004 – 2011 ·",
          edu_tag_networks: "Networking",
          edu_tag_winlinux: "Windows/Linux",
          edu_tag_eh: "Ethical hacking",
          edu_tag_forensics: "Forensics",
          edu_tag_geology: "Geology",
          edu_tag_engineering: "Engineering",
          edu_tag_reservoirs: "Reservoirs",
          edu_tag_drilling: "Drilling",
          edu_btn_view_cert: "View Certificate",
          edu_btn_view_title: "View Degree",
          edu1_alt: "Certificate - Cybersecurity",
          edu2_alt: "Degree - Geologist Engineer",
        
          sec_contacto: "Contact",
          sec_contacto_desc:
            "You can reach out for job opportunities, projects, or collaborations. I’m open to chat and deliver value.",
          contact_send_email: "Send email",
          contact_label_email: "Email:",
          contact_label_whatsapp: "WhatsApp:",
          contact_label_linkedin: "LinkedIn:",
        
          footer_rights: "All rights reserved.",
          footer_back_top: "Back to top ↑",
        },
      
        "pt-BR": {
          skip_to_content: "Ir para o conteúdo",
          brand_inicio_label: "Início",
          nav_aria_desktop: "Navegação principal",
          nav_aria_mobile: "Menu móvel",
          nav_open_menu_aria: "Abrir menu",
          lang_btn_aria: "Trocar idioma",
          lang_menu_aria: "Idiomas",
          modal_preview_aria: "Visualização",
          modal_close_aria: "Fechar",
        
          nav_inicio: "Início",
          nav_servicios: "Serviços",
          nav_proyectos: "Projetos",
          nav_experiencia: "Experiência",
          nav_habilidades: "Habilidades",
          nav_certs: "Certificações",
          nav_edu: "Educação",
          nav_contacto: "Contato",
          nav_menu: "Menu",
          lang_label: "Idioma",
        
          kicker_0: "Apps · Administração · Implementação · Suporte Funcional",
          kicker_list: JSON.stringify([
            "Apps · Administração · Implementação · Suporte Funcional",
            "Infraestrutura · Segurança · SysAdmin · Cloud · Escalabilidade",
            "BD · Observabilidade · Métricas · Performance · Otimização",
            "Programação · Python · PowerShell · Bash · Automação",
            "Oil & Gas · Engenharia · Perfuração · Workover · Geonavegação",
          ]),
        
          hero_h1: "Infraestrutura estável, processos claros e menos incidentes em operações críticas.",
          hero_lead:
            "Engenheiro Geólogo com experiência em Oil & Gas, focado na integração entre tecnologia e operações. Atuei em ambientes de produção gerenciando e implantando soluções de TI, automação e suporte a infraestruturas críticas, contribuindo para eficiência e continuidade operacional em perfuração, desenvolvimento e operações.",
          hero_cta_contacto: "Falar comigo",
          hero_cta_cv: "Baixar CV (PDF)",
        
          hero_profile_aria: "Perfil",
          hero_avatar_alt: "Foto de Douglas Mendoza",
          hero_profile_meta: "Neuquén, Argentina · Inglês B1",
          hero_mini_actual_label: "Atual:",
          hero_mini_actual_value: "Suporte a Aplicações Upstream",
          hero_mini_db_label: "BD:",
          hero_mini_db_value: "Oracle + MS SQL Server",
          hero_mini_auto_label: "Automação:",
          hero_mini_auto_value: "Python + PowerShell",
          hero_btn_linkedin: "LinkedIn",
          hero_btn_email: "Email",
          hero_btn_whatsapp: "WhatsApp",
          hero_btn_github: "GitHub",
        
          sec_servicios: "Serviços",
          sec_servicios_desc:
            "Experiência prática em operação, estabilidade e suporte de sistemas críticos em Oil & Gas, ambientes de produção e TI corporativa.",
        
          srv1_title: "Suporte de Apps (Oil & Gas)",
          srv1_desc:
            "Suporte funcional e técnico para aplicações críticas de operações de poços—garantindo continuidade, estabilidade e adoção pelos usuários.",
          srv1_li1: "OpenWells, Autosync, Data Analyzer, Profile",
          srv1_li2: "RTIC: StarSteer, Corva, Pason",
          srv1_li3: "Treinamento, gestão de incidentes e continuidade",
        
          srv2_title: "Implementação & Deploy",
          srv2_desc:
            "Implantação (go-live) de aplicações e serviços com controle de configuração, estabilidade e troubleshooting pós-lançamento.",
          srv2_li1: "Tomcat, Nginx, IIS, Apache, cPanel",
          srv2_li2: "Releases, validação, rollback e troubleshooting",
          srv2_li3: "Ambientes Test/Prod, parametrização e suporte",
        
          srv3_title: "Suporte IT & Admin (AD / M365)",
          srv3_desc:
            "Administração de domínio e e-mail, além de suporte a usuários—garantindo operação diária e continuidade do negócio.",
          srv3_li1: "Active Directory, GPOs, permissões e acessos",
          srv3_li2: "Microsoft 365 / Exchange: contas e troubleshooting",
          srv3_li3: "Suporte a PMEs e grandes empresas (remoto / presencial)",
        
          srv4_title: "Infraestrutura & SysAdmin",
          srv4_desc:
            "Gestão de infraestrutura on-premises e cloud com foco em disponibilidade, segurança básica e continuidade operacional.",
          srv4_li1: "Windows Server / Linux (on-premises e cloud)",
          srv4_li2: "Firewall, VPN, acesso remoto e networking",
          srv4_li3: "Patches, hardening básico e backups",
        
          srv5_title: "Databases & Performance",
          srv5_desc:
            "Administração e otimização de bancos de dados para garantir performance, integridade e acesso controlado.",
          srv5_li1: "Oracle, SQL Server, MySQL",
          srv5_li2: "Roles, permissões, backups e acessos",
          srv5_li3: "Otimização de queries, SPs e triggers",
        
          srv6_title: "Observabilidade & Monitoramento",
          srv6_desc:
            "Monitoramento de aplicações e infraestrutura para detecção precoce de incidentes e análise básica de causa raiz.",
          srv6_li1: "Dashboards no Grafana",
          srv6_li2: "Nagios XI, alertas e métricas",
          srv6_li3: "Análise de logs e RCA básico",
        
          srv7_title: "Automação & Scripting",
          srv7_desc:
            "Automações e ferramentas internas para melhorar eficiência operacional e reduzir erros manuais.",
          srv7_li1: "Python (PySide6, pandas), PowerShell, Bash",
          srv7_li2: "ETL leve, relatórios e scripts",
          srv7_li3: "Ferramentas internas sob medida",
        
          srv8_title: "Drilling & Geonavegação",
          srv8_desc:
            "Assessoria técnica em perfuração e workover com foco em otimização de tempo, custo e execução em campo.",
          srv8_li1: "Programas operacionais de perfuração e workover",
          srv8_li2: "Desenho de trajetórias, geonavegação e simulações",
          srv8_li3: "Tempo, custos (AFE), KPIs, NPT e performance",
        
          sec_proyectos: "Projetos",
          sec_proyectos_desc:
            "Soluções reais desenvolvidas e operadas em ambientes produtivos. Automação, monitoramento e ferramentas para reduzir incidentes e melhorar a eficiência operacional.",
        
          proj1_tag: "Analytics",
          proj1_title: "Analítica de Suporte Operacional",
          proj1_li1: "Painel de KPIs para INC/REQ: volume, status e SLA médio.",
          proj1_li2: "Análise de Pareto, tendências e gráficos de rosca por aplicação / CI / descrição.",
          proj1_li3: "Suporta drill-down: clique nos gráficos para abrir detalhes e acelerar decisões.",
          proj1_result: "visibilidade operacional e tomada de decisão",
          proj1_img1_alt: "Analítica de Suporte (Totalizadores)",
          proj1_img1_alt_img: "Analítica de Suporte (Totalizadores)",
          proj1_img2_alt: "KPIs e Análises (Pareto / Tendências / Roscas)",
          proj1_img2_alt_img: "KPIs e Análises (Pareto / Tendências / Roscas)",

          proj2_tag: "Automação",
          proj2_title: "Aplicação desktop de suporte",
          proj2_li1: "Automatiza tarefas repetitivas e consultas em múltiplas fontes.",
          proj2_li2: "Centraliza bancos e utilitários em uma única interface para a equipe de suporte.",
          proj2_li3: "Foco em estabilidade: menos passos manuais e menos erros operacionais.",
          proj2_result: "menos tarefas manuais",
          proj2_img1_alt: "Aplicação Interna de Suporte (Consultas, Comandos, CRUD, Scripts)",
          proj2_img1_alt_img: "Aplicação Interna de Suporte (Consultas, Comandos, CRUD, Scripts)",
          proj2_img2_alt: "Aplicação Interna de Suporte (Sobre)",
          proj2_img2_alt_img: "Aplicação Interna de Suporte (Sobre)",

          proj3_tag: "Monitoramento",
          proj3_title: "Dashboard de monitoramento operacional",
          proj3_li1: "Monitoramento de PCs de operações de poço (Drilling, Workover, Pulling).",
          proj3_li2: "Métricas e alertas para apps críticas (OpenWells, Autosync, YClick).",
          proj3_li3: "Detecção precoce para reduzir incidentes e indisponibilidade.",
          proj3_result: "detecção precoce",
          proj3_img1_alt: "Estado Operacional de Equipamentos e Aplicações",
          proj3_img1_alt_img: "Estado Operacional de Equipamentos e Aplicações",
          proj3_img2_alt: "Histórico do Equipamento",
          proj3_img2_alt_img: "Histórico do Equipamento",

          proj4_tag: "Perfuração",
          proj4_title: "VCDE – Macolla Cacique Chaima (Pad de 50 poços)",
          proj4_li1: "Visualização e definição do desenvolvimento do pad utilizando a metodologia FEL.",
          proj4_li2: "Engenharia de poço e planejamento operacional (programas, materiais e serviços).",
          proj4_li3: "Execução e monitoramento de KPIs, NPT e performance de perfuração.",
          proj4_result: "controle operacional, mitigação de riscos",
          proj4_img1_alt: "Visão geral do Pad (Fotografia aérea e design de software)",
          proj4_img1_alt_img: "Visão geral do Pad (Fotografia aérea e design de software)",
          proj4_img2_alt: "Trajetórias de poços – Visão 2D e 3D no Compass",
          proj4_img2_alt_img: "Trajetórias de poços – Visão 2D e 3D no Compass",

          label_tip: "Dica:",
          label_stack: "Stack:",
          label_resultado: "Resultado:",
          proj_cta_demo: "Pedir demo",
        
          sec_experiencia: "Experiência",
          sec_experiencia_desc:
            "Minha trajetória profissional abrange diferentes áreas técnicas, de operações em campo a tecnologia e suporte de aplicações—integrando conhecimento operacional com soluções digitais.",
        
          xp_econat_logo_alt: "Logo ECONAT",
          xp_doctec_logo_alt: "Logo DOCTEC",
          xp_pdvsa_logo_alt: "Logo PDVSA",
        
          xp_remote: "Remoto",
          xp_on_site: "Presencial",
          xp_on_site_remote: "Presencial/Remoto",
          xp_loc_neuquen_ar: "Neuquén, Argentina",
          xp_loc_caba_ar: "CABA, Argentina",
          xp_loc_monagas_ve: "Monagas, Venezuela",
        
          xp1_title: "Administração e suporte de aplicações",
          xp1_dates: "Abril 2022 – Atual",
          xp1_li1: "Deploy e suporte de aplicações de operações de poços (on-prem e cloud).",
          xp1_li2: "BD Oracle/SQL Server: performance, acessos, scripts SQL (DML/DCL), SP e triggers.",
          xp1_li3: "Automação com Python (PySide6), batch e Selenium (fluxos em app interna).",
          xp1_li4: "Observabilidade e incidentes: Grafana + logs + ServiceNow ITCM (Kanban).",
          xp1_li5: "Suporte e treinamento a usuários (OpenWells, Autosync, Data Analyzer, Profile, RTIC).",
        
          xp2_title: "Sysadmin e implementação de aplicações",
          xp2_dates: "Agosto 2021 – Maio 2024",
          xp2_li1: "Linux (Ubuntu) e Windows Server (on-prem/cloud): serviços, firewall, rede e acesso remoto.",
          xp2_li2: "Web/IIS/Apache/Nginx e deploys com cPanel.",
          xp2_li3: "Tomcat + MySQL + SQL Server: implementação e manutenção (Test/Prod).",
          xp2_li4: "Monitoramento com Nagios XI e troubleshooting via logs.",
          xp2_li5: "Testes e APIs: TestLink + Postman/SoapUI; releases (Mantis/ClickUp).",
        
          xp3_title: "Engenheiro de Perfuração",
          xp3_dates: "Fevereiro 2013 – Julho 2017",
          xp3_li1: "Desenho e replanejamento de trajetórias direcionais (Compass / Landmark).",
          xp3_li2: "Simulações de torque/drag, hidráulica e cimentação para otimizar perfuração.",
          xp3_li3: "Elaboração de procedimentos operacionais de perfuração e workover.",
          xp3_li4: "Estimativa de tempo e custos (AFE) e controle de execução em campo.",
          xp3_li5: "Análise de KPIs e NPT para acompanhar performance operacional.",
        
          sec_habilidades: "Habilidades",
          sec_habilidades_desc: "Tecnologias, ferramentas e conhecimentos aplicados em ambientes produtivos e operacionais.",
          skills_it_title: "Tecnologias & IT",
          skills_geo_title: "Geociências e Engenharia",
          skills_methods_title: "Metodologias",
          skills_methods_agile: "Agile (Scrum, Kanban, SAFe)",
          skills_lang_title: "Idiomas",
          skills_lang_es: "Espanhol — Nativo",
          skills_lang_en: "Inglês — Pre-Intermediate (B1)",
        
          sec_certs: "Certificações",
          sec_certs_desc: "Formação voltada ao fortalecimento de competências técnicas e profissionais.",
          cert_tabs_aria: "Categorias de certificações",
          cert_tab_it: "Tecnologia & IT",
          cert_tab_geo: "Perfuração & Geociência",
          cert_more_27: "Ver mais 27",
          cert_more_11: "Ver mais 11",
          cert_less: "Show less",

          cert_tec31_title: "Qt / PySide",
          cert_tec30_title: "Scrum / Agile",
          cert_tec29_title: "C# .NET",
          cert_tec28_title: "POO com IA",
          cert_tec27_title: "IA",
          cert_tec26_title: "Azure",
          cert_tec25_title: "Programação com SQL Server",
          cert_tec24_title: "JavaScript",
          cert_tec23_title: "Desenvolvimento Web",
          cert_tec22_title: "Linguagem R",
          cert_tec21_title: "Bancos de dados SQL",
          cert_tec20_title: "SQL Server 2019",
          cert_tec19_title: "Segurança em Linux",
          cert_tec18_title: "Scripting Linux",
          cert_tec17_title: "Segurança Web",
          cert_tec16_title: "Ethical Hacking",
          cert_tec15_title: "Redes Linux",
          cert_tec14_title: "Segurança em Redes",
          cert_tec13_title: "Informática Forense",
          cert_tec12_title: "Segurança em Windows",
          cert_tec11_title: "Mobile Hacking",
          cert_tec10_title: "HTTPS",
          cert_tec9_title: "Administrador Linux",
          cert_tec8_title: "Criptografia",
          cert_tec7_title: "Programação em Python",
          cert_tec6_title: "Operador Linux",
          cert_tec5_title: "Python",
          cert_tec4_title: "Redes",
          cert_tec3_title: "Linux",
          cert_tec2_title: "Segurança da Informação",
          cert_tec1_title: "Banco de dados",

          cert_ing15_title: "Geomecânica",
          cert_ing14_title: "StressCheck / CasingSeat",
          cert_ing13_title: "WellCat",
          cert_ing12_title: "OpenWells",
          cert_ing11_title: "WellPlan",
          cert_ing10_title: "Compass",
          cert_ing9_title: "DrillWorks",
          cert_ing8_title: "Excel",
          cert_ing7_title: "Perfuração Direcional",
          cert_ing6_title: "Cimentação",
          cert_ing5_title: "Fluidos de Perfuração",
          cert_ing4_title: "DIMS",
          cert_ing3_title: "Estratigrafia",
          cert_ing2_title: "EEII e Geologia Operacional",
          cert_ing1_title: "Geologia do subsolo",

          sec_edu: "Educação",
          sec_edu_desc: "Formação acadêmica e técnica que complementa minha experiência profissional.",
          edu_status_done: "Concluída",
          edu1_title: "Segurança da Informação",
          edu1_meta: "Educação IT - Argentina · 2020 – 2021 ·",
          edu2_title: "Engenheiro Geólogo",
          edu2_meta: "Universidad de Oriente - Venezuela · 2004 – 2011 ·",
          edu_tag_networks: "Redes",
          edu_tag_winlinux: "Windows/Linux",
          edu_tag_eh: "Hacking ético",
          edu_tag_forensics: "Forense",
          edu_tag_geology: "Geologia",
          edu_tag_engineering: "Engenharia",
          edu_tag_reservoirs: "Reservatórios",
          edu_tag_drilling: "Perfuração",
          edu_btn_view_cert: "Ver certificado",
          edu_btn_view_title: "Ver diploma",
          edu1_alt: "Certificado - Cibersegurança",
          edu2_alt: "Diploma - Engenheiro Geólogo",
        
          sec_contacto: "Contato",
          sec_contacto_desc:
            "Você pode me contatar para oportunidades, projetos ou colaborações. Estou aberto a conversar e gerar valor.",
          contact_send_email: "Enviar email",
          contact_label_email: "Email:",
          contact_label_whatsapp: "WhatsApp:",
          contact_label_linkedin: "LinkedIn:",
        
          footer_rights: "Todos os direitos reservados.",
          footer_back_top: "Voltar ao topo ↑",
        },
      };


      const setTextNodes = (dict) => {
        document.querySelectorAll('[data-i18n]').forEach((el) => {
          const key = el.getAttribute('data-i18n');
          if (key && dict[key] != null) el.textContent = dict[key];
        });
      };

      const setAttrNodes = (dict) => {
        document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
          const spec = el.getAttribute('data-i18n-attr');
          if (!spec) return;

          spec.split(';').forEach((pair) => {
            const [attr, key] = pair.split(':').map((s) => (s || '').trim());
            if (!attr || !key) return;
            if (dict[key] != null) el.setAttribute(attr, dict[key]);
          });
        });
      };

      const setDataNodes = (dict) => {
        document.querySelectorAll('[data-i18n-data]').forEach((el) => {
          const spec = el.getAttribute('data-i18n-data');
          if (!spec) return;

          spec.split(';').forEach((pair) => {
            const [dataKey, key] = pair.split(':').map((s) => (s || '').trim());
            if (!dataKey || !key) return;
            if (dict[key] != null) el.dataset[dataKey] = dict[key];
          });
        });
      };

      const refreshKickerWords = () => {
        const el = document.querySelector('.kicker-dynamic .kicker-word');
        if (!el) return;

        let list = [];
        try {
          list = el.dataset.kickerList ? JSON.parse(el.dataset.kickerList) : [];
        } catch (_) {
          list = [];
        }

        window.__kickerWords = (Array.isArray(list) && list.length)
          ? list
          : [el.textContent.trim()];
      };

      const applyLang = (lang) => {
        const dict = i18n[lang] || i18n.es;
      
        root.lang = lang.startsWith('pt') ? 'pt-BR' : lang;
        localStorage.setItem('lang', lang);
      
        window.__i18nDict = dict;
      
        setTextNodes(dict);
        setAttrNodes(dict);
        setDataNodes(dict);
        refreshKickerWords();
        initKickerDynamic();
      
        // etiqueta ES/EN/PT del botón (desktop)
        const label = (lang === 'pt-BR') ? 'PT' : lang.toUpperCase();
        $$('.lang-btn').forEach((btn) => (btn.textContent = label));
      
        // ====== CV PDF según idioma ======
        const cv = document.getElementById('cvDownload');
        if (cv) {
          // lang puede ser: "es", "en", "pt-BR"
          const isSpanish = (lang === 'es');
          const file = isSpanish
            ? 'assets/pdf/CV_DOUGLAS-MENDOZA.pdf'
            : 'assets/pdf/CS_DOUGLAS-MENDOZA.pdf';
        
          cv.href = file;
          cv.setAttribute('download', file.split('/').pop());
        }
      };


      // idioma inicial
      const saved = localStorage.getItem('lang');
      const browser = (navigator.language || 'es').toLowerCase();
      const initial =
        saved || (browser.startsWith('pt') ? 'pt-BR' : browser.startsWith('en') ? 'en' : 'es');
      applyLang(initial);

      // ====== EVENTOS (corregidos) ======
      document.addEventListener('click', (e) => {
        // A) abrir/cerrar dropdown desktop
        const btn = e.target.closest('.lang-btn');
        if (btn) {
          e.preventDefault();
          e.stopPropagation(); // 👈 evita que el mismo click lo cierre por el "click afuera"
          const wrap = btn.closest('.lang');
          if (wrap) wrap.classList.toggle('is-open');
          return;
        }

        // B) seleccionar idioma (desktop o mobile)
        const item = e.target.closest('.lang-item[data-lang]');
        if (item) {
          e.preventDefault();
          applyLang(item.dataset.lang);

          // cierra dropdown desktop (si estaba abierto)
          $$('.lang').forEach((w) => w.classList.remove('is-open'));
          return;
        }

        // C) click afuera: cerrar dropdown desktop
        $$('.lang').forEach((w) => w.classList.remove('is-open'));
      });
    }

    /* ==========================================================
       Boot (arranque)
    ========================================================== */
    function boot() {
      initYear();

      const mobileNav = initMobileNav();
      const lightbox = initLightbox();
      const imageModal = initImageModal();

      initCertTabs();

      // ✅ orden correcto
      initLangSwitcher();
      initKickerDynamic();
      initH1Typing();

      initGlobalEscapeHandlers({ mobileNav, imageModal, lightbox });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot);
    } else {
      boot();
    }
  })();
