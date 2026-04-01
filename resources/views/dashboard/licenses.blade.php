@extends('layouts.app', ['title' => 'Dashboard Licenses'])

@section('content')
<div class="card">
  <h1>Licenses</h1>
  <ul id="license-list"><li>Loading...</li></ul>
</div>

<script>
  async function loadLicenses() {
    const response = await fetch('/api/user/licenses');
    const payload = await response.json();
    const rows = payload.data || [];

    document.getElementById('license-list').innerHTML = rows.map((row) =>
      `<li>${row.license_key} - <span class="chip">${row.status}</span></li>`
    ).join('') || '<li>No licenses</li>';
  }

  loadLicenses().catch(() => {
    document.getElementById('license-list').innerHTML = '<li>Unable to load licenses.</li>';
  });
</script>
@endsection
