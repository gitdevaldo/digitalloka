@extends('layouts.app', ['title' => 'Admin Settings'])

@section('content')
<div class="card">
  <span class="chip">Admin</span>
  <h1>Admin Settings</h1>
  <p class="muted">Inspect and update grouped site configuration values.</p>
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
