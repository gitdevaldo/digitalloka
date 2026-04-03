@extends('layouts.app', ['title' => 'Dashboard'])

@section('content')
<section class="card stack">
  <div class="section-head">
    <div>
      <p class="section-eyebrow">Workspace</p>
      <h1>User Dashboard</h1>
    </div>
    <span class="chip">Operational</span>
  </div>
  <p class="muted">Manage droplets, products, and orders from a single operational panel.</p>
  <div class="metric-row">
    <div class="metric">
      <p class="metric-label">Droplets</p>
      <p class="metric-value">Live</p>
    </div>
    <div class="metric">
      <p class="metric-label">Products</p>
      <p class="metric-value">Entitled</p>
    </div>
    <div class="metric">
      <p class="metric-label">Orders</p>
      <p class="metric-value">Tracked</p>
    </div>
  </div>
</section>

<section class="grid-2">
  <article class="card">
    <h2>Droplets</h2>
    <p class="muted">Manage droplet actions and monitoring flow.</p>
    <a class="btn" href="/dashboard/droplets">Open droplet panel</a>
  </article>
  <article class="card">
    <h2>Purchased Products</h2>
    <p class="muted">Track product access and entitlement health.</p>
    <a class="btn" href="/dashboard/products">View products</a>
  </article>
  <article class="card">
    <h2>Order History</h2>
    <p class="muted">Review order statuses and finance details.</p>
    <a class="btn" href="/dashboard/orders">View orders</a>
  </article>
</section>
@endsection
