/**
 * PAYFLOW — Vanilla JavaScript Architecture & Animation Engine
 * Pure ES6+, Zero External Dependencies
 * Dead-Centered Hero Wordmark & Radial Explosion Engine
 */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================================
     GLOBAL STATE & CACHED DOM REFERENCES
     ========================================================================== */

  const state = {
    scrollCurrent: 0,
    scrollTarget: 0,
    scrollVelocity: 0,
    prevScroll: 0,
    mouseX: -100,
    mouseY: -100,
    targetMouseX: -100,
    targetMouseY: -100,
    ringX: -100,
    ringY: -100,
    isDraggingPosters: false,
    posterStartY: 0,
    posterScrollY: 0,
    posterTargetY: 0,
    isTransitioning: false,
    currentTheme: 'light',
  };

  const DOM = {};

  function initDOMReferences() {
    DOM.root = document.documentElement;
    DOM.body = document.body;
    
    // Stages
    DOM.heroStage = document.getElementById('hero');
    DOM.revealStage = document.getElementById('image-reveal');
    DOM.compStage = document.getElementById('composition-stage');
    DOM.compRows = document.querySelectorAll('.comp-row');
    DOM.heroAnimates = document.querySelectorAll('.hero-animate');

    // Custom Cursor
    DOM.cursorDot = document.getElementById('cursor-dot');
    DOM.cursorRing = document.getElementById('cursor-ring');

    // Scroll Progress Rail
    DOM.scrollRailNum = document.getElementById('scroll-rail-num');
    DOM.scrollRailFill = document.getElementById('scroll-rail-fill');

    // Exploded Hero Components (Radiating outward from centered PAYFLOW wordmark)
    DOM.expCards = [
      { el: document.getElementById('exp-comp-main'),      x: -60,  y: 140,  r: -3,  s: 1.02 },
      { el: document.getElementById('exp-comp-amount'),    x: 340,  y: -220, r: 8,   s: 1.08 },
      { el: document.getElementById('exp-comp-customer'),  x: -360, y: -240, r: -10, s: 1.05 },
      { el: document.getElementById('exp-comp-api'),       x: 360,  y: 240,  r: -6,  s: 1.02 },
      { el: document.getElementById('exp-comp-security'),  x: -340, y: 260,  r: 12,  s: 1.05 },
      { el: document.getElementById('exp-comp-analytics'), x: 440,  y: 20,   r: -12, s: 0.95 },
      { el: document.getElementById('exp-comp-status'),    x: 0,    y: -320, r: 4,   s: 1.1 }
    ];

    // Flying Posters
    DOM.postersViewport = document.getElementById('posters-viewport');
    DOM.postersWorld = document.getElementById('posters-world');
    DOM.posterCards = document.querySelectorAll('.poster-card');

    // Navigation & Mobile Drawer
    DOM.hamburger = document.getElementById('hamburger-toggle');
    DOM.mobileDrawer = document.getElementById('mobile-drawer');
    DOM.mobileDrawerClose = document.getElementById('mobile-drawer-close');
    DOM.dropdowns = document.querySelectorAll('[data-dropdown]');

    // Theme Toggle
    DOM.themeToggle = document.getElementById('theme-toggle');
    DOM.themeToggleText = document.getElementById('theme-toggle-text');

    // Page Transition
    DOM.pageTransition = document.getElementById('page-transition');
    DOM.transitionLoader = document.getElementById('transition-loader');
    DOM.transitionStrips = document.getElementById('transition-strips');
    DOM.loaderStep = document.getElementById('loader-step');
    DOM.loaderTitle = document.getElementById('loader-title');
    DOM.loaderProgressFill = document.getElementById('loader-progress-fill');

    // API Tabs & Copy
    DOM.tabBtns = document.querySelectorAll('.tab-btn');
    DOM.codeDisplay = document.getElementById('code-display');
    DOM.copyCodeBtn = document.getElementById('copy-code-btn');
    DOM.copyBtnText = document.getElementById('copy-btn-text');

    // Calculator
    DOM.volInput = document.getElementById('volume-input');
    DOM.volRange = document.getElementById('volume-range');
    DOM.txSizeInput = document.getElementById('tx-size-input');
    DOM.txSizeRange = document.getElementById('tx-size-range');
    DOM.calcTxCount = document.getElementById('calc-tx-count');
    DOM.calcPayflowCost = document.getElementById('calc-payflow-cost');
    DOM.calcAnnualSavings = document.getElementById('calc-annual-savings');
  }


  /* ==========================================================================
     CUSTOM DESKTOP CURSOR ENGINE
     ========================================================================== */

  function initCustomCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    window.addEventListener('mousemove', (e) => {
      state.mouseX = e.clientX;
      state.mouseY = e.clientY;
      state.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      state.targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;

      if (DOM.cursorDot) {
        DOM.cursorDot.style.transform = `translate3d(${state.mouseX}px, ${state.mouseY}px, 0)`;
      }
    });

    const interactiveTargets = document.querySelectorAll('a, button, input, .exp-card, .poster-card, details summary, .dropdown__toggle');
    interactiveTargets.forEach(el => {
      el.addEventListener('mouseenter', () => {
        if (DOM.cursorRing) DOM.cursorRing.classList.add('active');
      });
      el.addEventListener('mouseleave', () => {
        if (DOM.cursorRing) DOM.cursorRing.classList.remove('active');
      });
    });
  }

  function updateCursorRing() {
    if (!DOM.cursorRing || window.matchMedia('(pointer: coarse)').matches) return;

    state.ringX += (state.mouseX - state.ringX) * 0.18;
    state.ringY += (state.mouseY - state.ringY) * 0.18;
    DOM.cursorRing.style.transform = `translate3d(${state.ringX}px, ${state.ringY}px, 0)`;
  }


  /* ==========================================================================
     MAGNETIC CTA BUTTON SYSTEM
     ========================================================================== */

  function initMagneticButtons() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const magneticBtns = document.querySelectorAll('.btn--magnetic');
    magneticBtns.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const btnCenterX = rect.left + rect.width / 2;
        const btnCenterY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - btnCenterX) * 0.25;
        const deltaY = (e.clientY - btnCenterY) * 0.25;

        const maxOffset = 8;
        const clampedX = Math.max(-maxOffset, Math.min(maxOffset, deltaX));
        const clampedY = Math.max(-maxOffset, Math.min(maxOffset, deltaY));

        btn.style.transform = `translate3d(${clampedX}px, ${clampedY}px, 0)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate3d(0, 0, 0)';
      });
    });
  }


  /* ==========================================================================
     IMAGE FADING & LOAD STATE CHOREOGRAPHY
     ========================================================================== */

  function initImageLoading() {
    const fadeImages = document.querySelectorAll('.fade-image');
    fadeImages.forEach(img => {
      if (img.complete) {
        img.classList.add('loaded');
      } else {
        img.addEventListener('load', () => {
          img.classList.add('loaded');
        });
      }
    });
  }


  /* ==========================================================================
     HERO ENTRANCE CHOREOGRAPHY
     ========================================================================== */

  function triggerHeroEntrance() {
    if (!DOM.heroAnimates) return;
    DOM.heroAnimates.forEach((el, idx) => {
      setTimeout(() => {
        el.classList.add('loaded');
      }, idx * 120);
    });
  }


  /* ==========================================================================
     DARK / LIGHT THEME ENGINE
     ========================================================================== */

  function applyTheme(theme) {
    state.currentTheme = theme;
    DOM.root.setAttribute('data-theme', theme);
    if (DOM.themeToggleText) {
      DOM.themeToggleText.innerText = theme === 'light' ? 'DARK' : 'LIGHT';
    }
    try {
      localStorage.setItem('payflow-theme', theme);
    } catch (e) {}
  }

  function initThemeEngine() {
    let savedTheme = 'light';
    try {
      savedTheme = localStorage.getItem('payflow-theme');
    } catch (e) {}

    if (!savedTheme) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      savedTheme = prefersDark ? 'dark' : 'light';
    }

    applyTheme(savedTheme);

    if (DOM.themeToggle) {
      DOM.themeToggle.addEventListener('click', () => {
        const nextTheme = state.currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(nextTheme);
      });
    }
  }


  /* ==========================================================================
     CINEMATIC EDITORIAL STRIP LINK TRANSITION ENGINE
     ========================================================================== */

  const sectionMetaMap = {
    'hero':                 { step: '01 / 11', title: 'GLOBAL PAYMENTS' },
    'product-story':        { step: '03 / 11', title: 'INFRASTRUCTURE' },
    'image-reveal':         { step: '04 / 11', title: 'SYSTEM REVEAL' },
    'editorial-statement':  { step: '05 / 11', title: 'PHILOSOPHY' },
    'flying-posters':       { step: '06 / 11', title: 'ENGINE SUITE' },
    'developer-api':        { step: '07 / 11', title: 'DEVELOPER API' },
    'composition-stage':    { step: '08 / 11', title: 'TELEMETRY' },
    'pricing':              { step: '09 / 11', title: 'TRANSPARENT PRICING' },
    'pricing-calculator':   { step: '09 / 11', title: 'PRICING CALCULATOR' },
    'faq':                  { step: '10 / 11', title: 'FAQ & RESOURCES' },
    'closer':               { step: '11 / 11', title: 'PAYFLOW CLOSER' }
  };

  function triggerCinematicTransition(targetHash) {
    if (state.isTransitioning) return;
    state.isTransitioning = true;

    const cleanHash = targetHash.replace('#', '');
    const meta = sectionMetaMap[cleanHash] || { step: '01 / 11', title: 'PAYFLOW EXPERIENCE' };

    if (DOM.loaderStep) DOM.loaderStep.innerText = meta.step;
    if (DOM.loaderTitle) DOM.loaderTitle.innerText = meta.title;

    if (DOM.mobileDrawer) DOM.mobileDrawer.setAttribute('aria-hidden', 'true');

    if (prefersReducedMotion) {
      if (DOM.transitionLoader) DOM.transitionLoader.classList.add('active');
      setTimeout(() => {
        const targetEl = document.getElementById(cleanHash);
        if (targetEl) targetEl.scrollIntoView();
        window.location.hash = targetHash;
        if (DOM.transitionLoader) DOM.transitionLoader.classList.remove('active');
        state.isTransitioning = false;
      }, 200);
      return;
    }

    if (DOM.transitionLoader) DOM.transitionLoader.classList.add('active');
    if (DOM.loaderProgressFill) {
      DOM.loaderProgressFill.style.transition = 'none';
      DOM.loaderProgressFill.style.width = '0%';
      requestAnimationFrame(() => {
        DOM.loaderProgressFill.style.transition = 'width 1000ms cubic-bezier(0.2, 0.8, 0.2, 1)';
        DOM.loaderProgressFill.style.width = '100%';
      });
    }

    setTimeout(() => {
      if (DOM.transitionStrips) {
        DOM.transitionStrips.classList.remove('clear');
        DOM.transitionStrips.classList.add('active');
      }
    }, 1000);

    setTimeout(() => {
      const targetEl = document.getElementById(cleanHash);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'auto' });
      }
      history.pushState(null, null, targetHash);
    }, 1260);

    setTimeout(() => {
      if (DOM.transitionLoader) DOM.transitionLoader.classList.remove('active');
      if (DOM.transitionStrips) {
        DOM.transitionStrips.classList.remove('active');
        DOM.transitionStrips.classList.add('clear');
      }
    }, 1480);

    setTimeout(() => {
      if (DOM.transitionStrips) DOM.transitionStrips.classList.remove('clear');
      state.isTransitioning = false;
    }, 1800);
  }

  function initLinkTransitionEngine() {
    document.addEventListener('click', (e) => {
      const anchor = e.target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');

      if (href && href.startsWith('#') && href.length > 1) {
        e.preventDefault();
        triggerCinematicTransition(href);
      }
    });
  }


  /* ==========================================================================
     WORD REVEAL ANIMATION SYSTEM
     ========================================================================== */

  function initWordReveals() {
    const revealTargets = document.querySelectorAll('.word-reveal');

    revealTargets.forEach(el => {
      const text = el.innerText.trim();
      const words = text.split(/\s+/);
      
      el.innerHTML = words.map(word => `<span class="word">${word}</span>`).join(' ');

      const spans = el.querySelectorAll('.word');
      spans.forEach((span, idx) => {
        span.style.transitionDelay = `${idx * 38}ms`;
      });
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealTargets.forEach(target => observer.observe(target));
  }


  /* ==========================================================================
     EXPLODED HERO STAGE LOGIC (Dead-Centered PAYFLOW Anchor)
     ========================================================================== */

  function updateHeroStage(heroProgress) {
    if (prefersReducedMotion || !DOM.heroStage) return;

    let explosionFactor = 0;
    if (heroProgress <= 0.60) {
      explosionFactor = Math.sin((heroProgress / 0.60) * (Math.PI / 2));
    } else {
      const returnRatio = (1 - heroProgress) / 0.40;
      explosionFactor = Math.sin(returnRatio * (Math.PI / 2));
    }

    DOM.expCards.forEach((card, idx) => {
      if (!card.el) return;

      const currentX = card.x * explosionFactor;
      const currentY = card.y * explosionFactor;
      const currentR = card.r * explosionFactor;
      const currentS = 1 + (card.s - 1) * explosionFactor;
      const opacity = heroProgress > 0.95 ? 0.4 : 1;

      card.el.style.setProperty(`--hero-x-${idx + 1}`, `${currentX}px`);
      card.el.style.setProperty(`--hero-y-${idx + 1}`, `${currentY}px`);
      card.el.style.setProperty(`--hero-r-${idx + 1}`, `${currentR}deg`);
      card.el.style.setProperty(`--hero-s-${idx + 1}`, `${currentS}`);
      card.el.style.setProperty(`--hero-op-${idx + 1}`, opacity);
    });

    DOM.root.style.setProperty('--hero-progress', heroProgress.toFixed(4));
  }


  /* ==========================================================================
     IMAGE REVEAL STAGE LOGIC
     ========================================================================== */

  function updateImageRevealStage(revealProgress) {
    if (!DOM.revealStage) return;
    DOM.root.style.setProperty('--image-progress', revealProgress.toFixed(4));
  }


  /* ==========================================================================
     COMPOSITION STAGE LOGIC
     ========================================================================== */

  function updateCompositionStage(compProgress) {
    if (!DOM.compStage) return;
    DOM.root.style.setProperty('--comp-progress', compProgress.toFixed(4));

    if (DOM.compRows && DOM.compRows.length > 0) {
      DOM.compRows.forEach((row, idx) => {
        const stepThreshold = (idx + 1) * 0.22;
        if (compProgress >= stepThreshold) {
          row.classList.add('active');
        } else {
          row.classList.remove('active');
        }
      });
    }
  }


  /* ==========================================================================
     FLYING POSTERS 3D ENGINE (VANILLA JS)
     ========================================================================== */

  function updateFlyingPosters() {
    if (!DOM.postersViewport || !DOM.posterCards || DOM.posterCards.length === 0) return;
    if (prefersReducedMotion) return;

    state.mouseX += (state.targetMouseX - state.mouseX) * 0.08;
    state.mouseY += (state.targetMouseY - state.mouseY) * 0.08;
    state.posterScrollY += (state.posterTargetY - state.posterScrollY) * 0.08;

    const totalPosters = DOM.posterCards.length;
    const spacing = 140;
    const totalSpan = totalPosters * spacing;
    const velocityTransform = state.scrollVelocity * 0.05;

    DOM.posterCards.forEach((card, idx) => {
      let rawY = (idx * spacing + state.posterScrollY) % totalSpan;
      if (rawY < -totalSpan / 2) rawY += totalSpan;
      if (rawY > totalSpan / 2) rawY -= totalSpan;

      const normY = rawY / (totalSpan / 2);
      const zOffset = (1 - Math.abs(normY)) * 120 - 150;
      const rotX = normY * -25 + state.mouseY * 15;
      const rotY = state.mouseX * 20;
      const rotZ = normY * 8 + velocityTransform;
      const scale = Math.max(0.7, 1 - Math.abs(normY) * 0.25);
      const opacity = Math.max(0, 1 - Math.abs(normY) * 0.85);

      card.style.transform = `
        translate3d(0, ${rawY}px, ${zOffset}px) 
        rotateX(${rotX}deg) 
        rotateY(${rotY}deg) 
        rotateZ(${rotZ}deg) 
        scale(${scale})
      `;
      card.style.opacity = opacity.toFixed(3);
    });
  }

  function initPosterInteractions() {
    if (!DOM.postersViewport) return;

    DOM.postersViewport.addEventListener('touchstart', (e) => {
      state.isDraggingPosters = true;
      state.posterStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!state.isDraggingPosters) return;
      const deltaY = e.touches[0].clientY - state.posterStartY;
      state.posterTargetY += deltaY * 1.2;
      state.posterStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', () => {
      state.isDraggingPosters = false;
    });
  }


  /* ==========================================================================
     DEVELOPER CODE TAB SWITCHER
     ========================================================================== */

  const codeSnippets = {
    curl: `<span class="code-comment"># Initialize a direct Payflow transaction</span>
