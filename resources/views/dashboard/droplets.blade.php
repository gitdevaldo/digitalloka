@extends('layouts.app', ['title' => 'Dashboard Droplets'])

@section('content')
<div class="card">
  <h1>Droplet Management</h1>
  <p class="muted">Existing droplet operations remain available via API parity routes.</p>
  <p><a href="/api/droplets">Open droplets API</a></p>
</div>
@endsection
