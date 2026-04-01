@extends('layouts.app', ['title' => 'DigitalLoka Catalog'])

@section('content')
<section class="catalog-shell">
  <aside class="card filter-rail">
    <div class="section-head">
      <div>
        <p class="section-eyebrow">Control</p>
        <h2>Filters</h2>
      </div>
      <button class="btn btn-ghost" onclick="resetFilters()">Reset</button>
    </div>
    <p class="muted">Adjust constraints and apply when ready.</p>

    <div class="filter-stack">
      <label>
        <span class="section-eyebrow">Category</span>
        <input id="filter-category" list="category-options" placeholder="e.g. Compute" />
      </label>
      <datalist id="category-options"></datalist>
      <label>
        <span class="section-eyebrow">Type</span>
        <input id="filter-type" placeholder="product type" />
      </label>
      <label>
        <span class="section-eyebrow">Availability</span>
        <select id="filter-availability">
          <option value="">Any availability</option>
          <option value="available">available</option>
          <option value="out-of-stock">out-of-stock</option>
          <option value="coming-soon">coming-soon</option>
        </select>
      </label>
      <div class="controls controls-2">
        <label>
          <span class="section-eyebrow">Min price</span>
          <input id="filter-min-price" type="number" placeholder="0" />
        </label>
        <label>
          <span class="section-eyebrow">Max price</span>
          <input id="filter-max-price" type="number" placeholder="100" />
        </label>
      </div>
      <label>
        <span class="section-eyebrow">Sort</span>
        <select id="filter-sort">
          <option value="recommended">recommended</option>
          <option value="newest">newest</option>
          <option value="price_asc">price_asc</option>
          <option value="price_desc">price_desc</option>
        </select>
      </label>
    </div>

    <button class="btn" onclick="loadProducts()">Apply Filters</button>
  </aside>

  <section class="results-column stack">
    <div class="panel results-head" id="results-head">
      <div class="results-title-wrap">
        <p class="section-eyebrow">Marketplace</p>
        <h1 class="results-title">Digital Product Catalog</h1>
        <p class="muted results-subtitle">Browse matching products and open details from the list below.</p>
      </div>
      <div class="toolbar-meta">
        <span class="chip" id="result-count">0 items</span>
        <span class="chip" id="sort-state">recommended</span>
      </div>
    </div>

    <section id="catalog-grid"></section>
  </section>
</section>

