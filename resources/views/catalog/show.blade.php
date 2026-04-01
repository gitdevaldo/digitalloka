@extends('layouts.app', ['title' => 'Product Detail'])

@section('content')
<div class="card" id="product-card">
  <h1>Loading product...</h1>
</div>

<script>
  const slug = @json($slug);

  async function loadProduct() {
    const response = await fetch(`/api/products/${slug}`);
    const payload = await response.json();
    const p = payload.product;

    if (!p) {
      document.getElementById('product-card').innerHTML = '<h1>Product not found</h1>';
      return;
    }

    const prices = (p.prices || []).map((price) => `<li>${price.name}: ${price.amount} ${price.currency}</li>`).join('');
    document.getElementById('product-card').innerHTML = `
      <span class="chip">${p.status}</span>
      <h1>${p.name}</h1>
      <p class="muted">${p.short_description || ''}</p>
      <h3>Packages</h3>
      <ul>${prices || '<li>No active package</li>'}</ul>
      <h3>FAQ</h3>
      <pre>${JSON.stringify(p.faq_items || [], null, 2)}</pre>
    `;
  }

  loadProduct();
</script>
@endsection
