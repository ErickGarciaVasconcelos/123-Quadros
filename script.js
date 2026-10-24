/* ==========================================================================
   123 Quadros
   script.js — Configuração do Tailwind + comportamentos do site
   Importante: este arquivo deve ser carregado DEPOIS do Play CDN do Tailwind
   e ANTES do restante da página (ver index.html, dentro de <head>).
   Última atualização: 18/10/2026
   ========================================================================== */

/* --------------------------------------------------------------------------
   1) CONFIGURAÇÃO DO TAILWIND
   Cores, tipografia, sombras e animações travadas no IDENTIDADE.md
   -------------------------------------------------------------------------- */
tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      colors: {
        // Preto institucional da marca (§2 do IDENTIDADE.md)
        ink: { 950: '#020202', 900: '#0d0d11', 800: '#131318' },
        // 🔒 PALETA OFICIAL DA MARCA — as 4 cores confirmadas pela cliente (IDENTIDADE.md §2)
        brand: {
          magenta: '#EA0273', // cor principal de destaque
          amarelo: '#FDC303', // selos, estrelas, destaques sobre escuro
          azul: '#019AEB',    // destaques secundários
          preto: '#020202',   // = ink-950
        },
      },
      boxShadow: {
        glow: '0 0 40px -12px rgba(234,2,115,.45)',
        'glow-sm': '0 0 22px -8px rgba(234,2,115,.4)',
        soft: '0 18px 40px -22px rgba(9,9,11,.28)',
      },
      keyframes: {
        fadeUp: { '0%': { opacity: '0', transform: 'translateY(22px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        pulseGlow: { '0%,100%': { opacity: '.55' }, '50%': { opacity: '.95' } },
      },
      animation: {
        fadeUp: 'fadeUp .9s cubic-bezier(.16,1,.3,1) both',
        floaty: 'floaty 7s ease-in-out infinite',
        pulseGlow: 'pulseGlow 5s ease-in-out infinite',
      },
    },
  },
};

/* --------------------------------------------------------------------------
   2) COMPORTAMENTOS DO SITE
   Executam somente após o DOM (e os ícones Lucide) estarem carregados.
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {

  // ---- Ícones Lucide ----
  if (window.lucide) lucide.createIcons();

  // ---- Navbar: sombra ao rolar ----
  const navShell = document.getElementById('nav-shell');
  if (navShell) {
    const onScroll = () => {
      navShell.classList.toggle('shadow-soft', window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ---- Menu dropdown (3 barrinhas) ----
  const menuToggle = document.getElementById('menu-toggle');
  const siteMenu = document.getElementById('site-menu');
  if (menuToggle && siteMenu) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      siteMenu.classList.toggle('hidden');
      menuToggle.setAttribute('aria-expanded', siteMenu.classList.contains('hidden') ? 'false' : 'true');
    });
    siteMenu.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        siteMenu.classList.add('hidden');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('click', (e) => {
      if (!siteMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        siteMenu.classList.add('hidden');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ---- Botão de pesquisa (placeholder simples) ----
  const searchBtn = document.getElementById('search-btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      const query = prompt('Pesquisar no site...');
      if (query && query.trim()) {
        const q = query.trim().toLowerCase();
        if (q.includes('catálogo') || q.includes('coleção') || q.includes('colecao')) {
          document.getElementById('colecao')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (q.includes('autora') || q.includes('obras')) {
          document.getElementById('obras-autora')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (q.includes('carrinho')) {
          document.getElementById('carrinho')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (q.includes('depoimento')) {
          document.getElementById('depoimentos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (q.includes('faq') || q.includes('pergunta')) {
          document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          document.getElementById('colecao')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  }

  // ---- Carrossel de obras em destaque (Hero) ----
  const carousel = document.querySelector('[data-carousel]');
  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('[data-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-carousel-dot]'));
    const prevBtn = carousel.querySelector('[data-carousel-prev]');
    const nextBtn = carousel.querySelector('[data-carousel-next]');
    const counter = carousel.querySelector('[data-carousel-counter]');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let current = 0;
    let timer = null;

    // Mostra o slide i e atualiza dots + contador
    const render = (i) => {
      current = (i + slides.length) % slides.length;
      slides.forEach((s, n) => s.classList.toggle('is-active', n === current));
      dots.forEach((d, n) => d.classList.toggle('is-active', n === current));
      if (counter) {
        counter.textContent = String(current + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
      }
    };

    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
    const play = () => { if (reduceMotion) return; stop(); timer = setInterval(() => render(current + 1), 5000); };

    if (prevBtn) prevBtn.addEventListener('click', () => { render(current - 1); play(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { render(current + 1); play(); });
    dots.forEach((d, n) => d.addEventListener('click', () => { render(n); play(); }));

    // Pausa ao passar o mouse ou focar (acessibilidade)
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', play);
    carousel.addEventListener('focusin', stop);
    carousel.addEventListener('focusout', play);

    render(0);
    play();
  }

  // ---- Animações de entrada (fade-in + slide-up) ----
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = document.querySelectorAll('[data-reveal]');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    items.forEach((el) => io.observe(el));
  }

  // ---- FAQ: fecha os outros acordeões ao abrir um ----
  const faqs = document.querySelectorAll('#faq details');
  faqs.forEach((d) => {
    d.addEventListener('toggle', () => {
      if (d.open) faqs.forEach((o) => { if (o !== d) o.open = false; });
    });
  });

});