<style>
  .catalog-shell {
    display: grid;
    grid-template-columns: 300px minmax(0, 1fr);
    gap: 14px;
    align-items: start;
  }

  .filter-rail {
    position: sticky;
    top: 84px;
    display: grid;
    gap: 12px;
  }

  .filter-stack {
    display: grid;
    gap: 10px;
  }

  .controls-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-bottom: 0;
  }

  .results-head {
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: 14px;
    flex-wrap: wrap;
    padding: 16px;
    border: 2px solid var(--foreground);
    background: linear-gradient(125deg, rgba(139, 92, 246, 0.08), rgba(52, 211, 153, 0.08) 60%, rgba(251, 191, 36, 0.08));
    box-shadow: 4px 4px 0 0 var(--shadow);
  }

  .results-title-wrap {
    display: grid;
    gap: 4px;
    min-width: 260px;
  }

  .results-title {
    font-size: clamp(1.5rem, 2.6vw, 2.1rem);
    line-height: 1.1;
  }

  .results-subtitle {
    margin: 0;
    max-width: 62ch;
  }

  .results-column {
    min-width: 0;
  }

  #catalog-grid {
    display: grid;
    gap: 10px;
    width: 100%;
  }

  .toolbar-meta {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .catalog-row .btn {
    width: fit-content;
  }

  .catalog-row {
    display: grid;
    gap: 10px;
  }

  .catalog-row header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .catalog-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .empty-state {
    display: grid;
    gap: 12px;
    border: 2px dashed var(--foreground);
    border-radius: var(--radius-md);
    padding: 18px;
    background: linear-gradient(180deg, rgba(241, 245, 249, 0.85), rgba(255, 253, 245, 0.95));
  }

  .empty-state h3 {
    font-size: 1.2rem;
  }

  .empty-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .empty-hints {
    margin: 0;
    padding-left: 18px;
    display: grid;
    gap: 4px;
    color: var(--muted-foreground);
    font-weight: 600;
    font-size: 0.92rem;
  }

  @media (max-width: 980px) {
    .catalog-shell {
      grid-template-columns: minmax(0, 1fr);
    }

    .filter-rail {
      position: static;
      top: auto;
    }
  }
</style>

<script>
  function normalizeCategoryInput(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  function syncCategorySuggestions(rows) {
    const categories = [...new Set(rows
      .map((item) => item.category?.name || item.category?.slug)
      .filter(Boolean))];

    const options = categories
      .sort((a, b) => a.localeCompare(b))
      .map((name) => `<option value="${String(name).replace(/"/g, '&quot;')}"></option>`)
      .join('');

    document.getElementById('category-options').innerHTML = options;
  }

  function paramsFromUi() {
    const params = new URLSearchParams(window.location.search);

    const categoryValue = normalizeCategoryInput(document.getElementById('filter-category').value);

    const fields = [
      ['category', categoryValue],
      ['type', document.getElementById('filter-type').value],
      ['availability', document.getElementById('filter-availability').value],
      ['min_price', document.getElementById('filter-min-price').value],
      ['max_price', document.getElementById('filter-max-price').value],
      ['sort', document.getElementById('filter-sort').value],
    ];

    params.forEach((_, key) => params.delete(key));

    for (const [key, value] of fields) {
      if (value !== '' && value != null) {
        params.set(key, value);
      }
    }

    return params;
  }

  function resetFilters() {
    document.getElementById('filter-category').value = '';
    document.getElementById('filter-type').value = '';
    document.getElementById('filter-availability').value = '';
    document.getElementById('filter-min-price').value = '';
    document.getElementById('filter-max-price').value = '';
    document.getElementById('filter-sort').value = 'recommended';
    loadProducts();
  }

  function hydrateUiFromQuery() {
    const params = new URLSearchParams(window.location.search);
    document.getElementById('filter-category').value = params.get('category') || '';
    document.getElementById('filter-type').value = params.get('type') || '';
    document.getElementById('filter-availability').value = params.get('availability') || '';
    document.getElementById('filter-min-price').value = params.get('min_price') || '';
    document.getElementById('filter-max-price').value = params.get('max_price') || '';
    document.getElementById('filter-sort').value = params.get('sort') || 'recommended';
  }

  async function loadProducts() {
    const params = paramsFromUi();
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);

    const response = await fetch(`/api/products?${params.toString()}`);
    const payload = await response.json();
    const rows = payload.data || [];
    syncCategorySuggestions(rows);

    const grid = document.getElementById('catalog-grid');
    document.getElementById('result-count').textContent = `${rows.length} items`;
    document.getElementById('sort-state').textContent = document.getElementById('filter-sort').value;

    if (rows.length === 0) {
      grid.innerHTML = `
        <section class="empty-state">
          <h3>No products match this filter set</h3>
          <p class="muted">Your current criteria returned no results. Adjust one or two filters and try again.</p>
          <ul class="empty-hints">
            <li>Clear category or type to broaden results.</li>
            <li>Widen min/max price range.</li>
            <li>Switch availability to "Any availability".</li>
          </ul>
          <div class="empty-actions">
            <button class="btn" type="button" onclick="resetFilters()">Reset Filters</button>
            <button class="btn btn-ghost" type="button" onclick="document.getElementById('filter-sort').value='recommended'; loadProducts();">Use Recommended Sort</button>
          </div>
        </section>
      `;
      return;
    }

    grid.innerHTML = rows.map((item) => `
      <article class="card catalog-row">
        <header>
          <h3>${item.name}</h3>
          <span class="chip">${item.status}</span>
        </header>
        <p class="muted">${item.short_description ?? 'No description yet.'}</p>
        <div class="catalog-actions">
          <a class="btn" href="/products/${item.slug}">View product</a>
          <button class="btn btn-secondary" type="button" onclick="window.location.href='/products/${item.slug}'">Open detail</button>
        </div>
      </article>
    `).join('');
  }

  hydrateUiFromQuery();
  loadProducts().catch(() => {
    document.getElementById('catalog-grid').innerHTML = '<div class="panel"><h3>Failed to load products</h3><p class="muted">Please refresh and try again.</p></div>';
  });
</script>
@endsection
