@extends('layouts.app', ['title' => 'Dashboard'])

@section('content')
<div class="card">
  <h1>User Dashboard</h1>
  <p class="muted">Manage droplets, products, and orders from one place.</p>
  <ul>
    <li><a href="/dashboard/droplets">Droplets</a></li>
    <li><a href="/dashboard/products">Purchased Products</a></li>
    <li><a href="/dashboard/orders">Order History</a></li>
  </ul>
</div>
@endsection
