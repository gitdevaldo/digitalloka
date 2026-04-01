@extends('layouts.app', ['title' => 'DigitalLoka Catalog'])

@section('content')
<section class="card stack">
  <div class="section-head">
    <div>
      <p class="section-eyebrow">Marketplace</p>
      <h1>Digital Product Catalog</h1>
    </div>
    <span class="chip">Live Listing</span>
  </div>
  <p class="muted">Find the right product fast with operational filters, deterministic sorting, and one-click detail access.</p>
  <div class="metric-row">
    <div class="metric">
      <p class="metric-label">State</p>
      <p class="metric-value" id="metric-total">-</p>
    </div>
    <div class="metric">
      <p class="metric-label">Sort</p>
      <p class="metric-value" id="metric-sort">recommended</p>
    </div>
    <div class="metric">
      <p class="metric-label">Mode</p>
      <p class="metric-value">Filtered</p>
    </div>
  </div>
</section>

<section class="card stack">
  <div class="section-head">
    <h2>Filters</h2>
    <button class="btn btn-ghost" onclick="resetFilters()">Reset</button>
  </div>
  <div class="controls">
    <label>
      <span class="section-eyebrow">Category</span>
      <input id="filter-category" placeholder="category slug" />
    </label>
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
    <label>
      <span class="section-eyebrow">Min price</span>
      <input id="filter-min-price" type="number" placeholder="0" />
    </label>
    <label>
      <span class="section-eyebrow">Max price</span>
      <input id="filter-max-price" type="number" placeholder="100" />
    </label>
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
</section>

<section id="catalog-grid"></section>

<style>
  #catalog-grid {
    display: grid;
    gap: 10px;
    width: 100%;
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
</style>

<script>
  function paramsFromUi() {
    const params = new URLSearchParams(window.location.search);

    const fields = [
      ['category', document.getElementById('filter-category').value],
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

    const grid = document.getElementById('catalog-grid');
    document.getElementById('metric-total').textContent = `${rows.length} items`;
    document.getElementById('metric-sort').textContent = document.getElementById('filter-sort').value;

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
    `).join('') || '<div class="panel"><h3>No products found</h3><p class="muted">Try changing filter parameters.</p></div>';
  }

  hydrateUiFromQuery();
  loadProducts().catch(() => {
    document.getElementById('catalog-grid').innerHTML = '<div class="panel"><h3>Failed to load products</h3><p class="muted">Please refresh and try again.</p></div>';
  });
</script>
@endsection
