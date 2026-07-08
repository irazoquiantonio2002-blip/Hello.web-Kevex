/* ============================================================
   main.js — Grupo Kavex · Remolques Industriales
   Vanilla JS puro · Sin librerías externas
   Big Tech level animations — Premium UI/UX
============================================================ */

'use strict';

// ============================================================
// UTILIDADES
// ============================================================

/** Curva easeOutQuart para contadores y micro-animaciones */
function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

/** Interpolación lineal suave para efectos de mouse */
function lerp(a, b, t)   { return a + (b - a) * t; }

// ============================================================
// LOADER PREMIUM
// Simula progreso, espera window.load, revela con fade+scale
// ============================================================

function initLoader() {
    const loader = document.getElementById('site-loader');
    const fill   = document.getElementById('loaderFill');
    if (!loader) { startHeroSequence(); return; }

    let progress  = 0;
    const MIN_MS  = 2000;   // tiempo mínimo visible del loader
    const t0      = performance.now();
    let pageReady = false;
    let progDone  = false;

    /* Progreso simulado: rápido → lento → 89% tope */
    const ticker = setInterval(() => {
        if      (progress < 65) progress += Math.random() * 10 + 4;
        else if (progress < 85) progress += Math.random() * 4  + 1;
        else                    progress += 0.3;
        progress = Math.min(progress, 89);
        if (fill) fill.style.width = progress + '%';

        if (progress >= 89) {
            clearInterval(ticker);
            progDone = true;
            maybeHide();
        }
    }, 80);

    function maybeHide() {
        if (!pageReady || !progDone) return;
        const wait = Math.max(0, MIN_MS - (performance.now() - t0));
        setTimeout(() => {
            if (fill) fill.style.width = '100%';
            setTimeout(hideLoader, 260);
        }, wait);
    }

    function hideLoader() {
        loader.classList.add('ldr-out');
        startHeroSequence();                    // lanza el hero mientras el loader desaparece
        setTimeout(() => { loader.style.display = 'none'; }, 900);
    }

    if (document.readyState === 'complete') {
        pageReady = true; maybeHide();
    } else {
        window.addEventListener('load', () => { pageReady = true; maybeHide(); });
    }
}

// ============================================================
// HERO SEQUENCE — Orquesta toda la entrada del hero
// Técnica "polygon wipe" (usada por Stripe, Linear, Vercel)
// ============================================================

function startHeroSequence() {
    const badge     = document.querySelector('.hero-badge');
    const title     = document.querySelector('.hero-title');
    const titleSpans = title ? Array.from(title.querySelectorAll('span')) : [];
    const decoLine  = document.querySelector('.hero-deco-line');
    const subtitle  = document.querySelector('.hero-subtitle');
    const ctas      = document.querySelector('.hero-ctas');
    const stats     = document.querySelector('.hero-stats');

    /* --- Título: polygon wipe de abajo hacia arriba (estilo Stripe) --- */
    titleSpans.forEach(span => {
        span.style.clipPath  = 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)';
        span.style.transform = 'translateY(12px)';
        span.style.opacity   = '1'; // necesario para que clip-path funcione
    });

    /* --- Resto de elementos: fade + slide desde abajo --- */
    const EASE = 'opacity 0.95s cubic-bezier(0.22,1,0.36,1), transform 0.95s cubic-bezier(0.22,1,0.36,1), filter 0.85s ease';
    [badge, decoLine, subtitle, ctas, stats].forEach(el => {
        if (!el) return;
        el.style.opacity   = '0';
        el.style.transform = 'translateY(28px)';
        el.style.filter    = 'blur(4px)';
    });

    /* Helper: trigger transición CSS en un elemento */
    function fadeReveal(el, delay) {
        if (!el) return;
        setTimeout(() => {
            el.style.transition = EASE;
            el.style.opacity    = '1';
            el.style.transform  = 'translateY(0)';
            el.style.filter     = 'blur(0)';
        }, delay);
    }

    /* Helper: polygon wipe en un span del título */
    function wipeReveal(span, delay) {
        setTimeout(() => {
            span.style.transition = 'clip-path 1.1s cubic-bezier(0.22,1,0.36,1), transform 1.1s cubic-bezier(0.22,1,0.36,1)';
            span.style.clipPath   = 'polygon(0 0%, 100% 0%, 100% 110%, 0 110%)';
            span.style.transform  = 'translateY(0)';
        }, delay);
    }

    /* --- Secuencia escalonada Big Tech --- */
    fadeReveal(badge, 80);
    wipeReveal(titleSpans[0], 220);          // "TRANSFORMA"
    wipeReveal(titleSpans[1], 390);          // "TUS ESPACIOS"
    wipeReveal(titleSpans[2], 560);          // tagline
    fadeReveal(decoLine, 680);
    fadeReveal(subtitle,  860);
    fadeReveal(ctas,      1060);

    /* Stats: revelar + shimmer dorado + contadores animados */
    setTimeout(() => {
        if (!stats) return;
        stats.style.transition = EASE;
        stats.style.opacity    = '1';
        stats.style.transform  = 'translateY(0)';
        stats.style.filter     = 'blur(0)';
        // Shimmer en "TUS ESPACIOS"
        if (titleSpans[1]) titleSpans[1].classList.add('text-shimmer');
        // Iniciar contadores con pequeño delay
        setTimeout(runCounters, 350);
    }, 1280);

    /* --- Entrada de la columna derecha (foto + badges) --- */
    revealHeroRight();
}

