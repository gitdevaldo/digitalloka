<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{ $title ?? 'DigitalLoka' }}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

    :root {
      --background: #FFFDF5;
      --foreground: #1E293B;
      --muted: #F1F5F9;
      --muted-foreground: #64748B;
      --accent: #8B5CF6;
      --accent-foreground: #FFFFFF;
      --secondary: #F472B6;
      --tertiary: #FBBF24;
      --quaternary: #34D399;
      --border: #E2E8F0;
      --input: #FFFFFF;
      --card: #FFFFFF;
      --shadow: #1E293B;
      --radius-sm: 8px;
      --radius-md: 16px;
      --radius-lg: 24px;
      --radius-xl: 32px;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      color: var(--foreground);
      font-family: "Plus Jakarta Sans", sans-serif;
      background-color: var(--background);
      background-image:
        radial-gradient(circle at 18px 18px, rgba(30, 41, 59, 0.09) 1.4px, transparent 1.6px),
        radial-gradient(circle at 80% -10%, rgba(139, 92, 246, 0.20) 0, transparent 35%),
        radial-gradient(circle at -10% 85%, rgba(251, 191, 36, 0.18) 0, transparent 38%);
      background-size: 26px 26px, auto, auto;
    }

    a {
      color: var(--foreground);
      text-decoration-thickness: 2px;
      text-decoration-color: rgba(139, 92, 246, 0.45);
      text-underline-offset: 2px;
      font-weight: 600;
    }

    h1,
    h2,
    h3 {
      margin: 0;
      font-family: "Outfit", sans-serif;
      letter-spacing: -0.015em;
      color: var(--foreground);
    }

    h1 {
      font-size: clamp(1.7rem, 3vw, 2.1rem);
      font-weight: 800;
    }

    h2 {
      font-size: 1.35rem;
      font-weight: 700;
    }

    .shell {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    header {
      position: sticky;
      top: 0;
      z-index: 20;
      border-bottom: 2px solid var(--foreground);
      background: rgba(255, 253, 245, 0.92);
      backdrop-filter: blur(6px);
    }

    .header-inner {
      max-width: 1160px;
      margin: 0 auto;
      padding: 14px 16px;
      display: flex;
      gap: 12px;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
    }

    .brand {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      border: 2px solid var(--foreground);
      border-radius: 999px;
      background: var(--accent);
      color: var(--accent-foreground);
      box-shadow: 4px 4px 0 0 var(--shadow);
      font-family: "Outfit", sans-serif;
      font-size: 1.02rem;
      font-weight: 800;
      text-decoration: none;
    }

    .brand b {
      color: var(--tertiary);
      font-weight: 800;
    }

    nav {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    nav a {
      display: inline-flex;
      align-items: center;
      border: 2px solid var(--foreground);
      border-radius: 999px;
      background: var(--card);
      padding: 8px 12px;
      text-decoration: none;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      box-shadow: 3px 3px 0 0 var(--shadow);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    nav a:hover {
      transform: translate(-2px, -2px);
      box-shadow: 5px 5px 0 0 var(--shadow);
    }

    main {
      width: min(1160px, 100% - 24px);
      margin: 20px auto 36px;
      display: grid;
      gap: 14px;
    }

    .card {
      background: var(--card);
      border: 2px solid var(--foreground);
      border-radius: var(--radius-xl);
      padding: 18px;
      box-shadow: 6px 6px 0 0 var(--shadow);
    }

    .panel {
      background: var(--muted);
      border: 2px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 14px;
    }

    .grid {
      display: grid;
      gap: 12px;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    }

    .muted {
      color: var(--muted-foreground);
      font-size: 0.95rem;
      font-weight: 500;
      margin-top: 8px;
    }

    .chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 4px 10px;
      border-radius: 999px;
      border: 2px solid var(--foreground);
      background: var(--muted);
      box-shadow: 2px 2px 0 0 var(--shadow);
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .chip::before {
      content: "";
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: var(--tertiary);
      border: 2px solid var(--foreground);
    }

    .list {
      margin: 0;
      padding-left: 18px;
      display: grid;
      gap: 8px;
    }

    .list li {
      font-weight: 600;
    }

    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      border: 2px solid var(--foreground);
      border-radius: var(--radius-md);
      overflow: hidden;
      box-shadow: 4px 4px 0 0 var(--shadow);
    }

    thead {
      background: var(--muted);
    }

    th,
    td {
      text-align: left;
      border-bottom: 2px solid var(--border);
      padding: 10px 12px;
      font-size: 0.92rem;
      vertical-align: top;
    }

    tbody tr:last-child td {
      border-bottom: 0;
    }

    .controls {
      display: grid;
      gap: 10px;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      margin-bottom: 12px;
    }

    select,
    input,
    textarea {
      width: 100%;
      border: 2px solid var(--border);
      border-radius: var(--radius-md);
      padding: 10px 12px;
      background: var(--input);
      color: var(--foreground);
      font-family: "Plus Jakarta Sans", sans-serif;
      font-weight: 600;
      box-shadow: 2px 2px 0 0 var(--border);
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    select:focus,
    input:focus,
    textarea:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 3px 3px 0 0 rgba(139, 92, 246, 0.35);
    }

    button,
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border: 2px solid var(--foreground);
      border-radius: 999px;
      background: var(--accent);
      color: var(--accent-foreground);
      padding: 9px 14px;
      font-family: "Plus Jakarta Sans", sans-serif;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 4px 4px 0 0 var(--shadow);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      text-decoration: none;
    }

    button:hover,
    .btn:hover {
      transform: translate(-2px, -2px);
      box-shadow: 6px 6px 0 0 var(--shadow);
    }

    button:active,
    .btn:active {
      transform: translate(1px, 1px);
      box-shadow: 2px 2px 0 0 var(--shadow);
    }

    pre {
      border: 2px solid var(--foreground);
      border-radius: var(--radius-md);
      background: #fff;
      box-shadow: 3px 3px 0 0 var(--shadow);
      padding: 12px;
      overflow-x: auto;
      font-size: 0.8rem;
      line-height: 1.45;
    }

    @media (max-width: 640px) {
      .header-inner {
        padding: 12px;
      }

      nav {
        width: 100%;
      }

      nav a {
        flex: 1 1 auto;
        justify-content: center;
      }

      main {
        width: calc(100% - 16px);
      }

      .card {
        padding: 14px;
      }
    }
  </style>
</head>
<body>
  <div class="shell">
    <header>
      <div class="header-inner">
        <a class="brand" href="/">Digital<b>Loka</b></a>
        <nav>
          <a href="/">Catalog</a>
          <a href="/dashboard">Dashboard</a>
          <a href="/dashboard/products">Products</a>
          <a href="/dashboard/orders">Orders</a>
          @if (request()->is('admin*'))
            <a href="/admin">Admin</a>
          @endif
        </nav>
      </div>
    </header>
    <main>
      @yield('content')
    </main>
  </div>
</body>
</html>
