@extends('layouts.app', ['title' => 'Admin Orders'])

@section('content')
<div class="card">
  <span class="chip">Admin</span>
  <h1>Admin Orders</h1>
  <p class="muted">Monitor order transitions across all users.</p>
  <table>
    <thead><tr><th>Order</th><th>User</th><th>Status</th><th>Total</th></tr></thead>
    <tbody id="admin-orders"><tr><td colspan="4">Loading...</td></tr></tbody>
  </table>
</div>

<script>
  async function loadAdminOrders() {
    const response = await fetch('/api/admin/orders');
    const payload = await response.json();
    const rows = payload.data || [];

    document.getElementById('admin-orders').innerHTML = rows.map((row) => `
      <tr>
        <td>${row.order_number}</td>
        <td>${row.user?.email || '-'}</td>
        <td><span class="chip">${row.status}</span></td>
        <td>${row.total_amount} ${row.currency}</td>
      </tr>
    `).join('') || '<tr><td colspan="4">No orders</td></tr>';
  }

  loadAdminOrders().catch(() => {
    document.getElementById('admin-orders').innerHTML = '<tr><td colspan="4">Unable to load admin orders.</td></tr>';
  });
</script>
@endsection