// ============================================================
// HERO RIGHT — Foto + esquinas animadas + badges flotantes
// ============================================================

function revealHeroRight() {
    const heroRight = document.getElementById('heroRight');
    if (!heroRight) return;

    /* Foto entra desde la derecha */
    setTimeout(() => {
        heroRight.classList.add('hero-right-visible');

        /* Esquinas se "dibujan" 600ms después */
        setTimeout(() => {
            document.querySelectorAll('.corner-deco').forEach(c => c.classList.add('drawn'));
        }, 600);

        /* Badges flotantes aparecen en cascada */
        document.querySelectorAll('.hero-badge-card').forEach((badge, i) => {
            setTimeout(() => badge.classList.add('badge-visible'), 500 + i * 160);
        });

    }, 750);  // empieza a entrar mientras el texto termina
}

// ============================================================
// CONTADORES ANIMADOS — requestAnimationFrame + easeOutQuart
// Destello dorado al completar
// ============================================================

function runCounters() {
    document.querySelectorAll('.counter').forEach(el => {
        if (el.dataset.animated === 'true') return;
        el.dataset.animated = 'true';
        const target   = parseInt(el.dataset.target, 10);
        const suffix   = el.dataset.suffix || '';
        const duration = 2400;
        const t0       = performance.now();

        (function tick(now) {
            const pct = Math.min((now - t0) / duration, 1);
            el.textContent = Math.floor(easeOutQuart(pct) * target) + suffix;
            if (pct < 1) {
                requestAnimationFrame(tick);
            } else {
                /* Destello dorado al llegar al número final */
                el.classList.add('flash');
                setTimeout(() => el.classList.remove('flash'), 900);
            }
        }(performance.now()));
    });
}

// ============================================================
// CURSOR SPOTLIGHT — Luz dorada que sigue el cursor en el hero
// ============================================================

