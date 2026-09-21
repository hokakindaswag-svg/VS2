/* =========================================================================
   MAISON FLEUR — NOYAU APPLICATIF
   · panier (localStorage)
   · moteur de prix « 2 au choix pour 19,99 € »
   · en-tête / pied de page / tiroirs / sélecteur produit / toasts
   ========================================================================= */
(function () {
  const { BRAND, PRICES, SCENTS, PRODUCTS, getProduct, TYPES } = window.MR;

  /* --------------------------------------------------------------- Utils */
  const money = (n) =>
    n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));
  const param = (k) => new URLSearchParams(location.search).get(k);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------------------------------------------------------- Icônes SVG */
  const ICONS = {
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"/></svg>',
    bag: '<svg viewBox="0 0 24 24"><path d="M5 8h14l1 12H4L5 8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>',
    menu: '<svg viewBox="0 0 24 24"><path d="M3 7h18M3 12h18M3 17h18"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
    tt: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.5"><path d="M15 4c.6 2.4 2 3.6 4.5 3.9v3c-1.7.1-3.2-.4-4.5-1.3v5.6c0 3.4-2.5 5.8-5.7 5.8A5.6 5.6 0 0 1 3.8 15c0-3.3 2.9-5.9 6.3-5.5v3.1c-1.7-.5-3.2.5-3.2 2.3 0 1.4 1.1 2.5 2.6 2.5 1.6 0 2.6-1.1 2.6-2.8V4H15z"/></svg>',
    play: '<svg viewBox="0 0 24 24" stroke="none"><path d="M7 4l13 8-13 8z"/></svg>',
    heart: '♡',
  };

  /* ================================================================ PANIER */
  const KEY = 'mr_cart_v1';
  const read = () => {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  };
  const write = (items) => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
    document.dispatchEvent(new CustomEvent('cart:change'));
  };

  const Cart = {
    items: () => read().filter((l) => getProduct(l.id)),
    count: () => Cart.items().reduce((n, l) => n + l.qty, 0),
    add(id, qty = 1, opts = {}) {
      if (!getProduct(id)) return;
      const items = read();
      const current = items.reduce((n, l) => n + l.qty, 0);
      const room = ORDER_MAX_UNITS - current;
      if (room <= 0) { toast(`Maximum ${ORDER_MAX_UNITS} produits par commande — ${money(PRICES.duo)}`); return; }
      qty = Math.min(qty, room);
      const line = items.find((l) => l.id === id);
      if (line) line.qty += qty; else items.push({ id, qty });
      write(items);
      if (!opts.silent) {
        const p = getProduct(id);
        toast(`${p.name} — ${p.typeShort} ajouté ${ICONS.heart}`);
      }
      if (opts.openDrawer !== false) openCart();
    },
    addMany(ids) {
      const items = read();
      const current = items.reduce((n, l) => n + l.qty, 0);
      if (current + ids.length > ORDER_MAX_UNITS) {
        toast(`Maximum ${ORDER_MAX_UNITS} produits par commande — ${money(PRICES.duo)}`);
        return;
      }
      ids.forEach((id) => {
        if (!getProduct(id)) return;
        const line = items.find((l) => l.id === id);
        if (line) line.qty += 1; else items.push({ id, qty: 1 });
      });
      write(items);
      toast(`Duo ajouté au panier ${ICONS.heart}`);
      openCart();
    },
    setQty(id, qty) {
      let items = read();
      const otherUnits = items.filter((l) => l.id !== id).reduce((n, l) => n + l.qty, 0);
      qty = Math.max(0, Math.min(qty, ORDER_MAX_UNITS - otherUnits));
      if (qty <= 0) items = items.filter((l) => l.id !== id);
      else { const l = items.find((x) => x.id === id); if (l) l.qty = qty; else items.push({ id, qty }); }
      write(items);
    },
    remove(id) { Cart.setQty(id, 0); },
    clear() { write([]); },
  };

  /* -------------------------------------------- Moteur de prix DUO 19,99 */
  /* Règle : chaque paire de produits éligibles passe à 19,99 € pile
     (2 brumes à 9,99 € = 19,98 € normalement, on arrondit à 19,99 €). */
  function pricing(items = Cart.items()) {
    const units = [];
    items.forEach((l) => {
      const p = getProduct(l.id);
      for (let i = 0; i < l.qty; i++) units.push(p);
    });
    const eligible = units.filter((p) => p.eligibleDuo).sort((a, b) => b.price - a.price);
    const others = units.filter((p) => !p.eligibleDuo);

    const subtotal = units.reduce((s, p) => s + p.price, 0);
    let total = others.reduce((s, p) => s + p.price, 0);
    let pairs = 0;

    for (let i = 0; i < eligible.length; i += 2) {
      const a = eligible[i], b = eligible[i + 1];
      if (b) { total += PRICES.duo; pairs++; }
      else total += a.price;
    }
    const savings = Math.max(0, subtotal - total);
    const single = eligible.length % 2 === 1;   // un produit « orphelin »
    return { units, subtotal, total, savings, pairs, single, count: units.length };
  }

  /* ------------------------------------------------ Plafond de commande */
  /* Maximum 2 produits par commande — 19,99 € max. */
  const ORDER_MAX_UNITS = 2;

  /* ---------------------------------------------------------- Suggestions */
  function recommend(limit = 4, excludeIds = []) {
    const inCart = new Set(Cart.items().map((l) => l.id).concat(excludeIds));
    const pool = PRODUCTS.filter((p) => !inCart.has(p.id) && p.inStock);
    // priorité : le format complémentaire des produits déjà au panier
    const partners = [];
    Cart.items().forEach((l) => {
      const p = getProduct(l.id);
      const other = `${p.slug}-${p.type === 'mist' ? 'lotion' : 'mist'}`;
      const found = pool.find((x) => x.id === other);
      if (found && !partners.includes(found)) partners.push(found);
    });
    const best = pool.filter((p) => p.scent.bestseller && !partners.includes(p));
    return [...partners, ...best, ...pool].filter((p, i, a) => a.indexOf(p) === i).slice(0, limit);
  }

  /* ================================================================ TOAST */
  let toastEl, toastTimer;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    requestAnimationFrame(() => toastEl.classList.add('show'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
  }

  /* ========================================================= EN-TÊTE / NAV */
  const NAV = [
    { href: 'boutique.html', label: 'Boutique', sub: 'Tout le catalogue' },
    { href: 'boutique.html?type=mist', label: 'Brumes', sub: '9,99 € · 250 ml' },
    { href: 'boutique.html?type=lotion', label: 'Laits', sub: '9,99 € · 236 ml' },
    { href: 'parfums.html', label: 'Les parfums', sub: 'Les 8 signatures' },
  ];

  function header() {
    const bar = `<div class="announce"><div class="announce-track">${
      Array(2).fill(
        `<span>♡ 2 produits au choix pour 19,99 € — mix &amp; match ♡</span>
         <span>Livraison offerte, sans minimum</span>
         <span>♡ Brume &amp; Lait 9,99 € ♡</span>
         <span>Retours gratuits sous 30 jours</span>`
      ).join('')
    }</div></div>`;

    const links = NAV.map((n) => `<a href="${n.href}">${n.label.toUpperCase()}</a>`).join('');

    return `<div class="site-top" data-site-top>${bar}
<header class="nav">
  <div class="nav-inner">
    <div class="nav-left">
      <button class="icon-btn burger" aria-label="Ouvrir le menu" data-open-menu>${ICONS.menu}</button>
      <nav class="nav-links" aria-label="Navigation principale">${links}</nav>
    </div>
    <a class="logo" href="index.html">${BRAND.name}<small>Paris</small></a>
    <div class="nav-right">
      <button class="icon-btn" aria-label="Rechercher" data-open-search>${ICONS.search}</button>
      <a class="icon-btn" href="compte.html" aria-label="Mon compte">${ICONS.user}</a>
      <button class="icon-btn" aria-label="Panier" data-open-cart>${ICONS.bag}<span class="cart-count hide" data-cart-count>0</span></button>
    </div>
  </div>
</header>
</div>

<div class="drawer" id="menu" aria-hidden="true">
  <div class="drawer-head">
    <span class="logo">${BRAND.name}</span>
    <button class="icon-btn" aria-label="Fermer le menu" data-close-menu>${ICONS.close}</button>
  </div>
  <nav>
    ${NAV.map((n) => `<a href="${n.href}">${n.label}<small>${n.sub}</small></a>`).join('')}
    <a href="duo.html">2 au choix — 19,99 €<small>Compose ton duo</small></a>
    <a href="cadeaux.html">Cadeaux<small>Pour elle, pour toi</small></a>
  </nav>
  <div class="drawer-foot">
    <p>♡ 2 produits pour 19,99 € ♡</p>
    <a class="btn btn-cherry btn-block" href="duo.html">Composer mon duo</a>
  </div>
</div>

<div class="overlay" data-overlay></div>

<aside class="cart-drawer" id="cart-drawer" aria-hidden="true" aria-label="Panier">
  <div class="cd-head">
    <h3>Ton panier</h3>
    <button class="icon-btn" aria-label="Fermer le panier" data-close-cart>${ICONS.close}</button>
  </div>
  <div class="cd-body" data-cart-body></div>
  <div class="cd-foot" data-cart-foot></div>
</aside>`;
  }

  /* ======================================================== PIED DE PAGE */
  function footer() {
    const cols = [
      { h: 'Boutique', links: [['boutique.html', 'Tous les produits'], ['boutique.html?type=mist', 'Brumes parfumées'], ['boutique.html?type=lotion', 'Laits parfumés'], ['parfums.html', 'Les parfums'], ['duo.html', '2 au choix — 19,99 €'], ['cadeaux.html', 'Cadeaux']] },
      { h: 'La maison', links: [['infos.html#a-propos', 'À propos'], ['infos.html#faq', 'FAQ'], ['infos.html#contact', 'Contact'], ['parfums.html', 'Notre signature']] },
      { h: 'Aide', links: [['infos.html#livraison', 'Livraison'], ['infos.html#retours', 'Retours'], ['infos.html#faq', 'Questions fréquentes'], ['infos.html#contact', 'Nous écrire']] },
      { h: 'Légal', links: [['infos.html#confidentialite', 'Confidentialité'], ['infos.html#cgv', 'CGV'], ['infos.html#cookies', 'Cookies'], ['infos.html#mentions', 'Mentions légales']] },
    ];
    return `
<section class="news">
  <div class="wrap">
    <p class="eyebrow">La newsletter</p>
    <h2>Rejoins les girls</h2>
    <p>Accès prioritaire aux nouveaux parfums, aux lancements et aux éditions limitées.</p>
    <form data-newsletter>
      <label class="sr" for="nl-email">Ton e-mail</label>
      <input id="nl-email" type="email" required placeholder="Ton e-mail" autocomplete="email">
      <button class="btn btn-cherry" type="submit">Je m’inscris</button>
    </form>
    <p class="note">En t’inscrivant, tu acceptes de recevoir nos e-mails. Désinscription en un clic.</p>
  </div>
</section>
<footer>
  <div class="wrap">
    <div class="foot-cols">
      ${cols.map((c) => `<div><h4>${c.h}</h4>${c.links.map(([h, l]) => `<a href="${h}">${l}</a>`).join('')}</div>`).join('')}
    </div>
    <div class="foot-bottom">
      <a class="logo" href="index.html">${BRAND.name}</a>
      <div class="socials">
        <a href="${BRAND.instagram}" aria-label="Instagram" rel="noopener" target="_blank">${ICONS.ig}</a>
        <a href="${BRAND.tiktok}" aria-label="TikTok" rel="noopener" target="_blank">${ICONS.tt}</a>
      </div>
      <p>© ${new Date().getFullYear()} ${BRAND.name} — Fabriqué en France · Vegan · Non testé sur les animaux</p>
    </div>
  </div>
</footer>`;
  }

  /* =========================================================== TIROIRS UI */
  const overlay = () => qs('[data-overlay]');
  function openMenu() { qs('#menu').classList.add('open'); overlay().classList.add('open'); document.body.classList.add('no-scroll'); }
  function closeMenu() { qs('#menu').classList.remove('open'); overlay().classList.remove('open'); document.body.classList.remove('no-scroll'); }
  function openCart() { renderCartDrawer(); qs('#cart-drawer').classList.add('open'); overlay().classList.add('open'); document.body.classList.add('no-scroll'); }
  function closeCart() { qs('#cart-drawer').classList.remove('open'); overlay().classList.remove('open'); document.body.classList.remove('no-scroll'); }

  /* -------------------------------------------------- Confirmation commande */
  const PAYMENT_LINKS = {
    single: 'https://t.trklinkx.com/click?pid=4784&offer_id=13179&sub3=im',
    duo:    'https://t.trklinkx.com/click?pid=4784&offer_id=13057&sub3=im',
  };
  function finalizeOrder() {
    if (!Cart.items().length) { toast('Ton panier est vide'); return; }
    closeCart();
    window.location.href = 'shipping.html';
  }

  /* ------------------------------------------------- Rendu tiroir panier */
  function renderCartDrawer() {
    const body = qs('[data-cart-body]'), foot = qs('[data-cart-foot]');
    if (!body) return;
    const items = Cart.items();
    const p = pricing(items);

    if (!items.length) {
      body.innerHTML = `
        <div class="empty">
          <h2 class="h-section">Ton panier est vide</h2>
          <p class="lede" style="margin:0 auto 22px">Deux produits au choix pour 19,99 €. On commence par lequel ?</p>
          <a class="btn btn-cherry btn-block" href="boutique.html">Découvrir les parfums</a>
        </div>`;
      foot.innerHTML = '';
      return;
    }

    const progress = p.single
      ? `<div class="progress-card">
           <h3>Il te manque un produit ♡</h3>
           <p>Ajoute un 2<sup>e</sup> produit éligible et profite des 2 pour ${money(PRICES.duo)}.</p>
           <div class="bar"><i style="width:50%"></i></div>
           <p class="tiny">1 produit sur 2</p>
         </div>`
      : `<div class="progress-card">
           <h3>Ton duo est prêt ♡</h3>
           <p>${p.pairs} duo${p.pairs > 1 ? 's' : ''} · ${money(PRICES.duo)} les 2 produits.${p.savings > 0 ? ` Tu économises ${money(p.savings)}.` : ''}</p>
           <div class="bar"><i style="width:100%"></i></div>
           <p class="tiny">Offre appliquée automatiquement</p>
         </div>`;

    const lines = items.map((l) => {
      const pr = getProduct(l.id);
      return `<div class="cart-line">
        <img src="${pr.image}" alt="${esc(pr.name)} ${esc(pr.typeShort)}" loading="lazy">
        <div class="cl-body">
          <strong>${esc(pr.name)}</strong>
          <span class="cl-meta">${esc(pr.typeLabel)} · ${pr.size}</span>
          <span class="cl-meta">${money(pr.price)}</span>
          <div class="cl-foot">
            <div class="qty-mini">
              <button data-qty="${pr.id}" data-delta="-1" aria-label="Retirer un exemplaire">−</button>
              <span>${l.qty}</span>
              <button data-qty="${pr.id}" data-delta="1" aria-label="Ajouter un exemplaire">+</button>
            </div>
            <button class="remove" data-remove="${pr.id}">Supprimer</button>
          </div>
        </div>
      </div>`;
    }).join('');

    const recos = recommend(p.single ? 4 : 3);
    const recoBlock = recos.length ? `
      <div style="padding:18px 0 6px">
        <p class="tiny" style="margin-bottom:10px">${p.single ? 'Complète ton duo' : 'Ça se superpose très bien'}</p>
        <div class="mini-recos">
          ${recos.map((r) => `
            <button class="mini-reco" data-add="${r.id}">
              <img src="${r.image}" alt="${esc(r.name)}" loading="lazy">
              <span class="mb"><strong>${esc(r.name)}</strong><span>${esc(r.typeShort)} · ${money(r.price)}</span></span>
            </button>`).join('')}
        </div>
      </div>` : '';

    body.innerHTML = progress + lines + recoBlock;

    foot.innerHTML = `
      ${p.savings > 0 ? `<div class="trow"><span class="duo-save">Offre duo appliquée</span><span class="duo-save">− ${money(p.savings)}</span></div>` : ''}
      <div class="trow">
        <span class="tiny">Total</span>
        <span class="amount">${money(p.total)}${p.savings > 0 ? ` <s style="font-size:14px;color:var(--muted)">${money(p.subtotal)}</s>` : ''}</span>
      </div>
      <button class="btn btn-dark btn-block" data-finalize>Passer commande</button>
      <a class="btn btn-ghost btn-block" href="panier.html" style="margin-top:8px">Voir le panier</a>`;
  }

  /* ================================================ SÉLECTEUR DE PRODUIT */
  /* openPicker({title, type, exclude, onPick}) */
  let pickerEl, pickerState = {};
  function buildPicker() {
    pickerEl = document.createElement('div');
    pickerEl.className = 'picker';
    pickerEl.innerHTML = `
      <div class="picker-panel" role="dialog" aria-modal="true" aria-label="Choisir un produit">
        <div class="picker-head">
          <h3 data-picker-title>Choisis ton produit</h3>
          <p class="tiny">8 parfums · brumes &amp; laits</p>
          <button class="icon-btn picker-close" aria-label="Fermer">${ICONS.close}</button>
        </div>
        <div class="picker-filters" data-picker-filters></div>
        <div class="picker-list" data-picker-list></div>
      </div>`;
    document.body.appendChild(pickerEl);
    pickerEl.addEventListener('click', (e) => {
      if (e.target === pickerEl || e.target.closest('.picker-close')) closePicker();
      const chip = e.target.closest('[data-filter]');
      if (chip) { pickerState.filter = chip.dataset.filter; renderPicker(); }
      const item = e.target.closest('[data-pick]');
      if (item) { const id = item.dataset.pick; closePicker(); pickerState.onPick && pickerState.onPick(id); }
    });
  }
  function renderPicker() {
    const filters = [
      { id: 'all', label: 'Tout' },
      { id: 'mist', label: 'Brumes 9,99 €' },
      { id: 'lotion', label: 'Laits 9,99 €' },
      ...SCENTS.map((s) => ({ id: s.slug, label: s.name })),
    ];
    qs('[data-picker-filters]', pickerEl).innerHTML = filters.map((f) =>
      `<button class="chip" data-filter="${f.id}" aria-pressed="${pickerState.filter === f.id}">${esc(f.label)}</button>`).join('');

    let list = PRODUCTS.filter((p) => p.inStock);
    if (pickerState.type) list = list.filter((p) => p.type === pickerState.type);
    if (pickerState.filter && pickerState.filter !== 'all') {
      list = list.filter((p) => p.type === pickerState.filter || p.slug === pickerState.filter);
    }
    qs('[data-picker-list]', pickerEl).innerHTML = list.map((p) => `
      <button class="pick-item ${pickerState.selected === p.id ? 'selected' : ''}" data-pick="${p.id}">
        <img src="${p.image}" alt="${esc(p.name)} ${esc(p.typeShort)}" loading="lazy">
        <span class="pi-body">
          <strong>${esc(p.name)}</strong>
          <span>${esc(p.typeShort)} · ${money(p.price)}</span>
        </span>
      </button>`).join('');
  }
  function openPicker(opts) {
    if (!pickerEl) buildPicker();
    pickerState = Object.assign({ filter: 'all', type: null, selected: null }, opts);
    qs('[data-picker-title]', pickerEl).textContent = opts.title || 'Choisis ton produit';
    renderPicker();
    pickerEl.classList.add('open');
    document.body.classList.add('no-scroll');
  }
  function closePicker() { pickerEl && pickerEl.classList.remove('open'); document.body.classList.remove('no-scroll'); }

  /* ================================================== RECHERCHE (overlay) */
  function openSearch() {
    openPicker({
      title: 'Rechercher un parfum',
      onPick: (id) => { const p = getProduct(id); location.href = `produit.html?scent=${p.slug}&type=${p.type}`; },
    });
  }

  /* ====================================================== ANIMATION SCROLL */
  function reveals() {
    const els = qsa('.reveal:not(.in)');
    if (!('IntersectionObserver' in window)) return els.forEach((e) => e.classList.add('in'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach((e) => io.observe(e));
  }

  /* ================================================================ BOOT */
  function updateCount() {
    const n = Cart.count();
    qsa('[data-cart-count]').forEach((el) => {
      el.textContent = n;
      el.classList.toggle('hide', n === 0);
    });
  }

  /* La barre d'offre reste visible : elle se replie en descendant,
     et réapparaît dès que l'on remonte. */
  function stickyTop() {
    const top = qs('[data-site-top]');
    if (!top) return;
    let last = window.scrollY;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      top.classList.toggle('compact', y > last && y > 260);
      last = y;
    }, { passive: true });
  }

  function mount() {
    const h = qs('#site-header'); if (h) h.innerHTML = header();
    const f = qs('#site-footer'); if (f) f.innerHTML = footer();
    updateCount();
    reveals();
    stickyTop();

    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-open-menu]')) openMenu();
      if (e.target.closest('[data-close-menu]')) closeMenu();
      if (e.target.closest('[data-open-cart]')) openCart();
      if (e.target.closest('[data-close-cart]')) closeCart();
      if (e.target.closest('[data-open-search]')) openSearch();
      if (e.target.closest('[data-overlay]')) { closeMenu(); closeCart(); }

      const add = e.target.closest('[data-add]');
      if (add) { Cart.add(add.dataset.add, 1, { openDrawer: add.dataset.silent !== 'true' }); }

      const qty = e.target.closest('[data-qty]');
      if (qty) {
        const id = qty.dataset.qty;
        const line = Cart.items().find((l) => l.id === id);
        if (line) Cart.setQty(id, line.qty + Number(qty.dataset.delta));
      }
      const rm = e.target.closest('[data-remove]');
      if (rm) Cart.remove(rm.dataset.remove);

      if (e.target.closest('[data-finalize]')) finalizeOrder();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { closeMenu(); closeCart(); closePicker(); }
    });

    document.addEventListener('submit', (e) => {
      const form = e.target.closest('[data-newsletter]');
      if (form) {
        e.preventDefault();
        form.reset();
        toast('Bienvenue dans le club ♡');
      }
    });

    document.addEventListener('cart:change', () => {
      updateCount();
      if (qs('#cart-drawer')) renderCartDrawer();
    });
  }

  /* ------------------------------------------------------------- Exports */
  window.MRApp = {
    money, qs, qsa, param, esc, ICONS, Cart, pricing, recommend, toast,
    openPicker, closePicker, openCart, closeCart, reveals, renderCartDrawer, finalizeOrder,
    PAYMENT_LINKS,
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
