@extends('layouts.app', ['title' => 'Dashboard Orders'])

@section('content')
<div class="card">
  <h1>Order History</h1>
  <table>
    <thead><tr><th>Order</th><th>Status</th><th>Total</th></tr></thead>
    <tbody id="orders-body"><tr><td colspan="3">Loading...</td></tr></tbody>
  </table>
</div>

<script>
  async function loadOrders() {
    const response = await fetch('/api/user/orders');
    const payload = await response.json();
    const rows = payload.data || [];

    document.getElementById('orders-body').innerHTML = rows.map((row) => `
      <tr>
        <td>${row.order_number}</td>
        <td><span class="chip">${row.status}</span></td>
        <td>${row.total_amount} ${row.currency}</td>
      </tr>
    `).join('') || '<tr><td colspan="3">No orders</td></tr>';
  }

  loadOrders().catch(() => {
    document.getElementById('orders-body').innerHTML = '<tr><td colspan="3">Unable to load orders.</td></tr>';
  });
</script>
@endsection