function initCursorSpotlight() {
    const hero = document.getElementById('hero');
    const spot = document.getElementById('heroSpotlight');
    if (!hero || !spot) return;

    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    let active = false;
    let raf = null;

    hero.addEventListener('mouseenter', () => {
        spot.style.opacity = '1';
        active = true;
        if (!raf) raf = requestAnimationFrame(moveSpot);
    });

    hero.addEventListener('mouseleave', () => {
        active = false;
        spot.style.opacity = '0';
    });

    hero.addEventListener('mousemove', e => {
        const r = hero.getBoundingClientRect();
        targetX = e.clientX - r.left;
        targetY = e.clientY - r.top;
        if (!raf) raf = requestAnimationFrame(moveSpot);
    });

    function moveSpot() {
        raf = null;
        currentX = lerp(currentX, targetX, 0.08);
        currentY = lerp(currentY, targetY, 0.08);
        spot.style.background =
            `radial-gradient(700px circle at ${currentX}px ${currentY}px, rgba(212,175,55,0.08), transparent 55%)`;

        if (active || Math.abs(targetX - currentX) > 0.5 || Math.abs(targetY - currentY) > 0.5) {
            raf = requestAnimationFrame(moveSpot);
        }
    }
}

// ============================================================
// HERO PARALLAX — Scroll + Mouse con lerp suave
// ============================================================

function initHeroParallax() {
    const section = document.getElementById('hero');
    const img     = document.getElementById('heroWaterImg');
    const content = document.getElementById('heroContent');
    if (!section || !img) return;

    const heroH  = section.offsetHeight;
    let scrollY  = 0;
    let mouseX   = 0, mouseY  = 0;
    let lerpX    = 0, lerpY   = 0;
    let inHero   = false;
    let rafId    = null;

    img.style.transform    = 'translate(0,0) scale(1.12)';
    img.style.willChange   = 'transform';

    function applyTransform() {
        if (scrollY > heroH) return;
        const sy = scrollY * 0.28;
        img.style.transform = `translate(${lerpX * 16}px, ${lerpY * 8 + sy}px) scale(1.12)`;
        if (content) content.style.transform = `translate(${lerpX * -6}px, ${lerpY * -3}px)`;
    }

    function runLerp() {
        rafId = null;
        lerpX = lerp(lerpX, mouseX, 0.055);
        lerpY = lerp(lerpY, mouseY, 0.055);
        applyTransform();
        if (inHero || Math.abs(mouseX - lerpX) > 0.002 || Math.abs(mouseY - lerpY) > 0.002) {
            rafId = requestAnimationFrame(runLerp);
        }
    }

    window.addEventListener('scroll', () => { scrollY = window.scrollY; applyTransform(); }, { passive: true });

    section.addEventListener('mouseenter', () => { inHero = true; });
    section.addEventListener('mousemove', e => {
        const r = section.getBoundingClientRect();
        mouseX = (e.clientX - r.left) / r.width  - 0.5;
        mouseY = (e.clientY - r.top)  / r.height - 0.5;
        if (!rafId) rafId = requestAnimationFrame(runLerp);
    });
    section.addEventListener('mouseleave', () => {
        inHero = false; mouseX = 0; mouseY = 0;
        if (!rafId) rafId = requestAnimationFrame(runLerp);
    });
}

// ============================================================
// MAGNETIC BUTTONS — Los CTAs se atraen levemente al cursor
// ============================================================

