/* =========================================================================
   MAISON FLEUR — COMPOSANTS RÉUTILISABLES
   Chaque fonction renvoie du HTML (ou monte un widget) à partir des données
   de data.js. Modifier ici pour changer l’apparence d’une carte partout.
   ========================================================================= */
(function () {
  const { PRICES, SCENTS, PRODUCTS, getProduct, getScent, MOODS, LAYERS, GIFTS, UGC } = window.MR;
  const { money, esc, qs, qsa, ICONS, Cart, openPicker, toast } = window.MRApp;

  const pdpLink = (slug, type) => `produit.html?scent=${slug}&type=${type}`;

  /* ------------------------------------------------- Carte PARFUM (scent) */
  function scentCard(scent, opts = {}) {
    const mist = getProduct(`${scent.slug}-mist`);
    const lotion = getProduct(`${scent.slug}-lotion`);
    return `
<article class="card" data-scent-card="${scent.slug}">
  <a class="card-media" href="${pdpLink(scent.slug, 'mist')}" aria-label="${esc(scent.name)}">
    <img src="${mist.image}" data-img-mist="${mist.image}" data-img-lotion="${lotion.image}" alt="${esc(scent.name)} — brume parfumée" loading="lazy" width="900" height="1200">
    ${scent.bestseller ? '<span class="card-tag">Bestseller</span>' : ''}
  </a>
  <div class="card-body">
    <h3 class="card-name">${esc(scent.name)}</h3>
    <p class="card-notes">${scent.notes.map(esc).join(' · ')}</p>
    <div class="seg" role="group" aria-label="Format">
      <button data-format="mist" aria-pressed="true">Brume ${money(PRICES.mist)}</button>
      <button data-format="lotion" aria-pressed="false">Lait ${money(PRICES.lotion)}</button>
    </div>
    <div class="card-actions">
      <button class="btn btn-dark btn-sm btn-block" data-card-add="${scent.slug}">Ajouter — <span data-card-price>${money(PRICES.mist)}</span></button>
      ${opts.duoLink === false ? '' : `<a class="btn btn-ghost btn-sm btn-block" href="duo.html?p1=${scent.slug}-mist" data-card-duo="${scent.slug}">Ajouter au duo</a>`}
    </div>
  </div>
</article>`;
  }

  /* ---------------------------------------------- Carte PRODUIT (unitaire) */
  function productCard(p, opts = {}) {
    return `
<article class="card">
  <a class="card-media" href="${pdpLink(p.slug, p.type)}" aria-label="${esc(p.name)} ${esc(p.typeLabel)}">
    <img src="${p.image}" alt="${esc(p.name)} — ${esc(p.typeLabel)}" loading="lazy" width="900" height="1200">
    <span class="card-tag ${opts.dark ? 'dark' : ''}">${esc(p.typeShort)}</span>
  </a>
  <div class="card-body">
    <h3 class="card-name">${esc(p.name)}</h3>
    <p class="card-notes">${p.notes.map(esc).join(' · ')}</p>
    <p class="card-price">${money(p.price)} <span class="tiny">· ${p.size}</span></p>
    <div class="card-actions">
      ${p.inStock
        ? `<button class="btn btn-dark btn-sm btn-block" data-add="${p.id}">Ajout rapide</button>
           <a class="btn btn-ghost btn-sm btn-block" href="duo.html?p1=${p.id}">Ajouter au duo</a>`
        : `<button class="btn btn-ghost btn-sm btn-block" disabled>Épuisé</button>`}
    </div>
  </div>
</article>`;
  }

  /* Interactions des cartes parfum (bascule brume/lait) */
  function bindScentCards(root = document) {
    qsa('[data-scent-card]', root).forEach((card) => {
      const slug = card.dataset.scentCard;
      let type = 'mist';
      const img = qs('img', card);
      const price = qs('[data-card-price]', card);
      const link = qs('.card-media', card);
      const duo = qs('[data-card-duo]', card);
      qsa('[data-format]', card).forEach((b) => {
        b.addEventListener('click', () => {
          type = b.dataset.format;
          qsa('[data-format]', card).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
          img.src = type === 'mist' ? img.dataset.imgMist : img.dataset.imgLotion;
          price.textContent = money(getProduct(`${slug}-${type}`).price);
          link.href = pdpLink(slug, type);
          if (duo) duo.href = `duo.html?p1=${slug}-${type}`;
        });
      });
      qs('[data-card-add]', card).addEventListener('click', () => Cart.add(`${slug}-${type}`));
    });
  }

  /* ---------------------------------------------------------- Carte MOOD */
  function moodCard(m) {
    const first = getScent(m.scents[0]);
    const names = m.scents.map((s) => getScent(s).name).join(' / ');
    return `
<a class="mood" href="${m.scents.length > 1 ? 'parfums.html' : pdpLink(first.slug, 'mist')}">
  <img src="assets/img/mood/${first.slug}.svg" alt="${esc(m.title)}" loading="lazy" width="800" height="1000">
  <span class="mood-txt">
    <h3>${esc(m.title)}</h3>
    <p>${esc(m.line)}</p>
    <em>${esc(names)}</em>
  </span>
</a>`;
  }

  /* -------------------------------------------------------- Carte LAYERING */
  function layerCard(l) {
    const a = getScent(l.a), b = getScent(l.b);
    return `
<article class="layer-card">
  <div class="layer-imgs">
    <img src="assets/img/scents/${a.slug}-lotion.jpeg" alt="${esc(a.name)}" loading="lazy" width="900" height="1200">
    <span class="plus">+</span>
    <img src="assets/img/scents/${b.slug}-mist.jpeg" alt="${esc(b.name)}" loading="lazy" width="900" height="1200">
  </div>
  <div>
    <p class="names">${esc(a.name)} + ${esc(b.name)}</p>
    <h3>${esc(l.label)}</h3>
    <p>${esc(l.line)}</p>
  </div>
  <a class="btn btn-ghost btn-sm btn-block" href="duo.html?p1=${a.slug}-lotion&p2=${b.slug}-mist">Composer ce duo — ${money(PRICES.duo)}</a>
</article>`;
  }

  /* -------------------------------------------------------------- Carte UGC */
  function ugcCard(u, i) {
    return `
<article class="ugc-card">
  <img src="assets/img/ugc/ugc-${(i % 5) + 1}.jpg" alt="Vidéo ${esc(u.handle)}" loading="lazy" width="600" height="1066">
  <span class="ugc-play">${ICONS.play}</span>
  <span class="ugc-overlay">
    <span class="handle">${esc(u.handle)}</span>
    <span class="comment">« ${esc(u.comment)} »</span>
    <span class="ugc-meta">♡ ${esc(u.likes)} · ${esc(getScent(u.scent).name)}</span>
  </span>
</article>`;
  }

  /* ------------------------------------------------------------ Carte CADEAU */
  function giftCard(g) {
    const p1 = getProduct(`${g.scents[0]}-${g.types[0]}`);
    const p2 = getProduct(`${g.scents[1]}-${g.types[1]}`);
    return `
<article class="gift-item">
  <span class="imgs">
    <img src="${p1.image}" alt="${esc(p1.name)}" loading="lazy" width="900" height="1200">
    <img src="${p2.image}" alt="${esc(p2.name)}" loading="lazy" width="900" height="1200">
  </span>
  <div style="flex:1;min-width:0">
    <h4>${esc(g.title)}</h4>
    <p>${esc(g.line)}</p>
    <p class="price">${money(PRICES.duo)} <s class="tiny">${money(p1.price + p2.price)}</s></p>
  </div>
  <button class="btn btn-dark btn-sm" data-gift="${p1.id}|${p2.id}">Ajouter</button>
</article>`;
  }

  function bindGifts(root = document) {
    qsa('[data-gift]', root).forEach((b) => {
      b.addEventListener('click', () => Cart.addMany(b.dataset.gift.split('|')));
    });
  }

  /* =======================================================================
     WIDGET « PICK ANY 2 » — sélecteur de duo
     mountDuoBuilder(el, {p1, p2})
     ======================================================================= */
  function mountDuoBuilder(el, initial = {}) {
    const state = { p1: initial.p1 || null, p2: initial.p2 || null };

    function slot(n) {
      const id = state['p' + n];
      const p = id ? getProduct(id) : null;
      return `
<div class="slot ${p ? 'filled' : ''}" data-slot="${n}">
  <span class="slot-img">${p ? `<img src="${p.image}" alt="${esc(p.name)}">` : `<span class="ph">${n}</span>`}</span>
  <span class="slot-info">
    <span class="tiny">Produit ${n}</span>
    ${p
      ? `<strong>${esc(p.name)}</strong><span>${esc(p.typeLabel)} · ${money(p.price)}</span>
         <span class="slot-change">Changer</span>`
      : `<strong style="color:var(--muted)">Choisir</strong><span>Brume ou lait, 8 parfums</span>`}
  </span>
</div>`;
    }

    function render() {
      const p1 = state.p1 ? getProduct(state.p1) : null;
      const p2 = state.p2 ? getProduct(state.p2) : null;
      const full = p1 && p2;
      const normal = (p1 ? p1.price : 0) + (p2 ? p2.price : 0);
      const duo = full ? PRICES.duo : null;
      const save = full ? Math.max(0, normal - duo) : 0;

      el.innerHTML = `
<div class="duo-picker">${slot(1)}${slot(2)}</div>
<div class="duo-total">
  <div>
    <p class="tiny">${full ? 'Prix du duo' : 'Deux produits au choix'}</p>
    <p class="amount">${money(full ? duo : PRICES.duo)}${save > 0 ? `<s>${money(normal)}</s>` : ''}</p>
  </div>
  ${save > 0 ? `<p class="duo-save">Tu économises ${money(save)}</p>` : `<p class="tiny">${full ? '' : 'Sélectionne 2 produits'}</p>`}
</div>
<button class="btn btn-cherry btn-block" data-duo-add style="margin-top:16px" ${full ? '' : 'disabled'}>Ajouter mon duo au panier</button>
<button class="btn btn-ghost btn-block btn-sm" data-duo-surprise style="margin-top:9px">Surprends-moi ♡</button>`;

      qsa('[data-slot]', el).forEach((s) => {
        s.addEventListener('click', () => {
          const n = s.dataset.slot;
          openPicker({
            title: `Produit ${n} — choisis ton parfum`,
            selected: state['p' + n],
            onPick: (id) => { state['p' + n] = id; render(); },
          });
        });
      });
      const addBtn = qs('[data-duo-add]', el);
      if (addBtn) addBtn.addEventListener('click', () => {
        if (state.p1 && state.p2) Cart.addMany([state.p1, state.p2]);
      });
      qs('[data-duo-surprise]', el).addEventListener('click', () => {
        const pool = PRODUCTS.filter((p) => p.inStock);
        const a = pool[Math.floor(Math.random() * pool.length)];
        let b = pool[Math.floor(Math.random() * pool.length)];
        while (b.id === a.id) b = pool[Math.floor(Math.random() * pool.length)];
        state.p1 = a.id; state.p2 = b.id; render();
        toast('Ton duo surprise est prêt ♡');
      });
    }

    render();
    return { state, render };
  }

  /* ------------------------------------------------------------- Rendus */
  const renderScents = (el, list = SCENTS) => { el.innerHTML = list.map((s) => scentCard(s)).join(''); bindScentCards(el); };
  const renderProducts = (el, list) => { el.innerHTML = list.map((p) => productCard(p)).join(''); };
  const renderMoods = (el) => { el.innerHTML = MOODS.map(moodCard).join(''); };
  const renderLayers = (el) => { el.innerHTML = LAYERS.map(layerCard).join(''); };
  const renderUgc = (el) => { el.innerHTML = UGC.map(ugcCard).join(''); };
  const renderGifts = (el) => { el.innerHTML = GIFTS.map(giftCard).join(''); bindGifts(el); };

  window.MRC = {
    scentCard, productCard, moodCard, layerCard, ugcCard, giftCard, pdpLink,
    bindScentCards, bindGifts, mountDuoBuilder,
    renderScents, renderProducts, renderMoods, renderLayers, renderUgc, renderGifts,
  };
})();
