@extends('layouts.app', ['title' => 'DigitalLoka Catalog'])

@section('content')
<section class="dlk-page-wrapper">
  <aside class="dlk-sidebar">
    <div class="dlk-sidebar-section">
      <p class="section-eyebrow">Category</p>
      <div class="dlk-filter-chip-group" id="category-filters">
        <button type="button" class="dlk-filter-chip active" data-category="" onclick="setCategory('')">
          <span>All products</span>
          <span class="dlk-chip-count" id="count-all">0</span>
        </button>
      </div>
    </div>

    <div class="dlk-sidebar-section">
      <p class="section-eyebrow">Availability</p>
      <select id="filter-availability" onchange="loadProducts()">
        <option value="">Any availability</option>
        <option value="available">available</option>
        <option value="out-of-stock">out-of-stock</option>
        <option value="coming-soon">coming-soon</option>
      </select>
    </div>

    <div class="dlk-sidebar-section">
      <p class="section-eyebrow">Price range</p>
      <div class="controls controls-2">
        <input id="filter-min-price" type="number" min="0" placeholder="Min" />
        <input id="filter-max-price" type="number" min="0" placeholder="Max" />
      </div>
      <button type="button" class="btn btn-ghost" onclick="loadProducts()">Apply Price</button>
    </div>

    <div class="dlk-sidebar-section">
      <p class="section-eyebrow">Type</p>
      <input id="filter-type" placeholder="Product type" />
    </div>

    <button type="button" class="btn" onclick="resetFilters()">Reset All Filters</button>
  </aside>

  <main class="dlk-main">
    <section class="dlk-hero-strip">
      <div>
        <p class="section-eyebrow" style="color: rgba(255,255,255,0.85);">Marketplace</p>
        <h1 class="dlk-hero-title">Digital Product Catalog</h1>
        <p class="dlk-hero-subtitle">Templates, plugins, and digital assets sourced from live backend data.</p>
      </div>
      <div class="dlk-hero-badges">
        <div class="dlk-hero-badge">
          <span class="dlk-hero-num" id="result-count">0</span>
          <span class="dlk-hero-label">Products</span>
        </div>
        <div class="dlk-hero-badge">
          <span class="dlk-hero-num" id="active-sort">recommended</span>
          <span class="dlk-hero-label">Sort</span>
        </div>
      </div>
    </section>

    <section class="dlk-toolbar">
      <input id="search-input" placeholder="Search product name or description" oninput="renderProducts()" />
      <select id="filter-sort" onchange="loadProducts()">
        <option value="recommended">Featured</option>
        <option value="newest">Newest</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
    </section>

    <section class="dlk-product-grid" id="catalog-grid"></section>
  </main>
</section>