function initMagneticButtons() {
    document.querySelectorAll('.hero-ctas .btn-gold-primary, .hero-ctas .btn-glass').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const r  = btn.getBoundingClientRect();
            const cx = r.left + r.width  / 2;
            const cy = r.top  + r.height / 2;
            const dx = (e.clientX - cx) * 0.28;
            const dy = (e.clientY - cy) * 0.28;
            btn.style.transition = 'transform 0.12s ease';
            btn.style.transform  = `translate(${dx}px, ${dy}px) translateY(-2px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transition = 'transform 0.55s cubic-bezier(0.22,1,0.36,1)';
            btn.style.transform  = '';
        });
    });
}

// ============================================================
// PARTÍCULAS DORADAS — CSS animations, sin librería
// ============================================================

function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    const anims = ['pf1', 'pf2', 'pf3', 'pf4'];

    for (let i = 0; i < 30; i++) {
        const p    = document.createElement('div');
        p.className = 'particle';
        const size = (Math.random() * 2.6 + 0.5).toFixed(1);
        const dur  = (Math.random() * 13 + 8).toFixed(1);
        const del  = (Math.random() * -18).toFixed(1);
        const op   = (Math.random() * 0.38 + 0.08).toFixed(2);
        const anim = anims[Math.floor(Math.random() * anims.length)];

        p.style.cssText = `
            width:${size}px; height:${size}px;
            left:${(Math.random() * 100).toFixed(1)}%;
            top:${(Math.random() * 100).toFixed(1)}%;
            opacity:${op};
            animation:${anim} ${dur}s ease-in-out ${del}s infinite;
        `;
        container.appendChild(p);
    }
}

// ============================================================
// SCROLL REVEAL — IntersectionObserver + clases CSS
// Stagger calculado por índice, sin librería
// ============================================================

function initScrollReveal() {
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el    = entry.target;
            const delay = parseInt(el.dataset.sd || '0', 10);
            setTimeout(() => el.classList.add('revealed'), delay);
            io.unobserve(el);
        });
    }, { threshold: 0.10, rootMargin: '0px 0px -30px 0px' });

    function observe(selector, stagger = 0) {
        document.querySelectorAll(selector).forEach((el, i) => {
            el.classList.add('reveal-up');
            if (stagger) el.dataset.sd = String(i * stagger);
            io.observe(el);
        });
    }

    /* Section headers: cada hijo individual */
    document.querySelectorAll('.section-header').forEach(hdr => {
        Array.from(hdr.children).forEach((child, i) => {
            child.classList.add('reveal-up');
            child.dataset.sd = String(i * 85);
            io.observe(child);
        });
    });

    observe('.products-grid .product-card',    55);
    observe('.portfolio-grid .portfolio-card', 95);
    observe('.benefits-grid .benefit-card',    65);
    observe('.process-steps .process-step',   105);
    observe('.trust-badge',                    70);
    observe('.form-wrap',                       0);
    observe('.wa-card',                         0);
    observe('.info-mini-card',                 55);
    observe('.service-row',                    45);
    observe('.map-wrap',                        0);
}

// ============================================================
// HOVER 3D EN TARJETAS DE PRODUCTOS
// ============================================================

function init3DHover() {
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width  - 0.5;
            const y = (e.clientY - r.top)  / r.height - 0.5;
            card.style.transition = 'transform 0.12s ease, border-color 0.35s ease, box-shadow 0.35s ease';
            card.style.transform  = `translateY(-7px) rotateX(${-y * 7}deg) rotateY(${x * 7}deg)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.55s cubic-bezier(0.22,1,0.36,1), border-color 0.35s ease, box-shadow 0.35s ease';
            card.style.transform  = '';
        });
    });
}

// ============================================================
// NAVBAR
// ============================================================

function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
}

// ============================================================
// MENÚ MÓVIL
// ============================================================

function initMobileMenu() {
    const toggle = document.getElementById('menu-toggle');
    const menu   = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
        const open = !menu.classList.contains('hidden');
        menu.classList.toggle('hidden', open);
        toggle.querySelector('i').className = open
            ? 'fas fa-bars text-xl'
            : 'fas fa-times text-xl';
    });

    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.add('hidden');
            toggle.querySelector('i').className = 'fas fa-bars text-xl';
        });
    });
}

// ============================================================
// SMOOTH SCROLL
// ============================================================

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const href = a.getAttribute('href');
            if (!href || href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                window.scrollTo({
                    top: target.getBoundingClientRect().top + window.scrollY - 80,
                    behavior: 'smooth',
                });
            }
        });
    });
}

// ============================================================
// CARRUSEL DE GALERÍA
// ============================================================

