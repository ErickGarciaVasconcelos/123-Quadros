/* ==========================================================================
   123 Quadros
   script.js — Configuração do Tailwind + comportamentos interativos do site
   ========================================================================== */

/* --------------------------------------------------------------------------
   1) CONFIGURAÇÃO DO TAILWIND
   Cores, tipografia, sombras e animações oficiais da marca (IDENTIDADE.md)
   -------------------------------------------------------------------------- */
tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      colors: {
        ink: { 950: '#020202', 900: '#0d0d11', 800: '#131318' },
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
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();

  const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  // =========================================================================
  // A) TOPBAR ROTATIVA DE AVISOS
  // =========================================================================
  const topbarMessages = [
    '<span>Parcelamento em até <strong>12x sem juros</strong></span>',
    '<span><strong>Frete Grátis</strong> para todo o Brasil nas compras acima de <strong>R$ 399</strong></span>',
  ];
  let topbarIndex = 0;
  const topbarTextEl = document.getElementById('topbar-text');
  const topbarPrevBtn = document.getElementById('topbar-prev');
  const topbarNextBtn = document.getElementById('topbar-next');

  function renderTopbar(index) {
    if (!topbarTextEl) return;
    topbarIndex = (index + topbarMessages.length) % topbarMessages.length;
    topbarTextEl.innerHTML = topbarMessages[topbarIndex];
  }

  if (topbarPrevBtn) topbarPrevBtn.addEventListener('click', () => renderTopbar(topbarIndex - 1));
  if (topbarNextBtn) topbarNextBtn.addEventListener('click', () => renderTopbar(topbarIndex + 1));
  setInterval(() => renderTopbar(topbarIndex + 1), 5000);

  // =========================================================================
  // B) SACOLA LATERAL DESLIZANTE (DRAWER) + FRETE GRÁTIS
  // =========================================================================
  const CART_KEY = '123quadros-cart';
  const FREE_SHIPPING_LIMIT = 399;

  const cartDrawer = document.getElementById('cart-drawer');
  const cartBackdrop = document.getElementById('cart-drawer-backdrop');
  const cartOpenBtn = document.getElementById('cart-open-btn');
  const cartCloseBtn = document.getElementById('cart-close-btn');
  const cartEmptyCta = document.getElementById('cart-empty-cta');

  const cartItemsEl = document.getElementById('cart-items');
  const cartEmptyEl = document.getElementById('cart-empty');
  const cartSummaryEl = document.getElementById('cart-summary');
  const cartBadgeEl = document.getElementById('cart-badge');
  const cartCountEl = document.getElementById('cart-count');
  const cartSubtotalEl = document.getElementById('cart-subtotal');
  const cartShippingEl = document.getElementById('cart-shipping');
  const cartTotalEl = document.getElementById('cart-total');
  const cartClearBtn = document.getElementById('cart-clear');
  const cartCheckoutBtn = document.getElementById('cart-checkout-btn');
  const freeShippingMsg = document.getElementById('free-shipping-msg');
  const freeShippingBar = document.getElementById('free-shipping-bar');

  function openCartDrawer() {
    if (!cartDrawer || !cartBackdrop) return;
    cartDrawer.classList.add('is-open');
    cartBackdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeCartDrawer() {
    if (!cartDrawer || !cartBackdrop) return;
    cartDrawer.classList.remove('is-open');
    cartBackdrop.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  if (cartOpenBtn) cartOpenBtn.addEventListener('click', openCartDrawer);
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCartDrawer);
  if (cartBackdrop) cartBackdrop.addEventListener('click', closeCartDrawer);
  if (cartEmptyCta) {
    cartEmptyCta.addEventListener('click', () => {
      closeCartDrawer();
      document.getElementById('queridinhos')?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCartDrawer();
  });

  function loadCart() {
    try {
      const raw = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      return Array.isArray(raw) ? raw.filter((i) => i && i.id && Number(i.price) > 0) : [];
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

  function updateFreeShipping(subtotal) {
    if (!freeShippingMsg || !freeShippingBar) return;
    const pct = Math.min(100, Math.round((subtotal / FREE_SHIPPING_LIMIT) * 100));
    freeShippingBar.style.width = `${pct}%`;
    if (subtotal >= FREE_SHIPPING_LIMIT) {
      freeShippingMsg.innerHTML = 'Parabéns! Você ganhou <strong>Frete Grátis!</strong> 🎉';
      if (cartShippingEl) cartShippingEl.textContent = 'Grátis';
    } else {
      const diff = FREE_SHIPPING_LIMIT - subtotal;
      freeShippingMsg.innerHTML = `Faltam <strong>${fmt.format(diff)}</strong> para você ganhar <strong>Frete Grátis!</strong>`;
      if (cartShippingEl) cartShippingEl.textContent = 'A calcular';
    }
  }

  function renderCart() {
    const cart = loadCart();
    updateBadge(cart);

    const totalQty = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.qty || 1), 0);

    if (cartCountEl) cartCountEl.textContent = totalQty;
    updateFreeShipping(subtotal);

    if (!cartItemsEl || !cartEmptyEl || !cartSummaryEl) return;

    if (cart.length === 0) {
      cartItemsEl.innerHTML = '';
      cartEmptyEl.classList.remove('hidden');
      cartSummaryEl.classList.add('hidden');
      if (window.lucide) lucide.createIcons();
      return;
    }

    cartEmptyEl.classList.add('hidden');
    cartSummaryEl.classList.remove('hidden');

    cartItemsEl.innerHTML = '';
    cart.forEach((item) => {
      const row = document.createElement('article');
      row.className = 'flex gap-3.5 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm';
      row.innerHTML = `
        <div class="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50">
          <img src="${item.img}" alt="${item.title}" class="h-full w-full object-cover" loading="lazy" />
        </div>
        <div class="flex min-w-0 flex-1 flex-col justify-between">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <h3 class="truncate font-display text-sm font-bold text-zinc-900">${item.title}</h3>
              <p class="mt-0.5 text-[11px] text-zinc-500">Quadro emoldurado</p>
            </div>
            <button type="button" class="cart-remove grid h-7 w-7 shrink-0 place-items-center rounded-full text-zinc-400 transition hover:bg-pink-50 hover:text-brand-magenta" data-id="${item.id}" aria-label="Remover item">
              <i data-lucide="trash-2" class="h-3.5 w-3.5"></i>
            </button>
          </div>
          <div class="mt-2 flex items-center justify-between">
            <div class="flex items-center gap-1.5 rounded-full border border-zinc-200 px-2 py-0.5 text-xs">
              <button type="button" class="cart-qty grid h-5 w-5 place-items-center text-zinc-500 hover:text-zinc-900" data-id="${item.id}" data-action="dec">-</button>
              <span class="w-5 text-center font-medium text-zinc-800">${item.qty || 1}</span>
              <button type="button" class="cart-qty grid h-5 w-5 place-items-center text-zinc-500 hover:text-zinc-900" data-id="${item.id}" data-action="inc">+</button>
            </div>
            <p class="font-display text-sm font-bold text-[#9e004f]">${fmt.format((Number(item.price) || 0) * (item.qty || 1))}</p>
          </div>
        </div>
      `;
      cartItemsEl.appendChild(row);
    });

    if (cartSubtotalEl) cartSubtotalEl.textContent = fmt.format(subtotal);
    if (cartTotalEl) cartTotalEl.textContent = fmt.format(subtotal);

    cartItemsEl.querySelectorAll('.cart-remove').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.id;
        const next = loadCart().filter((i) => i.id !== targetId);
        saveCart(next);
      });
    });

    cartItemsEl.querySelectorAll('.cart-qty').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.id;
        const action = btn.dataset.action;
        const next = loadCart().map((i) => {
          if (i.id !== targetId) return i;
          const qty = (i.qty || 1) + (action === 'inc' ? 1 : -1);
          return { ...i, qty: qty < 1 ? 1 : qty };
        });
        saveCart(next);
      });
    });

    if (window.lucide) lucide.createIcons();
  }

  // Delegação de evento para todos os botões/cards `.add-to-cart`
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.add-to-cart');
    if (!btn) return;

    const id = btn.dataset.id;
    const title = btn.dataset.title || 'Quadro Decorativo';
    const img = btn.dataset.img || 'imagens/colecao/obra-1.jpg';
    const price = Number(btn.dataset.price) || 199.90;

    if (!id) return;

    const cart = loadCart();
    const existing = cart.find((i) => i.id === id);
    if (existing) {
      existing.qty = (existing.qty || 1) + 1;
    } else {
      cart.push({ id, title, img, price, qty: 1 });
    }
    saveCart(cart);
    openCartDrawer();
  });

  if (cartClearBtn) {
    cartClearBtn.addEventListener('click', () => {
      saveCart([]);
    });
  }

  if (cartCheckoutBtn) {
    cartCheckoutBtn.addEventListener('click', () => {
      const cart = loadCart();
      if (cart.length === 0) return;
      alert('Pedido recebido com sucesso! Em instantes você receberá as instruções para finalizar o pagamento.');
    });
  }

  renderCart();

  // =========================================================================
  // C) CARROSSEL "QUERIDINHOS:" (NAVEGAÇÃO POR SETAS)
  // =========================================================================
  const queridinhosTrack = document.getElementById('queridinhos-track');
  const queridinhosPrev = document.getElementById('queridinhos-prev');
  const queridinhosNext = document.getElementById('queridinhos-next');

  if (queridinhosTrack && queridinhosPrev && queridinhosNext) {
    queridinhosPrev.addEventListener('click', () => {
      queridinhosTrack.scrollBy({ left: -310, behavior: 'smooth' });
    });
    queridinhosNext.addEventListener('click', () => {
      queridinhosTrack.scrollBy({ left: 310, behavior: 'smooth' });
    });
  }

  // =========================================================================
  // D) CARROSSEL VERTICAL 5 CARDS
  // =========================================================================
  const storiesGrid = document.getElementById('stories-grid');
  const storiesPrev = document.getElementById('stories-prev');
  const storiesNext = document.getElementById('stories-next');

  if (storiesGrid) {
    const updateCenterHighlight = () => {
      const items = Array.from(storiesGrid.querySelectorAll('.story-item'));
      items.forEach((item, idx) => {
        item.classList.toggle('is-center', idx === 2);
      });
    };

    if (storiesNext) {
      storiesNext.addEventListener('click', () => {
        const first = storiesGrid.firstElementChild;
        if (first) {
          storiesGrid.appendChild(first);
          updateCenterHighlight();
        }
      });
    }

    if (storiesPrev) {
      storiesPrev.addEventListener('click', () => {
        const last = storiesGrid.lastElementChild;
        if (last) {
          storiesGrid.prepend(last);
          updateCenterHighlight();
        }
      });
    }

    storiesGrid.addEventListener('click', (e) => {
      const media = e.target.closest('.story-media');
      if (!media) return;
      const clickedItem = media.closest('.story-item');
      const items = Array.from(storiesGrid.querySelectorAll('.story-item'));
      const idx = items.indexOf(clickedItem);
      if (idx === -1 || idx === 2) return;

      if (idx < 2) {
        const steps = 2 - idx;
        for (let i = 0; i < steps; i++) {
          storiesGrid.prepend(storiesGrid.lastElementChild);
        }
      } else {
        const steps = idx - 2;
        for (let i = 0; i < steps; i++) {
          storiesGrid.appendChild(storiesGrid.firstElementChild);
        }
      }
      updateCenterHighlight();
    });
  }

  // =========================================================================
  // E) FILTROS FUNCIONAIS DA SEÇÃO COLEÇÃO
  // =========================================================================
  const filterBtns = document.querySelectorAll('#collection-filters .filter-btn');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter || 'todos';

      filterBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('bg-[#9e004f]', active);
        b.classList.toggle('border-[#9e004f]', active);
        b.classList.toggle('text-white', active);
        b.classList.toggle('bg-white', !active);
        b.classList.toggle('border-zinc-200', !active);
        b.classList.toggle('text-zinc-600', !active);
      });

      document.querySelectorAll('#collection-grid article[data-category]').forEach((card) => {
        const match = filter === 'todos' || card.dataset.category === filter;
        card.classList.toggle('hidden', !match);
        card.classList.toggle('flex', match);
      });
    });
  });

  // =========================================================================
  // F) MENU MOBILE E BARRA DE PESQUISA INTEGRADA
  // =========================================================================
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

  const searchBtn = document.getElementById('search-btn');
  const searchPanel = document.getElementById('search-bar-panel');
  const searchInput = document.getElementById('search-input');
  const searchClose = document.getElementById('search-close');

  if (searchBtn && searchPanel && searchInput) {
    searchBtn.addEventListener('click', () => {
      searchPanel.classList.toggle('hidden');
      if (!searchPanel.classList.contains('hidden')) {
        searchInput.focus();
      }
    });

    if (searchClose) {
      searchClose.addEventListener('click', () => {
        searchInput.value = '';
        searchPanel.classList.add('hidden');
        document.querySelectorAll('.product-card').forEach((c) => c.classList.remove('hidden'));
      });
    }

    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      document.querySelectorAll('#collection-grid .product-card').forEach((card) => {
        const text = card.textContent.toLowerCase();
        const match = !q || text.includes(q);
        card.classList.toggle('hidden', !match);
      });
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('colecao')?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // =========================================================================
  // G) CARROSSEL HERO
  // =========================================================================
  const carousel = document.querySelector('[data-carousel]');
  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('[data-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-carousel-dot]'));
    const prevBtn = carousel.querySelector('[data-carousel-prev]');
    const nextBtn = carousel.querySelector('[data-carousel-next]');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let current = 0;
    let timer = null;

    const render = (i) => {
      current = (i + slides.length) % slides.length;
      slides.forEach((s, n) => s.classList.toggle('is-active', n === current));
      dots.forEach((d, n) => d.classList.toggle('is-active', n === current));
    };

    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
    const play = () => { if (reduceMotion) return; stop(); timer = setInterval(() => render(current + 1), 5000); };

    if (prevBtn) prevBtn.addEventListener('click', () => { render(current - 1); play(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { render(current + 1); play(); });
    dots.forEach((d, n) => d.addEventListener('click', () => { render(n); play(); }));

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', play);

    render(0);
    play();
  }

  // =========================================================================
  // H) ANIMAÇÕES DE REVEAL E FAQ
  // =========================================================================
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
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' }
    );
    items.forEach((el) => io.observe(el));
  }

  const faqs = document.querySelectorAll('#faq details');
  faqs.forEach((d) => {
    d.addEventListener('toggle', () => {
      if (d.open) faqs.forEach((o) => { if (o !== d) o.open = false; });
    });
  });

  // =========================================================================
  // I) INTEGRAÇÃO DINÂMICA COM PAINEL ADMIN (admin.html) E SUPABASE
  // =========================================================================
  function buildStarsHtml(count = 5) {
    const n = Math.min(5, Math.max(1, Number(count) || 5));
    let html = '';
    for (let i = 1; i <= 5; i++) {
      html += `<i data-lucide="star" class="h-3.5 w-3.5 ${i <= n ? 'fill-[#9e004f]' : 'text-zinc-300'}"></i>`;
    }
    return html;
  }

  function renderDynamicCatalog(items) {
    if (!Array.isArray(items) || items.length === 0) return;

    const activeItems = items
      .filter((item) => item && item.ativo !== false)
      .sort((a, b) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0));

    // 1. Queridinhos
    const queridinhosItems = activeItems.filter((i) => i.secao === 'queridinhos' || i.secao === 'ambos');
    if (queridinhosTrack && queridinhosItems.length > 0) {
      queridinhosTrack.innerHTML = queridinhosItems
        .map((item) => {
          const orig = Number(item.preco_original) || 0;
          const desc = Number(item.desconto_pct) || 0;
          const finalPrice = Number(item.preco_final) || Number((orig * (1 - desc / 100)).toFixed(2));
          const hasDiscount = desc > 0 && orig > finalPrice;

          let badgeHtml = '';
          if (item.selo) {
            badgeHtml = `<span class="absolute left-3.5 top-3.5 z-10 rounded-[3px] bg-brand-magenta px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">${item.selo}</span>`;
          } else if (hasDiscount) {
            badgeHtml = `<span class="absolute left-3.5 top-3.5 z-10 rounded-[3px] bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-800">-${desc}%</span>`;
          }

          const curadoriaHtml = item.selo_curadoria
            ? `<div class="absolute left-5 top-1/2 z-10 flex h-14 w-14 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-ink-950 text-center text-[7px] font-bold uppercase leading-tight tracking-wider text-white shadow-md">
                <span class="text-brand-amarelo">2026</span>
                <span>CURADORIA</span>
                <span class="text-[6px] opacity-75">DESTAQUE</span>
              </div>`
            : '';

          const priceHtml = hasDiscount
            ? `<div class="mt-2 flex items-baseline gap-2 text-sm">
                <span class="text-xs text-zinc-400 line-through">${fmt.format(orig)}</span>
                <span class="font-bold text-zinc-800">${fmt.format(finalPrice)}</span>
              </div>`
            : `<div class="mt-2 text-sm font-bold text-zinc-800">${fmt.format(finalPrice)}</div>`;

          return `
            <article class="product-card flex w-[260px] shrink-0 flex-col sm:w-[285px]">
              <div class="group relative flex aspect-square items-center justify-center overflow-hidden bg-white p-6">
                ${badgeHtml}
                ${curadoriaHtml}
                <img src="${item.imagem_url}" alt="${item.titulo}" class="h-4/5 w-4/5 rounded-sm object-cover shadow-md transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              </div>
              <div class="flex flex-1 flex-col justify-between pt-3.5">
                <div>
                  <h3 class="text-base font-normal text-zinc-700">${item.titulo}</h3>
                  <p class="mt-1 line-clamp-2 min-h-[2rem] text-xs leading-relaxed text-zinc-500">${item.subtitulo || ''}</p>
                  <div class="mt-2.5 flex items-center gap-0.5 text-[#9e004f]">
                    ${buildStarsHtml(item.estrelas)}
                  </div>
                  ${priceHtml}
                </div>
                <button type="button" class="add-to-cart mt-4 w-full rounded-md bg-ink-950 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-brand-magenta active:scale-95" data-id="${item.id}" data-title="${item.titulo}" data-img="${item.imagem_url}" data-price="${finalPrice}">
                  Adicionar à sacola
                </button>
              </div>
            </article>
          `;
        })
        .join('');
    }

    // 2. Coleção Completa
    const colecaoGrid = document.getElementById('collection-grid');
    const colecaoItems = activeItems.filter((i) => i.secao === 'colecao' || i.secao === 'ambos');
    if (colecaoGrid && colecaoItems.length > 0) {
      colecaoGrid.innerHTML = colecaoItems
        .map((item) => {
          const orig = Number(item.preco_original) || 0;
          const desc = Number(item.desconto_pct) || 0;
          const finalPrice = Number(item.preco_final) || Number((orig * (1 - desc / 100)).toFixed(2));
          const hasDiscount = desc > 0 && orig > finalPrice;

          let badgeHtml = '';
          if (item.selo) {
            badgeHtml = `<span class="absolute left-3 top-3 z-10 rounded-[3px] bg-brand-magenta px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">${item.selo}</span>`;
          } else if (hasDiscount) {
            badgeHtml = `<span class="absolute left-3 top-3 z-10 rounded-[3px] bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-800 shadow-sm">-${desc}%</span>`;
          }

          const priceHtml = hasDiscount
            ? `<p class="mt-1.5 text-sm"><span class="mr-1.5 text-xs text-zinc-400 line-through">${fmt.format(orig)}</span><strong class="font-bold text-zinc-900">${fmt.format(finalPrice)}</strong></p>`
            : `<p class="mt-1.5 text-sm font-bold text-zinc-900">${fmt.format(finalPrice)}</p>`;

          return `
            <article data-reveal data-category="${item.categoria || 'paisagem'}" class="product-card is-in flex flex-col">
              <div class="group relative flex aspect-square items-center justify-center overflow-hidden rounded-sm bg-[#f7f7f7] p-5">
                ${badgeHtml}
                <img src="${item.imagem_url}" alt="${item.titulo}" class="h-full w-full rounded-sm object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              </div>
              <div class="flex flex-1 flex-col justify-between pt-3">
                <div>
                  <h3 class="text-sm font-medium text-zinc-800 sm:text-base">${item.titulo}</h3>
                  <p class="mt-0.5 text-xs text-zinc-500">${item.subtitulo || ''}</p>
                  <div class="mt-1.5 flex items-center gap-0.5 text-[#9e004f]">
                    ${buildStarsHtml(item.estrelas)}
                  </div>
                  ${priceHtml}
                </div>
                <button type="button" class="add-to-cart mt-3 w-full rounded-md bg-ink-950 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-brand-magenta active:scale-95" data-id="${item.id}" data-title="${item.titulo}" data-img="${item.imagem_url}" data-price="${finalPrice}">
                  Comprar
                </button>
              </div>
            </article>
          `;
        })
        .join('');
    }

    // 3. Carrossel Vertical 5 Cards (Stories)
    const storiesItems = activeItems.filter((i) => i.secao === 'stories');
    if (storiesGrid && storiesItems.length > 0) {
      storiesGrid.innerHTML = storiesItems
        .map((item, idx) => {
          const orig = Number(item.preco_original) || 0;
          const desc = Number(item.desconto_pct) || 0;
          const finalPrice = Number(item.preco_final) || Number((orig * (1 - desc / 100)).toFixed(2));
          const isCenter = idx === 2;

          const topTagHtml = item.selo
            ? `<span class="absolute left-3 top-3 rounded-full bg-brand-magenta px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow">${item.selo}</span>`
            : item.tag_ambiente
            ? `<span class="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
                <i data-lucide="sparkles" class="h-3 w-3 text-brand-amarelo"></i> ${item.tag_ambiente}
              </span>`
            : '';

          return `
            <div class="story-item ${isCenter ? 'is-center w-[235px]' : 'w-[210px]'} shrink-0 lg:w-auto" data-story-index="${idx}">
              <div class="story-media group relative cursor-pointer overflow-hidden rounded-2xl bg-ink-950 shadow-sm">
                <img src="${item.imagem_url}" alt="${item.titulo}" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                ${topTagHtml}
              </div>
              <div class="add-to-cart mt-3 flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200/90 bg-white ${isCenter ? 'p-3' : 'p-2.5'} shadow-sm transition hover:border-brand-magenta/50" data-id="${item.id}" data-title="${item.titulo}" data-img="${item.imagem_url}" data-price="${finalPrice}">
                <img src="${item.imagem_url}" alt="${item.titulo}" class="${isCenter ? 'h-12 w-12' : 'h-11 w-11'} shrink-0 rounded-lg bg-zinc-100 object-cover" />
                <div class="min-w-0 flex-1">
                  <p class="truncate text-xs font-normal text-zinc-600">${item.titulo}</p>
                  <p class="mt-0.5 ${isCenter ? 'text-sm' : 'text-xs'} font-bold text-zinc-800">${fmt.format(finalPrice)}</p>
                </div>
              </div>
            </div>
          `;
        })
        .join('');
    }

    if (window.lucide) lucide.createIcons();
  }

  async function initDynamicCatalog() {
    let savedConn = {};
    try {
      savedConn = JSON.parse(localStorage.getItem('123quadros-supabase-conn') || '{}');
    } catch {}

    const sbUrl = (savedConn.url || window.QUADROS_SUPABASE_CONFIG?.SUPABASE_URL || '').trim();
    const sbKey = (savedConn.key || window.QUADROS_SUPABASE_CONFIG?.SUPABASE_ANON_KEY || '').trim();

    if (sbUrl && sbKey && window.supabase) {
      try {
        const client = window.supabase.createClient(sbUrl, sbKey);
        const { data, error } = await client
          .from('quadros')
          .select('*')
          .eq('ativo', true)
          .order('ordem', { ascending: true });

        if (!error && Array.isArray(data) && data.length > 0) {
          renderDynamicCatalog(data);
          return;
        }
      } catch (err) {
        console.warn('Falha ao buscar catálogo do Supabase, usando fallback local:', err);
      }
    }

    // Fallback para alterações salvas no Painel Admin em Modo Local
    try {
      const localRaw = localStorage.getItem('123quadros-catalog-v1');
      if (localRaw) {
        const parsed = JSON.parse(localRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          renderDynamicCatalog(parsed);
        }
      }
    } catch {}
  }

  initDynamicCatalog();
});
