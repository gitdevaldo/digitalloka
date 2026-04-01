@extends('layouts.app', ['title' => 'Dashboard'])

@section('content')
<div class="card">
  <span class="chip">Workspace</span>
  <h1>User Dashboard</h1>
  <p class="muted">Manage droplets, products, and orders from one place.</p>
</div>

<div class="grid">
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
</div>
@endsection
