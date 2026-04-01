@extends('layouts.app', ['title' => 'Admin Dashboard'])

@section('content')
<div class="card">
  <span class="chip">Admin</span>
  <h1>Admin Dashboard</h1>
  <p class="muted">Operational control center for site, products, users, and orders.</p>
</div>

<div class="grid">
  <article class="card">
    <h2>Products</h2>
    <p class="muted">Control pricing, visibility, and catalog metadata.</p>
    <a class="btn" href="/admin/products">Manage products</a>
  </article>
  <article class="card">
    <h2>Users</h2>
    <p class="muted">Review role assignments and account status.</p>
    <a class="btn" href="/admin/users">Manage users</a>
  </article>
  <article class="card">
    <h2>Orders</h2>
    <p class="muted">Monitor transitions and operational throughput.</p>
    <a class="btn" href="/admin/orders">Manage orders</a>
  </article>
  <article class="card">
    <h2>Settings</h2>
    <p class="muted">Update site-wide controls with audit visibility.</p>
    <a class="btn" href="/admin/settings">Manage settings</a>
  </article>
</div>
@endsection