function initCarousel() {
    const track       = document.getElementById('carouselTrack');
    const prevBtn     = document.getElementById('carouselPrev');
    const nextBtn     = document.getElementById('carouselNext');
    const dotsWrap    = document.getElementById('carouselDots');
    const currentEl   = document.getElementById('carouselCurrent');
    const progressBar = document.getElementById('carouselProgressBar');
    if (!track) return;

    const slides  = Array.from(track.querySelectorAll('.carousel-slide'));
    const total   = slides.length;
    let current   = 0;
    let autoTimer = null;
    const INTERVAL = 4500;

    document.getElementById('carouselTotal').textContent = total;

    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', `Proyecto ${i + 1}`);
        dot.addEventListener('click', () => { goTo(i); startAuto(); });
        dotsWrap.appendChild(dot);
    });

    const dots = Array.from(dotsWrap.querySelectorAll('.carousel-dot'));

    function updateUI() {
        track.style.transform = `translateX(-${current * 100}%)`;
        slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
        dots.forEach((d, i)   => d.classList.toggle('is-active', i === current));
        currentEl.textContent  = current + 1;
    }

    function goTo(idx) {
        current = (idx + total) % total;
        updateUI();
        resetProgress();
    }

    function resetProgress() {
        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';
        progressBar.offsetWidth;  // reflow
        progressBar.style.transition = `width ${INTERVAL}ms linear`;
        progressBar.style.width = '100%';
    }

    function startAuto() {
        stopAuto();
        resetProgress();
        autoTimer = setInterval(() => goTo(current + 1), INTERVAL);
    }

    function stopAuto() {
        clearInterval(autoTimer);
        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';
    }

    prevBtn.addEventListener('click', () => { goTo(current - 1); startAuto(); });
    nextBtn.addEventListener('click', () => { goTo(current + 1); startAuto(); });

    const wrap = document.getElementById('carousel');
    wrap.addEventListener('mouseenter', stopAuto);
    wrap.addEventListener('mouseleave', startAuto);

    let touchStart = 0;
    wrap.addEventListener('touchstart', e => { touchStart = e.touches[0].clientX; }, { passive: true });
    wrap.addEventListener('touchend',   e => {
        const diff = touchStart - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) { goTo(diff > 0 ? current + 1 : current - 1); startAuto(); }
    }, { passive: true });

    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft')  { goTo(current - 1); startAuto(); }
        if (e.key === 'ArrowRight') { goTo(current + 1); startAuto(); }
    });

    /* Reveal del carrusel con CSS transition al entrar en viewport */
    const carouselWrap = document.querySelector('.carousel-wrap');
    carouselWrap.style.cssText += ';opacity:0;transform:translateY(42px);transition:opacity 0.9s cubic-bezier(0.22,1,0.36,1),transform 0.9s cubic-bezier(0.22,1,0.36,1);';

    const cio = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        carouselWrap.style.opacity   = '1';
        carouselWrap.style.transform = 'translateY(0)';
        startAuto();
        cio.disconnect();
    }, { threshold: 0.18 });

    cio.observe(carouselWrap);
    updateUI();
}

// ============================================================
// FORMULARIO → WHATSAPP
// ============================================================

function initForm() {
    document.getElementById('contact-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const name    = this.querySelector('input[type="text"]').value.trim();
        const phone   = this.querySelector('input[type="tel"]').value.trim();
        const project = this.querySelector('select').value;
        const msg     = this.querySelector('textarea').value.trim();
        const text = encodeURIComponent(
            `Hola, me contacto desde la página web de Kavex.\n\n` +
            `*Nombre:* ${name}\n*Teléfono:* ${phone}\n` +
            `*Proyecto:* ${project || 'No especificado'}\n*Descripción:* ${msg}`
        );
        window.open(`https://wa.me/528114994525?text=${text}`, '_blank');
    });
}

// ============================================================
// INIT — Arranque de todos los módulos
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initMobileMenu();
    initSmoothScroll();
    initParticles();
    initHeroParallax();
    initCursorSpotlight();
    initMagneticButtons();
    init3DHover();
    initCarousel();
    initForm();

    /* Scroll reveal después de que el hero arranque */
    setTimeout(initScrollReveal, 700);

    /* Loader — dispara startHeroSequence() cuando termina */
    initLoader();
});
