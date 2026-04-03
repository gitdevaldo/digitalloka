@extends('layouts.app', ['title' => 'Dashboard Products'])

@section('content')
<div class="card">
  <span class="chip">Products</span>
  <h1>Purchased Products</h1>
  <p class="muted">Entitlements and status per product.</p>
  <div class="grid" id="products-list"><div class="card">Loading...</div></div>
</div>

<script>
  async function loadUserProducts() {
    const response = await fetch('/api/user/products');
    const payload = await response.json();
    const rows = payload.data || [];

    document.getElementById('products-list').innerHTML = rows.map((row) =>
      `<article class="card"><h3>${row.product?.name || 'Unknown Product'}</h3><p class="muted">Entitlement status</p><span class="chip">${row.status}</span></article>`
    ).join('') || '<div class="card"><h3>No purchased products</h3><p class="muted">Products will appear here once active.</p></div>';
  }

  loadUserProducts().catch(() => {
    document.getElementById('products-list').innerHTML = '<div class="card"><h3>Unable to load purchased products</h3><p class="muted">Please refresh and try again.</p></div>';
  });
</script>
@endsection
