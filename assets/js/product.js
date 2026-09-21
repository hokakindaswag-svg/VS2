/* =========================================================================
   PAGE PRODUIT — produit.html?scent=<slug>&type=<mist|lotion>
   ========================================================================= */
(function () {
  const { PRICES, SCENTS, REVIEWS, INFO, getProduct, getScent, PRODUCTS } = window.MR;
  const { money, esc, qs, qsa, param, Cart, toast, finalizeOrder } = window.MRApp;
  const C = window.MRC;

  const slug = param('scent') || SCENTS[0].slug;
  const scent = getScent(slug) || SCENTS[0];
  let type = param('type') === 'lotion' ? 'lotion' : 'mist';
  let qty = 1;
  let duoPick = null;           // 2ᵉ produit sélectionné dans l’upsell

  const product = () => getProduct(`${scent.slug}-${type}`);

  document.title = `${scent.name} — ${product().typeLabel} · Maison Fleur`;

  /* ------------------------------------------------------------ Galerie */
  function renderGallery() {
    const p = product();
    const imgs = [
      p.image,
      `assets/img/mood/${scent.slug}.svg`,
      getProduct(`${scent.slug}-${type === 'mist' ? 'lotion' : 'mist'}`).image,
    ];
    qs('[data-gallery]').innerHTML = `
      <div class="gallery-track" data-track>
        ${imgs.map((src, i) => `<img src="${src}" alt="${esc(scent.name)} — vue ${i + 1}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'} width="900" height="1200">`).join('')}
      </div>
      <div class="gallery-dots">${imgs.map((_, i) => `<i class="${i === 0 ? 'on' : ''}"></i>`).join('')}</div>`;

    const track = qs('[data-track]');
    track.addEventListener('scroll', () => {
      const i = Math.round(track.scrollLeft / track.clientWidth);
      qsa('.gallery-dots i').forEach((d, j) => d.classList.toggle('on', j === i));
    }, { passive: true });
  }

  /* --------------------------------------------------------- En-tête PDP */
  function renderHead() {
    const p = product();
    qs('[data-crumb]').innerHTML = `<a href="index.html">Accueil</a> / <a href="boutique.html">Boutique</a> / ${esc(scent.name)}`;
    qs('[data-pdp-head]').innerHTML = `
      <div class="rating-row">
        <span class="stars">★★★★★</span> <span>4,8 · 312 avis</span>
      </div>
      <h1>${esc(scent.name)}</h1>
      <p class="pdp-notes">${scent.notes.map(esc).join(' · ')}</p>
      <div class="pdp-price">${money(p.price)} <span class="sub">${esc(p.typeLabel)} · ${p.size}</span></div>
      <p class="pdp-desc">${esc(scent.description)}</p>`;
  }

  /* ------------------------------------------------------- Achat + format */
  function renderBuy() {
    const p = product();
    qs('[data-pdp-buy]').innerHTML = `
      <p class="tiny" style="margin-bottom:8px">Choisis ton format</p>
      <div class="type-switch" role="group" aria-label="Format">
        <button class="type-opt" data-type="mist" aria-pressed="${type === 'mist'}">
          <strong>Brume parfumée</strong><span>${money(PRICES.mist)} · 250 ml</span>
        </button>
        <button class="type-opt" data-type="lotion" aria-pressed="${type === 'lotion'}">
          <strong>Lait parfumé</strong><span>${money(PRICES.lotion)} · 236 ml</span>
        </button>
      </div>
      <div class="buy-row">
        <div class="qty">
          <button data-q="-1" aria-label="Diminuer la quantité">−</button>
          <span data-qty>${qty}</span>
          <button data-q="1" aria-label="Augmenter la quantité">+</button>
        </div>
        <button class="btn btn-dark" data-buy>Ajouter au panier</button>
      </div>
      <button class="btn btn-cherry btn-block" data-buynow>Acheter maintenant</button>
      <p class="tiny" style="margin-top:12px;text-align:center">♡ 2 produits au choix pour ${money(PRICES.duo)} — offre appliquée au panier</p>`;

    qsa('[data-type]').forEach((b) => b.addEventListener('click', () => {
      type = b.dataset.type;
      history.replaceState(null, '', `produit.html?scent=${scent.slug}&type=${type}`);
      renderAll();
    }));
    qsa('[data-q]').forEach((b) => b.addEventListener('click', () => {
      qty = Math.max(1, qty + Number(b.dataset.q));
      qs('[data-qty]').textContent = qty;
    }));
    qs('[data-buy]').addEventListener('click', () => addToCart());
    qs('[data-buynow]').addEventListener('click', () => { addToCart({ silentDrawer: true }); finalizeOrder(); });
  }

  function addToCart(opts = {}) {
    const p = product();
    Cart.add(p.id, qty, { openDrawer: !opts.silentDrawer, silent: opts.silentDrawer });
    if (duoPick) { Cart.add(duoPick, 1, { openDrawer: false, silent: true }); duoPick = null; renderDuo(); }
  }

  /* ------------------------------------------------- MAKE IT A DUO (upsell) */
  function duoRecos() {
    const partner = getProduct(`${scent.slug}-${type === 'mist' ? 'lotion' : 'mist'}`);
    const others = SCENTS
      .filter((s) => s.slug !== scent.slug)
      .sort((a, b) => Number(b.bestseller) - Number(a.bestseller))
      .slice(0, 5)
      .map((s) => getProduct(`${s.slug}-${type}`));
    return [partner, ...others];
  }

  function renderDuo() {
    const p = product();
    const list = duoRecos();
    const picked = duoPick ? getProduct(duoPick) : null;
    const normal = p.price + (picked ? picked.price : 0);
    const duoPrice = PRICES.duo;

    qs('[data-pdp-duo]').innerHTML = `
      <div class="duo-upsell">
        <p class="tiny">L’offre du moment</p>
        <h3>Fais-en un duo.</h3>
        <p class="lede" style="margin-top:8px;font-size:14px">2 produits au choix pour ${money(PRICES.duo)}. Ajoute un 2<sup>e</sup> produit sans quitter la page.</p>
        <div class="upsell-scroll">
          ${list.map((r, i) => `
            <button class="upsell-item ${duoPick === r.id ? 'selected' : ''}" data-duo-pick="${r.id}">
              <img src="${r.image}" alt="${esc(r.name)}" loading="lazy" width="900" height="1200">
              <span class="ub">
                ${i === 0 ? `<span class="upsell-badge">${type === 'mist' ? 'Le lait assorti' : 'La brume assortie'}</span>` : '<span class="upsell-badge">Autre parfum</span>'}
                <strong>${esc(r.name)}</strong>
                <span>${esc(r.typeShort)}</span>
                <em>${money(r.price)}</em>
              </span>
            </button>`).join('')}
          <button class="upsell-item" data-duo-more style="align-items:center;justify-content:center;padding:18px;background:transparent;border:1px dashed var(--rose)">
            <span class="ub" style="text-align:center"><strong>Voir les 16 produits</strong><span>Brumes &amp; laits</span></span>
          </button>
        </div>
        <div class="duo-total">
          <div>
            <p class="tiny">${picked ? 'Ton duo' : 'Sélectionne un 2ᵉ produit'}</p>
            <p class="amount">${money(duoPrice)}${picked && normal > duoPrice ? `<s>${money(normal)}</s>` : ''}</p>
          </div>
          ${picked && normal > duoPrice ? `<p class="duo-save">− ${money(normal - duoPrice)}</p>` : ''}
        </div>
        <button class="btn btn-cherry btn-block" data-duo-add ${picked ? '' : 'disabled'}>
          ${picked ? `Ajouter le duo — ${money(duoPrice)}` : 'Choisis un 2ᵉ produit'}
        </button>
      </div>`;

    qsa('[data-duo-pick]').forEach((b) => b.addEventListener('click', () => {
      duoPick = duoPick === b.dataset.duoPick ? null : b.dataset.duoPick;
      renderDuo();
    }));
    qs('[data-duo-more]').addEventListener('click', () => {
      window.MRApp.openPicker({
        title: 'Choisis ton 2ᵉ produit',
        selected: duoPick,
        onPick: (id) => { duoPick = id; renderDuo(); },
      });
    });
    const add = qs('[data-duo-add]');
    if (add) add.addEventListener('click', () => {
      if (!duoPick) return;
      Cart.addMany([product().id, duoPick]);
      duoPick = null; renderDuo();
    });
  }

  /* ----------------------------------------------- Infos / accordéons */
  function renderInfo() {
    const blocks = [
      { t: 'Les notes', b: `${scent.longNote} Notes : ${scent.notes.join(' · ')}. Famille : ${scent.family}. Intensité : ${'●'.repeat(scent.intensity)}${'○'.repeat(5 - scent.intensity)}` },
      { t: 'Comment l\'utiliser', b: "Applique le lait sur peau propre, puis vaporise la brume à 20 cm sur le cou, les poignets et le décolleté. Pour une tenue maximale, superpose les deux formats du même parfum." },
      { t: 'Ingrédients', b: INFO.ingredients },
      { t: 'Livraison', b: INFO.shipping },
      { t: 'Retours', b: INFO.returns },
    ];
    qs('[data-pdp-info]').innerHTML = `<div style="margin-top:26px">${blocks.map((x) => `
      <div class="acc">
        <button class="acc-head">${esc(x.t)}<i>+</i></button>
        <div class="acc-body"><p>${esc(x.b)}</p></div>
      </div>`).join('')}</div>`;

    qsa('.acc-head').forEach((h) => h.addEventListener('click', () => {
      const acc = h.parentElement;
      const body = qs('.acc-body', acc);
      const open = acc.classList.toggle('open');
      body.style.maxHeight = open ? body.scrollHeight + 'px' : 0;
    }));
  }

  /* ------------------------------------------------------------- Avis */
  function renderReviews() {
    qs('[data-pdp-reviews]').innerHTML = REVIEWS.map((r) => `
      <div class="review">
        <span class="stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
        <h4>${esc(r.title)}</h4>
        <p>${esc(r.text)}</p>
        <p class="who">${esc(r.name)} · Achat vérifié</p>
      </div>`).join('');
  }

  /* --------------------------------------------------------- Suggestions */
  function renderRelated() {
    const list = SCENTS.filter((s) => s.slug !== scent.slug).map((s) => getProduct(`${s.slug}-${type}`)).slice(0, 8);
    C.renderProducts(qs('[data-pdp-related]'), list);
  }

  /* ----------------------------------------------------- Barre collante */
  function renderSticky() {
    const p = product();
    const bar = qs('[data-sticky]');
    bar.innerHTML = `
      <div class="info"><strong>${esc(scent.name)}</strong><span>${esc(p.typeShort)} · ${money(p.price)}</span></div>
      <button class="btn btn-cherry btn-sm" data-sticky-add>Ajouter</button>`;
    qs('[data-sticky-add]').addEventListener('click', () => addToCart());

    const anchor = qs('[data-pdp-buy]');
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => bar.classList.toggle('show', !e.isIntersecting && e.boundingClientRect.top < 0),
        { threshold: 0 }).observe(anchor);
    }
  }

  function renderAll() {
    renderGallery(); renderHead(); renderBuy(); renderDuo(); renderInfo(); renderRelated(); renderSticky();
  }

  renderAll();
  renderReviews();
  window.MRApp.reveals();
})();
