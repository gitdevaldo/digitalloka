<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{ $title ?? 'DigitalLoka' }}</title>
  <style>
    :root {
      --bg: #f8faf7;
      --card: #ffffff;
      --ink: #1f2933;
      --accent: #0f766e;
      --line: #d8e1dd;
    }
    body { margin: 0; font-family: "Segoe UI", sans-serif; background: radial-gradient(circle at top right, #d6f5e8, var(--bg)); color: var(--ink); }
    header { padding: 14px 20px; border-bottom: 1px solid var(--line); background: rgba(255,255,255,.85); backdrop-filter: blur(6px); }
    nav a { margin-right: 14px; color: var(--ink); text-decoration: none; font-weight: 600; }
    main { max-width: 1080px; margin: 0 auto; padding: 24px 18px 40px; }
    .card { background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 16px; }
    .grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
    .muted { color: #52606d; font-size: 14px; }
    .chip { display: inline-block; padding: 3px 8px; border-radius: 999px; background: #e8f7f2; color: #0f766e; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; border-bottom: 1px solid var(--line); padding: 8px 6px; }
    .controls { display: grid; gap: 8px; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); margin-bottom: 12px; }
    select, input { width: 100%; border: 1px solid var(--line); border-radius: 8px; padding: 8px; }
    button { background: var(--accent); color: #fff; border: 0; border-radius: 8px; padding: 8px 12px; cursor: pointer; }
    @media (max-width: 640px) {
      nav a { display: inline-block; margin-bottom: 8px; }
    }
  </style>
</head>
<body>
  <header>
    <nav>
      <a href="/">Catalog</a>
      <a href="/dashboard">Dashboard</a>
      <a href="/dashboard/products">Products</a>
      <a href="/dashboard/orders">Orders</a>
      <a href="/admin">Admin</a>
    </nav>
  </header>
  <main>
    @yield('content')
  </main>
</body>
</html>
