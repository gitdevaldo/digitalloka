@extends('layouts.app', ['title' => 'DigitalLoka Catalog'])

@section('content')
<div class="card">
  <h1>Digital Product Catalog</h1>
  <p class="muted">Filter and discover available digital products.</p>
</div>

<div class="grid" style="margin-top: 14px;" id="catalog-grid"></div>

<script>
  async function loadProducts() {
    const response = await fetch('/api/products');
    const payload = await response.json();
    const rows = payload.data || [];

    const grid = document.getElementById('catalog-grid');
    grid.innerHTML = rows.map((item) => `
      <article class="card">
        <span class="chip">${item.status}</span>
        <h3>${item.name}</h3>
        <p class="muted">${item.short_description ?? 'No description yet.'}</p>
        <a href="/products/${item.slug}">View product</a>
      </article>
    `).join('');
  }

  loadProducts().catch(() => {
    document.getElementById('catalog-grid').innerHTML = '<div class="card">Failed to load products.</div>';
  });
</script>
@endsection
