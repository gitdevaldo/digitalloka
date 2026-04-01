@extends('layouts.app', ['title' => 'Admin Settings'])

@section('content')
<div class="card">
  <h1>Admin Settings</h1>
  <pre id="settings-box">Loading...</pre>
</div>

<script>
  async function loadSettings() {
    const response = await fetch('/api/admin/settings');
    const payload = await response.json();
    document.getElementById('settings-box').textContent = JSON.stringify(payload.settings || {}, null, 2);
  }

  loadSettings().catch(() => {
    document.getElementById('settings-box').textContent = 'Unable to load settings.';
  });
</script>
@endsection
