@extends('layouts.app', ['title' => 'DigitalLoka Catalog'])

@section('content')
<div class="card">
  <span class="chip">Catalog</span>
  <h1>Digital Product Catalog</h1>
  <p class="muted">Browse products with filter and sorting controls designed for quick operational lookup.</p>
</div>

<div class="card">
  <h2>Filters</h2>
  <div class="controls">
    <input id="filter-category" placeholder="Category slug" />
    <input id="filter-type" placeholder="Type" />
    <select id="filter-availability">
      <option value="">Any availability</option>
      <option value="available">available</option>
      <option value="out-of-stock">out-of-stock</option>
      <option value="coming-soon">coming-soon</option>
    </select>
    <input id="filter-min-price" type="number" placeholder="Min price" />
    <input id="filter-max-price" type="number" placeholder="Max price" />
    <select id="filter-sort">
      <option value="recommended">recommended</option>
      <option value="newest">newest</option>
      <option value="price_asc">price_asc</option>
      <option value="price_desc">price_desc</option>
    </select>
  </div>
  <button onclick="loadProducts()">Apply Filters</button>
</div>

<div id="catalog-grid"></div>

<style>
  #catalog-grid {
    display: grid;
    gap: 10px;
    width: 100%;
  }

  .catalog-row {
    width: 100%;
    display: grid;
    gap: 8px;
    padding: 14px;
    border: 2px solid var(--foreground);
    border-radius: var(--radius-lg);
    background: var(--card);
    box-shadow: 4px 4px 0 0 var(--shadow);
  }

  .catalog-row .btn {
    width: fit-content;
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
    grid.innerHTML = rows.map((item) => `
      <article class="catalog-row">
        <span class="chip">${item.status}</span>
        <h3>${item.name}</h3>
        <p class="muted">${item.short_description ?? 'No description yet.'}</p>
        <a class="btn" href="/products/${item.slug}">View product</a>
      </article>
    `).join('') || '<div class="panel"><h3>No products found</h3><p class="muted">Try changing filter parameters.</p></div>';
  }

  hydrateUiFromQuery();
  loadProducts().catch(() => {
    document.getElementById('catalog-grid').innerHTML = '<div class="panel"><h3>Failed to load products</h3><p class="muted">Please refresh and try again.</p></div>';
  });
</script>
@endsection
