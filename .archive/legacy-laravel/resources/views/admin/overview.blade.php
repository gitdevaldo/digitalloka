@extends('layouts.app', ['title' => 'Admin Dashboard'])

@section('content')
<section class="card stack">
  <div class="section-head">
    <div>
      <p class="section-eyebrow">Admin Control</p>
      <h1>Admin Dashboard</h1>
    </div>
    <span class="chip">Restricted</span>
  </div>
  <p class="muted">Operate product, user, order, and settings workflows from a single control center.</p>
  <div class="metric-row">
    <div class="metric">
      <p class="metric-label">Products</p>
      <p class="metric-value">Managed</p>
    </div>
    <div class="metric">
      <p class="metric-label">Users</p>
      <p class="metric-value">Governed</p>
    </div>
    <div class="metric">
      <p class="metric-label">Orders</p>
      <p class="metric-value">Controlled</p>
    </div>
  </div>
</section>

<section class="grid-2">
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
</section>
@endsection
