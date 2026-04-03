@props([
    'id' => 'toast',
    'variant' => 'admin',
])

@if ($variant === 'dashboard')
    <div id="{{ $id }}" style="
      position:fixed;bottom:24px;right:24px;z-index:9999;
      background:var(--foreground);color:white;
      border:2px solid var(--foreground);border-radius:var(--radius-md);
      padding:12px 18px;
      font-family:var(--font-body);font-size:0.82rem;font-weight:600;
      box-shadow:4px 4px 0 rgba(0,0,0,0.3);
      display:none;
      align-items:center;gap:8px;
      max-width:300px;
      animation: popIn 0.3s var(--ease-bounce);
    "></div>
@else
    <div id="{{ $id }}"></div>
@endif
