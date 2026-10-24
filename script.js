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

  // ---- Carrinho ----
  const CART_KEY = '123quadros-cart';
  const cartItemsEl = document.getElementById('cart-items');
  const cartEmptyEl = document.getElementById('cart-empty');
  const cartSummaryEl = document.getElementById('cart-summary');
  const cartBadgeEl = document.getElementById('cart-badge');
  const cartCountEl = document.getElementById('cart-count');
  const cartSubtotalEl = document.getElementById('cart-subtotal');
  const cartTotalEl = document.getElementById('cart-total');
  const cartClearBtn = document.getElementById('cart-clear');
  const cartCheckoutBtn = document.querySelector('#cart-summary button');

  const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    renderCart();
  }

  function updateBadge(cart) {
    if (!cartBadgeEl) return;
    const qty = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    if (qty > 0) {
      cartBadgeEl.textContent = qty;
      cartBadgeEl.classList.remove('hidden');
      cartBadgeEl.classList.add('flex');
    } else {
      cartBadgeEl.classList.add('hidden');
      cartBadgeEl.classList.remove('flex');
    }
  }

  function renderCart() {
    const cart = loadCart();
    updateBadge(cart);

    if (!cartItemsEl || !cartEmptyEl || !cartSummaryEl) return;

    if (cart.length === 0) {
      cartItemsEl.innerHTML = '';
      cartEmptyEl.classList.remove('hidden');
      cartSummaryEl.classList.add('hidden');
      if (cartClearBtn) cartClearBtn.classList.add('hidden');
      if (window.lucide) lucide.createIcons();
      return;
    }

    cartEmptyEl.classList.add('hidden');
    cartSummaryEl.classList.remove('hidden');
    if (cartClearBtn) cartClearBtn.classList.remove('hidden');

    cartItemsEl.innerHTML = '';
    cart.forEach((item) => {
      const row = document.createElement('article');
      row.className = 'flex gap-4 rounded-3xl border border-zinc-200 bg-white p-4 shadow-soft';
      row.innerHTML = `
        <div class="h-24 w-24 overflow-hidden rounded-2xl border border-zinc-200 sm:h-28 sm:w-28">
          <img src="${item.img}" alt="${item.title}" class="h-full w-full object-cover" loading="lazy" />
        </div>
        <div class="flex flex-1 flex-col justify-between gap-3">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h3 class="font-display text-base font-bold text-zinc-900">${item.title}</h3>
              <p class="mt-1 text-sm text-zinc-500">Obra selecionada</p>
            </div>
            <button class="cart-remove grid h-9 w-9 place-items-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-brand-magenta" data-id="${item.id}" aria-label="Remover">
              <i data-lucide="trash-2" class="h-4 w-4"></i>
            </button>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 rounded-full border border-zinc-200 px-2 py-1 text-sm">
              <button class="cart-qty grid h-7 w-7 place-items-center text-zinc-500 hover:text-zinc-900" data-id="${item.id}" data-action="dec">-</button>
              <span class="w-6 text-center text-zinc-700">${item.qty || 1}</span>
              <button class="cart-qty grid h-7 w-7 place-items-center text-zinc-500 hover:text-zinc-900" data-id="${item.id}" data-action="inc">+</button>
            </div>
            <p class="font-display text-base font-bold text-brand-magenta">${fmt.format((Number(item.price) || 0) * (item.qty || 1))}</p>
          </div>
        </div>
      `;
      cartItemsEl.appendChild(row);
    });

    const totalQty = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.qty || 1), 0);

    if (cartCountEl) cartCountEl.textContent = totalQty;
    if (cartSubtotalEl) cartSubtotalEl.textContent = fmt.format(subtotal);
    if (cartTotalEl) cartTotalEl.textContent = fmt.format(subtotal);

    cartItemsEl.querySelectorAll('.cart-remove').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const next = loadCart().filter((i) => i.id !== id);
        saveCart(next);
      });
    });

    cartItemsEl.querySelectorAll('.cart-qty').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        const cartNow = loadCart();
        const next = cartNow.map((i) => {
          if (i.id !== id) return i;
          const qty = (i.qty || 1) + (action === 'inc' ? 1 : -1);
          return { ...i, qty: qty < 1 ? 1 : qty };
        });
        saveCart(next);
      });
    });

    if (window.lucide) lucide.createIcons();
  }

  document.querySelectorAll('.add-to-cart').forEach((btn) => {
    btn.addEventListener('click', () => {
      const cart = loadCart();
      const id = btn.dataset.id;
      const existing = cart.find((i) => i.id === id);
      if (existing) {
        existing.qty = (existing.qty || 1) + 1;
      } else {
        cart.push({
          id,
          title: btn.dataset.title || 'Obra',
          img: btn.dataset.img || '',
          price: btn.dataset.price || 0,
          qty: 1
        });
      }
      saveCart(cart);
      const menuEl = document.getElementById('site-menu');
      if (menuEl) menuEl.classList.add('hidden');
      const badgeEl = document.getElementById('cart-badge');
      if (badgeEl) {
        badgeEl.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 260 });
      }
      document.getElementById('carrinho')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  if (cartClearBtn) {
    cartClearBtn.addEventListener('click', () => {
      saveCart([]);
    });
  }

  if (cartCheckoutBtn) {
    cartCheckoutBtn.addEventListener('click', () => {
      const cart = loadCart();
      if (cart.length === 0) {
        alert('Seu carrinho está vazio.');
        return;
      }
      alert('Pedido simulado! Em breve você receberá as instruções para finalizar o pagamento.');
    });
  }

  renderCart();

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
