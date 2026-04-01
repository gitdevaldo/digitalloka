@extends('layouts.app', ['title' => 'Admin Users'])

@section('content')
<div class="card">
  <h1>Admin Users</h1>
  <ul id="admin-users"><li>Loading...</li></ul>
</div>

<script>
  async function loadAdminUsers() {
    const response = await fetch('/api/admin/users');
    const payload = await response.json();
    const rows = payload.data || [];

    document.getElementById('admin-users').innerHTML = rows.map((row) =>
      `<li>${row.email} - role: ${row.role} - active: ${row.is_active}</li>`
    ).join('') || '<li>No users</li>';
  }

  loadAdminUsers().catch(() => {
    document.getElementById('admin-users').innerHTML = '<li>Unable to load users.</li>';
  });
</script>
@endsection
