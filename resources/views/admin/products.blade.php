@extends('layouts.app', ['title' => 'Admin Products'])

@section('content')
<div class="card">
  <span class="chip">Admin</span>
  <h1>Admin Products</h1>
  <p class="muted">Manage product status and storefront visibility.</p>
  <ul class="list" id="admin-products"><li>Loading...</li></ul>
</div>

<script>
  async function loadAdminProducts() {
    const response = await fetch('/api/admin/products');
    const payload = await response.json();
    const rows = payload.data || [];

    document.getElementById('admin-products').innerHTML = rows.map((row) =>
      `<li>${row.name} - <span class="chip">${row.status}</span> - visible: ${row.is_visible}</li>`
    ).join('') || '<li>No products</li>';
  }

  loadAdminProducts().catch(() => {
    document.getElementById('admin-products').innerHTML = '<li>Unable to load products.</li>';
  });
</script>
@endsection