<style>
  .dlk-page-wrapper {
    display: grid;
    grid-template-columns: 280px minmax(0, 1fr);
    gap: 20px;
    align-items: start;
  }

  .dlk-sidebar {
    position: sticky;
    top: 84px;
    display: grid;
    gap: 16px;
    padding: 16px;
    border: 2px solid var(--foreground);
    border-radius: var(--radius-xl);
    background: var(--card);
    box-shadow: 5px 5px 0 var(--shadow);
  }

  .dlk-sidebar-section {
    display: grid;
    gap: 8px;
  }

  .dlk-filter-chip-group {
    display: grid;
    gap: 6px;
  }

  .dlk-filter-chip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 8px 10px;
    border: 2px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--card);
    color: var(--foreground);
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .dlk-filter-chip:hover,
  .dlk-filter-chip.active {
    border-color: var(--foreground);
    box-shadow: 3px 3px 0 var(--shadow);
    transform: translate(-1px, -1px);
  }

  .dlk-chip-count {
    font-size: 0.72rem;
    padding: 2px 8px;
    border-radius: 999px;
    background: var(--muted);
    color: var(--muted-foreground);
    font-weight: 700;
  }

  .dlk-main {
    display: grid;
    gap: 16px;
  }

  .dlk-hero-strip {
    display: flex;
    justify-content: space-between;
    gap: 14px;
    align-items: start;
    padding: 22px;
    border: 2px solid var(--foreground);
    border-radius: var(--radius-xl);
    background: var(--accent);
    box-shadow: 6px 6px 0 var(--shadow);
  }

  .dlk-hero-title {
    color: var(--accent-foreground);
    font-size: clamp(1.5rem, 3vw, 2.2rem);
  }

  .dlk-hero-subtitle {
    margin-top: 6px;
    color: rgba(255,255,255,0.86);
    font-weight: 600;
  }

  .dlk-hero-badges {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .dlk-hero-badge {
    min-width: 120px;
    border: 2px solid rgba(255,255,255,0.45);
    border-radius: var(--radius-md);
    padding: 8px 10px;
    background: rgba(255,255,255,0.12);
  }

  .dlk-hero-num {
    display: block;
    color: #fff;
    font-family: "Outfit", sans-serif;
    font-size: 1.12rem;
    font-weight: 800;
    text-transform: capitalize;
  }

  .dlk-hero-label {
    display: block;
    color: rgba(255,255,255,0.8);
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  .dlk-toolbar {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 240px;
    gap: 10px;
  }

  .dlk-product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 14px;
  }

  .dlk-product-card {
    display: grid;
    gap: 10px;
    padding: 14px;
    border: 2px solid var(--foreground);
    border-radius: var(--radius-xl);
    background: var(--card);
    box-shadow: 4px 4px 0 var(--shadow);
  }

  .dlk-product-head {
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: 10px;
  }

  .dlk-product-title {
    font-family: "Outfit", sans-serif;
    font-size: 1.05rem;
    font-weight: 700;
  }

  .dlk-product-meta {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted-foreground);
  }

  .dlk-product-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }

  .dlk-price {
    font-family: "Outfit", sans-serif;
    font-size: 1.15rem;
    font-weight: 800;
  }

  .dlk-empty-state {
    grid-column: 1 / -1;
    padding: 26px;
    border: 2px dashed var(--foreground);
    border-radius: var(--radius-xl);
    background: var(--muted);
    text-align: center;
  }

  @media (max-width: 980px) {
    .dlk-page-wrapper {
      grid-template-columns: minmax(0, 1fr);
    }

    .dlk-sidebar {
      position: static;
      top: auto;
    }

    .dlk-toolbar {
      grid-template-columns: minmax(0, 1fr);
    }

    .dlk-hero-strip {
      flex-direction: column;
    }
  }
</style>

