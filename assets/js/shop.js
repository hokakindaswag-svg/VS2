/* Boutique — filtres, tri, grille */
(function () {
  const { PRODUCTS, SCENTS, TYPES } = window.MR;
  const { qs, qsa, param } = window.MRApp;
  const C = window.MRC;

  const state = { type: param('type') || 'all', scent: param('scent') || 'all', sort: 'pop' };

  if (state.type !== 'all' && TYPES[state.type]) {
    qs('[data-shop-title]').innerHTML = state.type === 'mist'
      ? 'Les <span class="italic">brumes</span>.' : 'Les <span class="italic">laits</span>.';
    qs('[data-shop-eyebrow]').textContent = TYPES[state.type].label + ' · ' + TYPES[state.type].size;
    document.title = `${TYPES[state.type].label} — Maison Fleur`;
  }

  function filters() {
    const list = [
      { k: 'type', v: 'all', label: 'Tout' },
      { k: 'type', v: 'mist', label: 'Brumes' },
      { k: 'type', v: 'lotion', label: 'Laits' },
      ...SCENTS.map((s) => ({ k: 'scent', v: s.slug, label: s.name })),
    ];
    qs('[data-shop-filters]').innerHTML = list.map((f) =>
      `<button class="chip" data-k="${f.k}" data-v="${f.v}" aria-pressed="${state[f.k] === f.v}">${f.label}</button>`).join('');
    qsa('[data-k]').forEach((b) => b.addEventListener('click', () => {
      state[b.dataset.k] = b.dataset.v;
      if (b.dataset.k === 'type') state.scent = 'all';
      render();
    }));
  }

  function render() {
    let list = PRODUCTS.filter((p) =>
      (state.type === 'all' || p.type === state.type) &&
      (state.scent === 'all' || p.slug === state.scent));

    if (state.sort === 'asc') list = [...list].sort((a, b) => a.price - b.price);
    if (state.sort === 'desc') list = [...list].sort((a, b) => b.price - a.price);
    if (state.sort === 'az') list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
    if (state.sort === 'pop') list = [...list].sort((a, b) => Number(b.scent.bestseller) - Number(a.scent.bestseller));

    C.renderProducts(qs('[data-shop-grid]'), list);
    qs('[data-shop-count]').textContent = `${list.length} produit${list.length > 1 ? 's' : ''}`;
    filters();
  }

  qs('[data-sort]').addEventListener('change', (e) => { state.sort = e.target.value; render(); });
  render();
})();
