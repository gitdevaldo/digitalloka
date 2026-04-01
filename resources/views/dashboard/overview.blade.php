@extends('layouts.app', ['title' => 'Dashboard'])

@section('content')
<div class="card">
  <h1>User Dashboard</h1>
  <p class="muted">Unified area for droplets, products, orders, and licenses.</p>
  <ul>
    <li><a href="/dashboard/products">Purchased Products</a></li>
    <li><a href="/dashboard/orders">Order History</a></li>
    <li><a href="/dashboard/licenses">Licenses</a></li>
    <li><a href="/dashboard/droplets">Droplets</a></li>
  </ul>
</div>
@endsection