<script>
  const state = {
    category: '',
    type: '',
    availability: '',
    minPrice: '',
    maxPrice: '',
    sort: 'recommended',
    search: '',
  };

  let allRows = [];

  function toNumberPrice(item) {
    const prices = Array.isArray(item.prices) ? item.prices : [];
    if (prices.length === 0) {
      return null;
    }

    const amounts = prices
      .map((p) => Number.parseFloat(p.amount))
      .filter((value) => Number.isFinite(value));

    return amounts.length > 0 ? Math.min(...amounts) : null;
  }

  function statusBadge(status) {
    const label = String(status || 'unknown');
    return `<span class="chip">${label}</span>`;
  }

  function setCategory(categorySlug) {
    state.category = categorySlug;

    document.querySelectorAll('#category-filters .dlk-filter-chip').forEach((button) => {
      button.classList.toggle('active', button.dataset.category === categorySlug);
    });

    loadProducts();
  }

  function resetFilters() {
    state.category = '';
    state.type = '';
    state.availability = '';
    state.minPrice = '';
    state.maxPrice = '';
    state.sort = 'recommended';
    state.search = '';

    document.getElementById('filter-type').value = '';
    document.getElementById('filter-availability').value = '';
    document.getElementById('filter-min-price').value = '';
    document.getElementById('filter-max-price').value = '';
    document.getElementById('filter-sort').value = 'recommended';
    document.getElementById('search-input').value = '';

    setCategory('');
  }

  function syncSidebarCategories(rows) {
    const grouped = new Map();
    rows.forEach((item) => {
      const slug = item.category?.slug || '';
      const name = item.category?.name || 'Uncategorized';
      if (!slug) {
        return;
      }

      if (!grouped.has(slug)) {
        grouped.set(slug, { name, count: 0 });
      }

      grouped.get(slug).count += 1;
    });

    const buttons = ['<button type="button" class="dlk-filter-chip ' + (state.category === '' ? 'active' : '') + '" data-category="" onclick="setCategory(\'\')"><span>All products</span><span class="dlk-chip-count" id="count-all">' + rows.length + '</span></button>'];

    [...grouped.entries()].sort((a, b) => a[1].name.localeCompare(b[1].name)).forEach(([slug, info]) => {
      const activeClass = state.category === slug ? 'active' : '';
      buttons.push('<button type="button" class="dlk-filter-chip ' + activeClass + '" data-category="' + slug + '" onclick="setCategory(\'' + slug + '\')"><span>' + info.name + '</span><span class="dlk-chip-count">' + info.count + '</span></button>');
    });

    document.getElementById('category-filters').innerHTML = buttons.join('');
  }

  function getDisplayRows() {
    const query = state.search.trim().toLowerCase();
    if (!query) {
      return allRows;
    }

    return allRows.filter((item) => {
      const haystack = [
        item.name,
        item.short_description,
        item.category?.name,
      ].filter(Boolean).join(' ').toLowerCase();

      return haystack.includes(query);
    });
  }

  function renderProducts() {
    const rows = getDisplayRows();
    document.getElementById('result-count').textContent = String(rows.length);
    document.getElementById('active-sort').textContent = state.sort;

    const grid = document.getElementById('catalog-grid');
    if (rows.length === 0) {
      grid.innerHTML = '<div class="dlk-empty-state"><h3>No products found</h3><p class="muted">Try changing category, price, or search query.</p></div>';
      return;
    }

    grid.innerHTML = rows.map((item) => {
      const price = toNumberPrice(item);
      const priceText = price === null ? 'N/A' : '$' + price.toFixed(2);

      return '<article class="dlk-product-card">' +
        '<div class="dlk-product-head">' +
          '<div>' +
            '<p class="dlk-product-meta">' + (item.category?.name || 'Uncategorized') + '</p>' +
            '<h3 class="dlk-product-title">' + item.name + '</h3>' +
          '</div>' +
          statusBadge(item.status) +
        '</div>' +
        '<p class="muted">' + (item.short_description || 'No description available.') + '</p>' +
        '<div class="dlk-product-footer">' +
          '<strong class="dlk-price">' + priceText + '</strong>' +
          '<a class="btn" href="/products/' + item.slug + '">View Product</a>' +
        '</div>' +
      '</article>';
    }).join('');
  }

  function buildParams() {
    state.type = document.getElementById('filter-type').value.trim();
    state.availability = document.getElementById('filter-availability').value;
    state.minPrice = document.getElementById('filter-min-price').value;
    state.maxPrice = document.getElementById('filter-max-price').value;
    state.sort = document.getElementById('filter-sort').value;

    const params = new URLSearchParams();
    if (state.category) params.set('category', state.category);
    if (state.type) params.set('type', state.type);
    if (state.availability) params.set('availability', state.availability);
    if (state.minPrice) params.set('min_price', state.minPrice);
    if (state.maxPrice) params.set('max_price', state.maxPrice);
    if (state.sort) params.set('sort', state.sort);
    params.set('per_page', '48');
    return params;
  }

  async function loadProducts() {
    const params = buildParams();
    const newUrl = window.location.pathname + '?' + params.toString();
    window.history.replaceState({}, '', newUrl);

    const response = await fetch('/api/products?' + params.toString());
    const payload = await response.json();
    allRows = Array.isArray(payload.data) ? payload.data : [];

    syncSidebarCategories(allRows);
    renderProducts();
  }

  function hydrateFromQuery() {
    const params = new URLSearchParams(window.location.search);
    state.category = params.get('category') || '';
    state.type = params.get('type') || '';
    state.availability = params.get('availability') || '';
    state.minPrice = params.get('min_price') || '';
    state.maxPrice = params.get('max_price') || '';
    state.sort = params.get('sort') || 'recommended';

    document.getElementById('filter-type').value = state.type;
    document.getElementById('filter-availability').value = state.availability;
    document.getElementById('filter-min-price').value = state.minPrice;
    document.getElementById('filter-max-price').value = state.maxPrice;
    document.getElementById('filter-sort').value = state.sort;
  }

  hydrateFromQuery();
  document.getElementById('filter-type').addEventListener('change', loadProducts);
  document.getElementById('search-input').addEventListener('input', (event) => {
    state.search = event.target.value;
    renderProducts();
  });

  loadProducts().catch(() => {
    document.getElementById('catalog-grid').innerHTML = '<div class="dlk-empty-state"><h3>Unable to load products</h3><p class="muted">Please refresh and try again.</p></div>';
  });
</script>
@endsection
