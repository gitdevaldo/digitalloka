@extends('layouts.app', ['title' => 'Dashboard Products'])

@section('content')
<div class="card">
  <h1>Purchased Products</h1>
  <p class="muted">Entitlements and status per product.</p>
  <div id="products-list">Loading...</div>
</div>

<script>
  async function loadUserProducts() {
    const response = await fetch('/api/user/products');
    const payload = await response.json();
    const rows = payload.data || [];

    document.getElementById('products-list').innerHTML = rows.map((row) =>
      `<div><strong>${row.product?.name || 'Unknown Product'}</strong> - <span class="chip">${row.status}</span></div>`
    ).join('') || 'No purchased products';
  }

  loadUserProducts().catch(() => {
    document.getElementById('products-list').textContent = 'Unable to load purchased products.';
  });
</script>
@endsection