<span class="code-keyword">curl</span> -X POST https://api.payflow.com/v1/payments \\
  -H <span class="code-string">"Authorization: Bearer pf_live_8K2L9104A"</span> \\
  -H <span class="code-string">"Content-Type: application/json"</span> \\
  -d '{
    <span class="code-key">"amount"</span>: <span class="code-num">284000</span>,
    <span class="code-key">"currency"</span>: <span class="code-string">"usd"</span>,
    <span class="code-key">"customer"</span>: <span class="code-string">"cus_8K2L91"</span>,
    <span class="code-key">"capture"</span>: <span class="code-bool">true</span>
  }'`,

    node: `<span class="code-comment">// Node.js ES6 Payflow Integration</span>
<span class="code-keyword">import</span> { Payflow } <span class="code-keyword">from</span> <span class="code-string">'@payflow/sdk'</span>;

<span class="code-keyword">const</span> payflow = <span class="code-keyword">new</span> Payflow(<span class="code-string">'pf_live_8K2L9104A'</span>);

<span class="code-keyword">const</span> payment = <span class="code-keyword">await</span> payflow.payments.create({
  amount: <span class="code-num">284000</span>,
  currency: <span class="code-string">'usd'</span>,
  customer: <span class="code-string">'cus_8K2L91'</span>,
  telemetryRouting: <span class="code-bool">true</span>
});`,

    python: `<span class="code-comment"># Python Async Payflow SDK</span>
<span class="code-keyword">import</span> payflow

payflow.api_key = <span class="code-string">"pf_live_8K2L9104A"</span>

payment = payflow.Payment.create(
    amount=<span class="code-num">284000</span>,
    currency=<span class="code-string">"usd"</span>,
    customer=<span class="code-string">"cus_8K2L91"</span>,
    capture=<span class="code-bool">True</span>
)`,

    java: `<span class="code-comment">// Java Enterprise Payflow Client</span>
<span class="code-keyword">import</span> com.payflow.PayflowClient;
<span class="code-keyword">import</span> com.payflow.model.Payment;

PayflowClient client = <span class="code-keyword">new</span> PayflowClient(<span class="code-string">"pf_live_8K2L9104A"</span>);

Payment payment = client.payments().create(
    Payment.builder()
        .setAmount(<span class="code-num">284000L</span>)
        .setCurrency(<span class="code-string">"usd"</span>)
        .setCustomer(<span class="code-string">"cus_8K2L91"</span>)
        .build()
);`
  };

  function initCodeTabs() {
    if (!DOM.tabBtns || !DOM.codeDisplay) return;

    DOM.tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        DOM.tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const lang = btn.getAttribute('data-lang');
        if (codeSnippets[lang]) {
          DOM.codeDisplay.innerHTML = codeSnippets[lang];
        }
      });
    });

    if (DOM.copyCodeBtn) {
      DOM.copyCodeBtn.addEventListener('click', () => {
        const plainText = DOM.codeDisplay.innerText;
        navigator.clipboard.writeText(plainText).then(() => {
          DOM.copyBtnText.innerText = 'Copied!';
          setTimeout(() => {
            DOM.copyBtnText.innerText = 'Copy snippet';
          }, 2000);
        });
      });
    }
  }


  /* ==========================================================================
     PRICING CALCULATOR LOGIC
     ========================================================================== */

  function formatCurrency(val) { return '$' + Math.round(val).toLocaleString('en-US'); }
  function formatNumber(val) { return Math.round(val).toLocaleString('en-US'); }

  function updateCalculator() {
    if (!DOM.volInput || !DOM.txSizeInput) return;

    const volume = parseFloat(DOM.volInput.value) || 0;
    const txSize = parseFloat(DOM.txSizeInput.value) || 1;

    const txCount = volume / txSize;
    const payflowCost = (volume * 0.022) + (txCount * 0.15);
    const legacyCost = (volume * 0.029) + (txCount * 0.30);
    const annualSavings = Math.max(0, (legacyCost - payflowCost) * 12);

    if (DOM.calcTxCount) DOM.calcTxCount.innerText = formatNumber(txCount);
    if (DOM.calcPayflowCost) DOM.calcPayflowCost.innerText = formatCurrency(payflowCost);
    if (DOM.calcAnnualSavings) DOM.calcAnnualSavings.innerText = formatCurrency(annualSavings);
  }

  function initCalculator() {
    if (!DOM.volInput) return;

    DOM.volInput.addEventListener('input', () => {
      DOM.volRange.value = DOM.volInput.value;
      updateCalculator();
    });

    DOM.volRange.addEventListener('input', () => {
      DOM.volInput.value = DOM.volRange.value;
      updateCalculator();
    });

    DOM.txSizeInput.addEventListener('input', () => {
      DOM.txSizeRange.value = DOM.txSizeInput.value;
      updateCalculator();
    });

    DOM.txSizeRange.addEventListener('input', () => {
      DOM.txSizeInput.value = DOM.txSizeRange.value;
      updateCalculator();
    });

    updateCalculator();
  }


  /* ==========================================================================
     NAVIGATION HANDLERS
     ========================================================================== */

  function initNavigation() {
    DOM.dropdowns.forEach(dropdown => {
      const toggle = dropdown.querySelector('.dropdown__toggle');
      if (!toggle) return;

      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdown.getAttribute('data-open') === 'true';
        
        DOM.dropdowns.forEach(d => d.setAttribute('data-open', 'false'));

        if (!isOpen) {
          dropdown.setAttribute('data-open', 'true');
          toggle.setAttribute('aria-expanded', 'true');
        } else {
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    });

    document.addEventListener('click', () => {
      DOM.dropdowns.forEach(d => {
        d.setAttribute('data-open', 'false');
        const toggle = d.querySelector('.dropdown__toggle');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      });
    });

    if (DOM.hamburger && DOM.mobileDrawer) {
      DOM.hamburger.addEventListener('click', () => {
        const isOpen = DOM.mobileDrawer.getAttribute('aria-hidden') === 'false';
        DOM.mobileDrawer.setAttribute('aria-hidden', isOpen ? 'true' : 'false');
        DOM.hamburger.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      });
    }

    if (DOM.mobileDrawerClose && DOM.mobileDrawer) {
      DOM.mobileDrawerClose.addEventListener('click', () => {
        DOM.mobileDrawer.setAttribute('aria-hidden', 'true');
        if (DOM.hamburger) DOM.hamburger.setAttribute('aria-expanded', 'false');
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        DOM.dropdowns.forEach(d => d.setAttribute('data-open', 'false'));
        if (DOM.mobileDrawer) DOM.mobileDrawer.setAttribute('aria-hidden', 'true');
      }
    });
  }


  /* ==========================================================================
     GLOBAL RENDER LOOP & SCROLL RAIL UPDATE
     ========================================================================== */

  function measureStageProgress(stageEl) {
    if (!stageEl) return 0;
    const rect = stageEl.getBoundingClientRect();
    const totalScrollable = rect.height - window.innerHeight;
    if (totalScrollable <= 0) return 0;

    const scrolled = -rect.top;
    return Math.max(0, Math.min(1, scrolled / totalScrollable));
  }

  function updateScrollRail() {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight <= 0) return;

    const scrollRatio = Math.max(0, Math.min(1, window.scrollY / totalHeight));

    const sectionIndex = Math.min(11, Math.floor(scrollRatio * 11) + 1);
    const formattedIndex = sectionIndex < 10 ? `0${sectionIndex}` : `${sectionIndex}`;

    if (DOM.scrollRailNum) DOM.scrollRailNum.innerText = `${formattedIndex} / 11`;
    if (DOM.scrollRailFill) DOM.scrollRailFill.style.height = `${(scrollRatio * 100).toFixed(1)}%`;
  }

  function renderLoop() {
    state.scrollTarget = window.scrollY;
    state.scrollCurrent += (state.scrollTarget - state.scrollCurrent) * 0.1;
    state.scrollVelocity = state.scrollCurrent - state.prevScroll;
    state.prevScroll = state.scrollCurrent;

    state.posterTargetY += state.scrollVelocity * 0.6;

    const heroProgress = measureStageProgress(DOM.heroStage);
    updateHeroStage(heroProgress);

    const revealProgress = measureStageProgress(DOM.revealStage);
    updateImageRevealStage(revealProgress);

    const compProgress = measureStageProgress(DOM.compStage);
    updateCompositionStage(compProgress);

    updateFlyingPosters();
    updateCursorRing();
    updateScrollRail();

    requestAnimationFrame(renderLoop);
  }


  /* ==========================================================================
     INITIALIZATION ON DOM LOADED
     ========================================================================== */

  document.addEventListener('DOMContentLoaded', () => {
    initDOMReferences();
    initCustomCursor();
    initMagneticButtons();
    initImageLoading();
    initThemeEngine();
    initLinkTransitionEngine();
    initWordReveals();
    initPosterInteractions();
    initCodeTabs();
    initCalculator();
    initNavigation();
    triggerHeroEntrance();

    requestAnimationFrame(renderLoop);
  });

})();
