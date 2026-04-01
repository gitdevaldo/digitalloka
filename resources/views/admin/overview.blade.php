@extends('layouts.app', ['title' => 'Admin Dashboard'])

@section('content')
<div class="card">
  <h1>Admin Dashboard</h1>
  <p class="muted">Operational control center for site, products, users, and orders.</p>
  <ul>
    <li><a href="/admin/products">Products</a></li>
    <li><a href="/admin/users">Users</a></li>
    <li><a href="/admin/orders">Orders</a></li>
    <li><a href="/admin/settings">Settings</a></li>
  </ul>
</div>
@endsection
