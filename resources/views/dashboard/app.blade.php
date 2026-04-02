<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DigitalLoka — Dashboard</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    /* ============================================================
       TOKENS
    ============================================================ */
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

      --font-heading: 'Outfit', sans-serif;
      --font-body: 'Plus Jakarta Sans', sans-serif;

      --radius-sm: 8px;
      --radius-md: 16px;
      --radius-lg: 24px;
      --radius-xl: 32px;

      --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);

      --sidebar-w: 240px;
      --sidebar-w-collapsed: 64px;
      --topbar-h: 64px;
    }

    /* ============================================================
       RESET
    ============================================================ */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; }
    body {
      font-family: var(--font-body);
      background: var(--background);
      color: var(--foreground);
      overflow: hidden;
    }

    /* ============================================================
       DOT BACKGROUND
    ============================================================ */
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      background-image: radial-gradient(circle, rgba(30,41,59,0.12) 1px, transparent 1px);
      background-size: 22px 22px;
    }

    /* ============================================================
       TOPBAR
    ============================================================ */
    .topbar {
      position: fixed;
      top: 0; left: 0; right: 0;
      height: var(--topbar-h);
      background: var(--card);
      border-bottom: 2px solid var(--foreground);
      box-shadow: 0 4px 0 var(--shadow);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px 0 0;
      z-index: 200;
    }

    /* Logo zone — matches sidebar width */
    .topbar-brand {
      width: var(--sidebar-w);
      flex-shrink: 0;
      display: flex;
      align-items: center;
      padding: 0 16px;
      gap: 10px;
      transition: width 0.28s var(--ease-bounce);
      overflow: hidden;
    }
    .sidebar.collapsed ~ * .topbar-brand,
    .app-layout.collapsed .topbar-brand { width: var(--sidebar-w-collapsed); }

    .brand-logo {
      display: flex;
      align-items: center;
      text-decoration: none;
      font-family: var(--font-heading);
      font-weight: 800;
      font-size: 1.1rem;
      letter-spacing: -0.03em;
      flex-shrink: 0;
    }
    .brand-logo .box {
      background: var(--accent);
      color: #fff;
      border: 2px solid var(--foreground);
      box-shadow: 3px 3px 0 var(--shadow);
      padding: 4px 10px;
      border-radius: var(--radius-sm);
      white-space: nowrap;
    }
    .brand-logo .loka { color: var(--tertiary); }

    .brand-wordmark {
      font-family: var(--font-heading);
      font-weight: 800;
      font-size: 1rem;
      white-space: nowrap;
      transition: opacity 0.15s, width 0.28s;
      overflow: hidden;
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    /* Search */
    .topbar-search {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--input);
      border: 2px solid var(--border);
      border-radius: 9999px;
      padding: 6px 14px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .topbar-search:focus-within {
      border-color: var(--accent);
      box-shadow: 3px 3px 0 var(--accent);
    }
    .topbar-search input {
      border: none; outline: none;
      font-family: var(--font-body);
      font-size: 0.8rem; font-weight: 500;
      background: transparent; width: 170px;
      color: var(--foreground);
    }
    .topbar-search input::placeholder { color: var(--muted-foreground); }

    /* Icon button */
    .icon-btn {
      width: 36px; height: 36px;
      border: 2px solid var(--border);
      border-radius: 50%;
      background: var(--card);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      transition: all 0.15s var(--ease-bounce);
      color: var(--muted-foreground);
      position: relative;
    }
    .icon-btn:hover {
      border-color: var(--foreground);
      box-shadow: 2px 2px 0 var(--shadow);
      color: var(--foreground);
      transform: translate(-1px,-1px);
    }
    .icon-btn .notif-dot {
      position: absolute;
      top: 2px; right: 2px;
      width: 8px; height: 8px;
      background: var(--secondary);
      border: 2px solid var(--card);
      border-radius: 50%;
    }

    /* Avatar */
    .avatar {
      width: 36px; height: 36px;
      border-radius: 50%;
      border: 2px solid var(--foreground);
      box-shadow: 2px 2px 0 var(--shadow);
      background: linear-gradient(135deg, var(--accent), var(--secondary));
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-heading);
      font-weight: 800; font-size: 0.85rem;
      color: white;
      cursor: pointer;
      transition: all 0.15s var(--ease-bounce);
    }
    .avatar:hover { transform: translate(-1px,-1px); box-shadow: 3px 3px 0 var(--shadow); }

    /* ============================================================
       APP LAYOUT
    ============================================================ */
    .app-layout {
      display: flex;
      height: 100vh;
      padding-top: var(--topbar-h);
      position: relative;
      z-index: 1;
    }

    /* ============================================================
       SIDEBAR
    ============================================================ */
    .sidebar {
      width: var(--sidebar-w);
      flex-shrink: 0;
      height: calc(100vh - var(--topbar-h));
      position: sticky;
      top: var(--topbar-h);
      border-right: 2px solid var(--foreground);
      background: var(--card);
      display: flex;
      flex-direction: column;
      transition: width 0.28s var(--ease-bounce);
      overflow: hidden;
      z-index: 100;
    }
    .sidebar.collapsed { width: var(--sidebar-w-collapsed); }

    /* Toggle button */
    .sidebar-toggle {
      position: absolute;
      top: 16px;
      right: -16px;
      width: 28px; height: 28px;
      background: var(--card);
      border: 2px solid var(--foreground);
      border-radius: 50%;
      box-shadow: 2px 2px 0 var(--shadow);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      z-index: 110;
      transition: all 0.2s var(--ease-bounce);
      color: var(--foreground);
    }
    .sidebar-toggle:hover {
      background: var(--accent);
      color: white;
      border-color: var(--accent);
      transform: scale(1.12);
    }
    .sidebar-toggle svg {
      transition: transform 0.28s var(--ease-bounce);
    }
    .sidebar.collapsed .sidebar-toggle svg { transform: rotate(180deg); }

    /* Nav scroll area */
    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 16px 10px 10px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .sidebar-nav::-webkit-scrollbar { width: 3px; }
    .sidebar-nav::-webkit-scrollbar-thumb { background: var(--border); border-radius: 999px; }

    /* Section label */
    .nav-section-label {
      font-size: 0.62rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--muted-foreground);
      padding: 10px 8px 4px;
      white-space: nowrap;
      overflow: hidden;
      transition: opacity 0.15s;
    }
    .sidebar.collapsed .nav-section-label { opacity: 0; }

    /* Nav item */
    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 10px;
      border-radius: var(--radius-md);
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.15s var(--ease-bounce);
      white-space: nowrap;
      overflow: hidden;
      min-height: 42px;
      position: relative;
      text-decoration: none;
      color: var(--foreground);
    }
    .nav-item:hover {
      background: var(--muted);
      border-color: var(--border);
    }
    .nav-item.active {
      background: var(--accent);
      color: white;
      border-color: var(--foreground);
      box-shadow: 3px 3px 0 var(--shadow);
      transform: translate(-1px,-1px);
    }
    .nav-item.active .nav-icon { color: white; }
    .nav-item.active .nav-label { color: white; }

    /* Submenu child active */
    .nav-item.sub-active {
      background: var(--muted);
      border-color: var(--border);
    }
    .nav-item.sub-active .nav-label { color: var(--accent); font-weight: 700; }

    .nav-icon {
      width: 20px; height: 20px;
      flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      color: var(--muted-foreground);
      transition: color 0.15s;
    }
    .nav-item:hover .nav-icon { color: var(--foreground); }

    .nav-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--foreground);
      flex: 1;
      transition: opacity 0.15s;
      overflow: hidden;
    }
    .sidebar.collapsed .nav-label { opacity: 0; width: 0; }

    /* Chevron for submenu */
    .nav-chevron {
      margin-left: auto;
      color: var(--muted-foreground);
      transition: transform 0.2s var(--ease-bounce), opacity 0.15s;
      flex-shrink: 0;
    }
    .nav-item.open .nav-chevron { transform: rotate(90deg); }
    .sidebar.collapsed .nav-chevron { opacity: 0; width: 0; }

    /* Submenu */
    .submenu {
      overflow: hidden;
      max-height: 0;
      transition: max-height 0.3s ease;
    }
    .submenu.open { max-height: 200px; }
    .sidebar.collapsed .submenu { max-height: 0 !important; }

    .submenu-inner { padding: 3px 0 3px 8px; display: flex; flex-direction: column; gap: 2px; }

    .nav-sub-item {
      display: flex; align-items: center; gap: 8px;
      padding: 7px 10px 7px 18px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.15s;
      white-space: nowrap;
      position: relative;
      text-decoration: none;
      color: var(--muted-foreground);
      font-size: 0.82rem;
      font-weight: 600;
    }
    .nav-sub-item::before {
      content: '';
      position: absolute;
      left: 6px;
      top: 50%; transform: translateY(-50%);
      width: 6px; height: 6px;
      border-radius: 50%;
      background: var(--border);
      transition: background 0.15s;
    }
    .nav-sub-item:hover { background: var(--muted); color: var(--foreground); }
    .nav-sub-item:hover::before { background: var(--accent); }
    .nav-sub-item.active {
      background: rgba(139,92,246,0.1);
      color: var(--accent);
      border-color: rgba(139,92,246,0.2);
    }
    .nav-sub-item.active::before { background: var(--accent); }
    .sidebar.collapsed .nav-sub-item { opacity: 0; pointer-events: none; }

    /* Tooltip on collapsed */
    .nav-item[data-tip]:hover::after {
      content: attr(data-tip);
      position: absolute;
      left: calc(100% + 10px);
      top: 50%; transform: translateY(-50%);
      background: var(--foreground);
      color: white;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 5px 10px;
      border-radius: var(--radius-sm);
      white-space: nowrap;
      pointer-events: none;
      z-index: 999;
      box-shadow: 2px 2px 0 rgba(0,0,0,0.2);
    }

    /* ===================== BOTTOM STICKY NAV ===================== */
    .sidebar-bottom {
      border-top: 2px solid var(--border);
      padding: 10px 10px 14px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex-shrink: 0;
    }

    /* ============================================================
       MAIN CONTENT
    ============================================================ */
    .main {
      flex: 1;
      height: calc(100vh - var(--topbar-h));
      overflow-y: auto;
      overflow-x: hidden;
      padding: 32px;
      min-width: 0;
    }
    .main::-webkit-scrollbar { width: 4px; }
    .main::-webkit-scrollbar-thumb { background: var(--border); border-radius: 999px; }

    /* ============================================================
       PAGE VIEWS
    ============================================================ */
    .page-view { display: none; animation: fadeUp 0.3s var(--ease-bounce); }
    .page-view.active { display: block; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* ============================================================
       SHARED COMPONENTS
    ============================================================ */

    /* Page header */
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 28px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .page-title {
      font-family: var(--font-heading);
      font-size: 1.8rem;
      font-weight: 900;
      color: var(--foreground);
      line-height: 1.15;
    }
    .page-subtitle {
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--muted-foreground);
      margin-top: 4px;
    }

    /* Button */
    .btn {
      font-family: var(--font-body);
      font-weight: 700;
      font-size: 0.825rem;
      border: 2px solid var(--foreground);
      border-radius: 9999px;
      padding: 8px 18px;
      cursor: pointer;
      transition: transform 0.15s var(--ease-bounce), box-shadow 0.15s var(--ease-bounce);
      box-shadow: 3px 3px 0 var(--shadow);
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--card);
      color: var(--foreground);
      text-decoration: none;
    }
    .btn:hover { transform: translate(-2px,-2px); box-shadow: 5px 5px 0 var(--shadow); }
    .btn:active { transform: translate(1px,1px); box-shadow: 1px 1px 0 var(--shadow); }
    .btn-accent { background: var(--accent); color: white; border-color: var(--foreground); }
    .btn-sm { padding: 5px 12px; font-size: 0.75rem; box-shadow: 2px 2px 0 var(--shadow); }
    .btn-sm:hover { box-shadow: 3px 3px 0 var(--shadow); }
    .btn-danger { background: var(--secondary); color: white; }
    .btn-success { background: var(--quaternary); color: var(--foreground); }
    .btn-warning { background: var(--tertiary); color: var(--foreground); }

    /* Stats row */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }

    .stat-card {
      background: var(--card);
      border: 2px solid var(--foreground);
      border-radius: var(--radius-xl);
      padding: 20px;
      box-shadow: 4px 4px 0 var(--shadow);
      position: relative;
      overflow: hidden;
      transition: transform 0.15s var(--ease-bounce), box-shadow 0.15s var(--ease-bounce);
    }
    .stat-card:hover { transform: translate(-2px,-2px); box-shadow: 6px 6px 0 var(--shadow); }

    .stat-card::before {
      content: '';
      position: absolute;
      top: -12px; right: -12px;
      width: 48px; height: 48px;
      border-radius: 50%;
      border: 2px solid currentColor;
      opacity: 0.15;
    }

    .stat-icon {
      width: 36px; height: 36px;
      border-radius: var(--radius-sm);
      border: 2px solid var(--foreground);
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 12px;
      font-size: 1rem;
    }
    .stat-label {
      font-size: 0.7rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.08em;
      color: var(--muted-foreground);
      margin-bottom: 4px;
    }
    .stat-value {
      font-family: var(--font-heading);
      font-size: 1.8rem; font-weight: 900;
      color: var(--foreground);
      line-height: 1;
    }
    .stat-sub {
      font-size: 0.72rem; font-weight: 600;
      color: var(--muted-foreground);
      margin-top: 4px;
    }

    /* Card panel */
    .panel {
      background: var(--card);
      border: 2px solid var(--foreground);
      border-radius: var(--radius-xl);
      box-shadow: 4px 4px 0 var(--shadow);
      overflow: hidden;
      margin-bottom: 20px;
    }
    .panel-header {
      padding: 16px 20px;
      border-bottom: 2px solid var(--border);
      display: flex; align-items: center; justify-content: space-between;
    }
    .panel-title {
      font-family: var(--font-heading);
      font-size: 1rem; font-weight: 800;
    }
    .panel-body { padding: 20px; }

    /* Table */
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th {
      text-align: left;
      font-size: 0.65rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.09em;
      color: var(--muted-foreground);
      padding: 8px 12px;
      border-bottom: 2px solid var(--border);
    }
    .data-table td {
      padding: 12px;
      font-size: 0.82rem; font-weight: 500;
      border-bottom: 1px solid var(--border);
      vertical-align: middle;
    }
    .data-table tr:last-child td { border-bottom: none; }
    .data-table tr:hover td { background: var(--muted); }

    /* Status badge */
    .status-badge {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 3px 9px;
      border: 2px solid var(--foreground);
      border-radius: 9999px;
      font-size: 0.65rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.05em;
      box-shadow: 2px 2px 0 var(--shadow);
    }
    .status-badge .dot {
      width: 6px; height: 6px; border-radius: 50%;
    }
    .badge-running { background: var(--quaternary); }
    .badge-running .dot { background: #065f46; }
    .badge-stopped { background: var(--secondary); color: white; }
    .badge-stopped .dot { background: #9f1239; }
    .badge-starting { background: var(--tertiary); }
    .badge-starting .dot { background: #78350f; }
    .badge-neutral { background: var(--muted); color: var(--muted-foreground); border-color: var(--border); box-shadow: none; }
    .badge-neutral .dot { background: var(--muted-foreground); }
    .badge-accent { background: rgba(139,92,246,0.12); color: var(--accent); border-color: rgba(139,92,246,0.3); box-shadow: none; }
    .badge-active { background: var(--quaternary); }
    .badge-active .dot { background: #065f46; }

    /* Product type tag */
    .type-tag {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 2px 8px;
      background: var(--muted);
      border: 1.5px solid var(--border);
      border-radius: 9999px;
      font-size: 0.68rem; font-weight: 700;
      color: var(--muted-foreground);
    }

    /* Action buttons group */
    .action-group { display: flex; gap: 6px; flex-wrap: wrap; }

    /* Droplet card */
    .droplet-card {
      background: var(--card);
      border: 2px solid var(--foreground);
      border-radius: var(--radius-xl);
      box-shadow: 4px 4px 0 var(--shadow);
      padding: 20px;
      transition: transform 0.15s var(--ease-bounce), box-shadow 0.15s var(--ease-bounce);
      position: relative;
    }
    .droplet-card:hover { transform: translate(-2px,-2px); box-shadow: 6px 6px 0 var(--shadow); }

    .droplet-icon {
      width: 44px; height: 44px;
      background: linear-gradient(135deg, #EDE9FE, #DDD6FE);
      border: 2px solid var(--foreground);
      border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 12px;
      box-shadow: 2px 2px 0 var(--shadow);
    }

    .droplet-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }

    .droplet-meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin: 12px 0;
    }
    .meta-item { display: flex; flex-direction: column; gap: 2px; }
    .meta-key {
      font-size: 0.65rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.08em;
      color: var(--muted-foreground);
    }
    .meta-val {
      font-size: 0.8rem; font-weight: 700; color: var(--foreground);
    }
    .meta-val.mono { font-family: monospace; font-size: 0.78rem; }

    .droplet-actions {
      display: flex; gap: 6px; flex-wrap: wrap;
      padding-top: 12px;
      border-top: 2px solid var(--border);
      margin-top: 12px;
    }

    /* Empty state */
    .empty-state {
      text-align: center;
      padding: 56px 32px;
      background: var(--muted);
      border: 2px dashed var(--border);
      border-radius: var(--radius-xl);
    }
    .empty-icon { font-size: 2.5rem; margin-bottom: 12px; }
    .empty-title {
      font-family: var(--font-heading);
      font-size: 1.1rem; font-weight: 800;
      margin-bottom: 6px;
    }
    .empty-desc { font-size: 0.83rem; font-weight: 500; color: var(--muted-foreground); }

    /* Order row */
    .order-status-col { width: 110px; }
    .order-amount {
      font-family: var(--font-heading);
      font-weight: 800; font-size: 0.95rem;
    }
    .order-link {
      color: var(--accent); text-decoration: none;
      font-weight: 700; font-size: 0.78rem;
    }
    .order-link:hover { text-decoration: underline; }

    /* Health bars */
    .health-bars { display: flex; gap: 6px; margin-top: 8px; }
    .hbar {
      height: 6px; border-radius: 999px; flex: 1;
    }
    .hbar-green { background: var(--quaternary); }
    .hbar-pink  { background: var(--secondary); }
    .hbar-amber { background: var(--tertiary); }

    /* Notification dot on nav */
    .nav-dot {
      width: 7px; height: 7px;
      border-radius: 50%;
      background: var(--secondary);
      border: 1.5px solid white;
      flex-shrink: 0;
      margin-left: auto;
    }
    .sidebar.collapsed .nav-dot { margin-left: 0; }

    /* ============================================================
       DECORATIVE SHAPES
    ============================================================ */
    .deco-circle {
      position: absolute;
      border-radius: 50%;
      border: 2px solid;
      pointer-events: none;
      opacity: 0.12;
    }
    .deco-diamond {
      position: absolute;
      width: 16px; height: 16px;
      border: 2px solid var(--accent);
      transform: rotate(45deg);
      pointer-events: none;
      opacity: 0.2;
    }

    /* ============================================================
       RESPONSIVE
    ============================================================ */
    @media (max-width: 768px) {
      .sidebar { position: fixed; top: var(--topbar-h); left: 0; bottom: 0; z-index: 150; }
      .main { padding: 20px; }
      .stats-row { grid-template-columns: 1fr 1fr; }
      .topbar-search { display: none; }
    }

    /* ============================================================
       ANIMATIONS
    ============================================================ */
    @keyframes popIn {
      from { opacity: 0; transform: scale(0.9) translateY(6px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .stat-card { animation: popIn 0.3s var(--ease-bounce) both; }
    .stat-card:nth-child(1) { animation-delay: 0.04s; }
    .stat-card:nth-child(2) { animation-delay: 0.08s; }
    .stat-card:nth-child(3) { animation-delay: 0.12s; }
    .stat-card:nth-child(4) { animation-delay: 0.16s; }
    .stat-card:nth-child(5) { animation-delay: 0.20s; }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation: none !important; transition: none !important; }
    }
  </style>
</head>
<body>
@php
  $initialPageValue = $initialPage ?? 'overview';
@endphp

<!-- ============================================================
     TOPBAR
============================================================ -->
<x-layout.topbar variant="dashboard" />

<!-- ============================================================
     APP LAYOUT
============================================================ -->
<div class="app-layout" id="appLayout">

  <!-- ============================================================
       SIDEBAR
  ============================================================ -->
  <x-layout.sidebar-shell id="sidebar" toggle-id="sidebarToggle" toggle-title="Toggle sidebar" toggle-size="12">

    <!-- Main nav -->
    <nav class="sidebar-nav" id="sidebarNav">

      <div class="nav-section-label">Main</div>

      <!-- Overview -->
      <div class="nav-item active" data-page="overview" data-tip="Overview" onclick="navigate('overview', this)">
        <span class="nav-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
        </span>
        <span class="nav-label">Overview</span>
      </div>

      <!-- Products (expandable) -->
      <div class="nav-item" id="navProducts" data-tip="Products" onclick="toggleSubmenu('navProducts', 'submenuProducts')">
        <span class="nav-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
        </span>
        <span class="nav-label">Products</span>
        <span class="nav-chevron">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </span>
      </div>
      <div class="submenu" id="submenuProducts">
        <div class="submenu-inner">
          <div class="nav-sub-item" data-page="products-all" onclick="navigate('products-all', this)">All Products</div>
          <div class="nav-sub-item" data-page="products-droplets" onclick="navigate('products-droplets', this)">VPS Droplets</div>
          <div class="nav-sub-item" data-page="products-digital" onclick="navigate('products-digital', this)">Digital Products</div>
          <div class="nav-sub-item" data-page="products-access" onclick="navigate('products-access', this)">Product Access</div>
        </div>
      </div>

      <!-- Orders -->
      <div class="nav-item" data-page="orders" data-tip="Orders" onclick="navigate('orders', this)">
        <span class="nav-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        </span>
        <span class="nav-label">Orders</span>
        <div class="nav-dot"></div>
      </div>

    </nav>

    <!-- ===================== BOTTOM STICKY NAV ===================== -->
    <div class="sidebar-bottom">
      <div class="nav-item" data-page="account" data-tip="Account" onclick="navigate('account', this)">
        <span class="nav-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </span>
        <span class="nav-label">Account</span>
      </div>
      <div class="nav-item" data-page="support" data-tip="Support" onclick="navigate('support', this)">
        <span class="nav-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </span>
        <span class="nav-label">Support</span>
      </div>
      <div class="nav-item" data-tip="Logout" onclick="handleLogout('/login?next=/dashboard')">
        <span class="nav-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </span>
        <span class="nav-label">Logout</span>
      </div>
    </div>

  </x-layout.sidebar-shell>

  <!-- ============================================================
       MAIN CONTENT
  ============================================================ -->
  <main class="main">

    <!-- ==================== OVERVIEW ==================== -->
    <div class="page-view active" id="page-overview">
      <x-layout.page-header
        variant="dashboard"
        title="Good morning, Aldo 👋"
        subtitle="Here's what's happening with your products today."
      >
        <x-slot:actions>
          <x-ui.button variant="accent" onclick="navigate('products-all', document.querySelector('[data-page=products-all]'))">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Product
          </x-ui.button>
        </x-slot:actions>
      </x-layout.page-header>

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-card" style="--c:var(--accent)">
          <div class="stat-icon" style="background:rgba(139,92,246,0.12);color:var(--accent);">📦</div>
          <div class="stat-label">Total Products</div>
          <div class="stat-value">8</div>
          <div class="stat-sub">across all types</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:rgba(139,92,246,0.12);">🖥️</div>
          <div class="stat-label">VPS Droplets</div>
          <div class="stat-value">3</div>
          <div class="stat-sub">2 running · 1 stopped</div>
          <div class="health-bars" style="margin-top:10px;">
            <div class="hbar hbar-green" style="flex:2"></div>
            <div class="hbar hbar-pink" style="flex:1"></div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:rgba(52,211,153,0.15);">✅</div>
          <div class="stat-label">Active Entitlements</div>
          <div class="stat-value">7</div>
          <div class="stat-sub">1 expiring in 7 days</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:rgba(251,191,36,0.15);">🛒</div>
          <div class="stat-label">Recent Orders</div>
          <div class="stat-value">12</div>
          <div class="stat-sub">2 pending fulfillment</div>
        </div>
      </div>

      <!-- Two columns -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">

        <!-- VPS Health -->
        <x-ui.panel variant="dashboard" title="VPS Health Summary">
          <x-slot:actions>
            <x-ui.button variant="sm" onclick="navigate('products-droplets', document.querySelector('[data-page=products-droplets]'))">View all</x-ui.button>
          </x-slot:actions>
          <x-ui.table-shell variant="dashboard">
              <thead><tr><th>Droplet</th><th>Status</th><th>IP</th></tr></thead>
              <tbody>
                <tr>
                  <td><strong>koncoweb-prod</strong></td>
                  <td><x-ui.status-badge variant="running" label="Running" /></td>
                  <td class="meta-val mono">192.168.1.10</td>
                </tr>
                <tr>
                  <td><strong>api-staging</strong></td>
                  <td><x-ui.status-badge variant="running" label="Running" /></td>
                  <td class="meta-val mono">192.168.1.11</td>
                </tr>
                <tr>
                  <td><strong>dev-sandbox</strong></td>
                  <td><x-ui.status-badge variant="stopped" label="Stopped" /></td>
                  <td class="meta-val mono">—</td>
                </tr>
              </tbody>
          </x-ui.table-shell>
        </x-ui.panel>

        <!-- Recent Orders -->
        <x-ui.panel variant="dashboard" title="Recent Orders">
          <x-slot:actions>
            <x-ui.button variant="sm" onclick="navigate('orders', document.querySelector('[data-page=orders]'))">View all</x-ui.button>
          </x-slot:actions>
          <x-ui.table-shell variant="dashboard">
              <thead><tr><th>Order</th><th>Status</th><th>Amount</th></tr></thead>
              <tbody>
                <tr>
                  <td><div style="font-weight:700;font-size:0.82rem;">#ORD-0042</div><div style="font-size:0.72rem;color:var(--muted-foreground);">NovaDash UI Kit</div></td>
                  <td><x-ui.status-badge variant="active" label="Active" /></td>
                  <td class="order-amount">$49</td>
                </tr>
                <tr>
                  <td><div style="font-weight:700;font-size:0.82rem;">#ORD-0041</div><div style="font-size:0.72rem;color:var(--muted-foreground);">VPS — SGP1 2vCPU</div></td>
                  <td><x-ui.status-badge variant="running" label="Active" /></td>
                  <td class="order-amount">$24/mo</td>
                </tr>
                <tr>
                  <td><div style="font-weight:700;font-size:0.82rem;">#ORD-0040</div><div style="font-size:0.72rem;color:var(--muted-foreground);">AI Prompt Course</div></td>
                  <td><x-ui.status-badge variant="starting" label="Pending" /></td>
                  <td class="order-amount">$99</td>
                </tr>
              </tbody>
          </x-ui.table-shell>
        </x-ui.panel>

      </div>

      <!-- Expiring entitlements -->
      <x-ui.panel variant="dashboard" title="⚠️ Expiring / Blocked Entitlements">
        <x-ui.table-shell variant="dashboard">
            <thead><tr><th>Product</th><th>Type</th><th>Status</th><th>Expires</th><th></th></tr></thead>
            <tbody>
              <tr>
                <td><strong>DataViz Pro UI Kit</strong></td>
                <td><span class="type-tag">ui-kit</span></td>
                <td><span class="status-badge badge-starting"><span class="dot"></span>Expiring</span></td>
                <td style="font-weight:700;font-size:0.82rem;color:var(--secondary);">7 days</td>
                <td><button class="btn btn-sm btn-accent">Renew</button></td>
              </tr>
            </tbody>
        </x-ui.table-shell>
      </x-ui.panel>
    </div>

    <!-- ==================== PRODUCTS ALL ==================== -->
    <div class="page-view" id="page-products-all">
      <x-layout.page-header variant="dashboard" title="Products" subtitle="All your owned and assigned products.">
        <x-slot:actions>
          <div style="display:flex;gap:8px;">
          <select style="border:2px solid var(--border);border-radius:var(--radius-sm);padding:7px 10px;font-family:var(--font-body);font-size:0.8rem;font-weight:600;background:var(--card);cursor:pointer;">
            <option>All Types</option><option>VPS Droplet</option><option>Digital</option>
          </select>
          <select style="border:2px solid var(--border);border-radius:var(--radius-sm);padding:7px 10px;font-family:var(--font-body);font-size:0.8rem;font-weight:600;background:var(--card);cursor:pointer;">
            <option>All Statuses</option><option>Active</option><option>Expiring</option><option>Blocked</option>
          </select>
          </div>
        </x-slot:actions>
      </x-layout.page-header>

      <x-ui.panel variant="dashboard">
        <x-ui.table-shell variant="dashboard">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Type</th>
                <th>Access Status</th>
                <th>Purchased</th>
                <th>Resources</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>koncoweb VPS — SGP1</strong></td>
                <td><span class="type-tag">🖥️ vps_droplet</span></td>
                <td><span class="status-badge badge-active"><span class="dot"></span>Active</span></td>
                <td style="font-size:0.8rem;color:var(--muted-foreground);">Mar 1, 2026</td>
                <td><span class="type-tag">2 droplets</span></td>
                <td><button class="btn btn-sm" onclick="navigate('products-droplets', document.querySelector('[data-page=products-droplets]'))">Manage →</button></td>
              </tr>
              <tr>
                <td><strong>NovaDash UI Kit</strong></td>
                <td><span class="type-tag">🎨 digital</span></td>
                <td><span class="status-badge badge-active"><span class="dot"></span>Active</span></td>
                <td style="font-size:0.8rem;color:var(--muted-foreground);">Feb 14, 2026</td>
                <td><span class="type-tag">1 download</span></td>
                <td><button class="btn btn-sm">Download</button></td>
              </tr>
              <tr>
                <td><strong>AI Prompt Engineering Course</strong></td>
                <td><span class="type-tag">🎓 course</span></td>
                <td><span class="status-badge badge-starting"><span class="dot"></span>Pending</span></td>
                <td style="font-size:0.8rem;color:var(--muted-foreground);">Apr 1, 2026</td>
                <td>—</td>
                <td><button class="btn btn-sm" disabled style="opacity:0.4;cursor:not-allowed;">Pending</button></td>
              </tr>
              <tr>
                <td><strong>DataViz Pro UI Kit</strong></td>
                <td><span class="type-tag">🎨 digital</span></td>
                <td><span class="status-badge badge-starting"><span class="dot"></span>Expiring</span></td>
                <td style="font-size:0.8rem;color:var(--muted-foreground);">Jan 10, 2026</td>
                <td><span class="type-tag">1 download</span></td>
                <td><button class="btn btn-sm btn-warning">Renew</button></td>
              </tr>
              <tr>
                <td><strong>Indie Maker Notion Pack</strong></td>
                <td><span class="type-tag">📄 template</span></td>
                <td><span class="status-badge badge-active"><span class="dot"></span>Active</span></td>
                <td style="font-size:0.8rem;color:var(--muted-foreground);">Dec 5, 2025</td>
                <td><span class="type-tag">1 download</span></td>
                <td><button class="btn btn-sm">Download</button></td>
              </tr>
            </tbody>
        </x-ui.table-shell>
      </x-ui.panel>
    </div>

    <!-- ==================== PRODUCTS > VPS DROPLETS ==================== -->
    <div class="page-view" id="page-products-droplets">
      <div class="page-header">
        <div>
          <div class="page-title">VPS Droplets</div>
          <div class="page-subtitle">/dashboard/products/droplets — manage your server resources.</div>
        </div>
        <button class="btn btn-sm" onclick="refreshAll()">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          Refresh All
        </button>
      </div>

      <div class="droplet-grid" id="dropletGrid">

        <!-- Droplet 1 -->
        <div class="droplet-card" id="droplet-1">
          <div class="deco-diamond" style="top:12px;right:12px;"></div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
            <div class="droplet-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
            </div>
            <span class="status-badge badge-running"><span class="dot"></span>Running</span>
          </div>
          <div style="font-family:var(--font-heading);font-size:1rem;font-weight:800;margin-bottom:2px;">koncoweb-prod</div>
          <div style="font-size:0.75rem;color:var(--muted-foreground);margin-bottom:4px;">Product: koncoweb VPS — SGP1</div>
          <div class="droplet-meta">
            <div class="meta-item"><div class="meta-key">Region</div><div class="meta-val">SGP1 🇸🇬</div></div>
            <div class="meta-item"><div class="meta-key">Plan</div><div class="meta-val">2vCPU / 4GB</div></div>
            <div class="meta-item"><div class="meta-key">Public IP</div><div class="meta-val mono">192.168.1.10</div></div>
            <div class="meta-item"><div class="meta-key">Last Action</div><div class="meta-val">2h ago</div></div>
          </div>
          <div class="droplet-actions">
            <button class="btn btn-sm btn-danger" onclick="dropletAction(1,'off')">Power Off</button>
            <button class="btn btn-sm btn-warning" onclick="dropletAction(1,'reboot')">Reboot</button>
            <button class="btn btn-sm" onclick="dropletAction(1,'refresh')">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
              Refresh
            </button>
          </div>
        </div>

        <!-- Droplet 2 -->
        <div class="droplet-card" id="droplet-2">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
            <div class="droplet-icon" style="background:linear-gradient(135deg,#D1FAE5,#A7F3D0)">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--quaternary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
            </div>
            <span class="status-badge badge-running"><span class="dot"></span>Running</span>
          </div>
          <div style="font-family:var(--font-heading);font-size:1rem;font-weight:800;margin-bottom:2px;">api-staging</div>
          <div style="font-size:0.75rem;color:var(--muted-foreground);margin-bottom:4px;">Product: koncoweb VPS — SGP1</div>
          <div class="droplet-meta">
            <div class="meta-item"><div class="meta-key">Region</div><div class="meta-val">SGP1 🇸🇬</div></div>
            <div class="meta-item"><div class="meta-key">Plan</div><div class="meta-val">1vCPU / 2GB</div></div>
            <div class="meta-item"><div class="meta-key">Public IP</div><div class="meta-val mono">192.168.1.11</div></div>
            <div class="meta-item"><div class="meta-key">Last Action</div><div class="meta-val">5h ago</div></div>
          </div>
          <div class="droplet-actions">
            <button class="btn btn-sm btn-danger" onclick="dropletAction(2,'off')">Power Off</button>
            <button class="btn btn-sm btn-warning" onclick="dropletAction(2,'reboot')">Reboot</button>
            <button class="btn btn-sm" onclick="dropletAction(2,'refresh')">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
              Refresh
            </button>
          </div>
        </div>

        <!-- Droplet 3 — stopped -->
        <div class="droplet-card" id="droplet-3">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
            <div class="droplet-icon" style="background:linear-gradient(135deg,#FCE7F3,#FBCFE8)">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
            </div>
            <span class="status-badge badge-stopped"><span class="dot"></span>Stopped</span>
          </div>
          <div style="font-family:var(--font-heading);font-size:1rem;font-weight:800;margin-bottom:2px;">dev-sandbox</div>
          <div style="font-size:0.75rem;color:var(--muted-foreground);margin-bottom:4px;">Product: koncoweb VPS — SGP1</div>
          <div class="droplet-meta">
            <div class="meta-item"><div class="meta-key">Region</div><div class="meta-val">SGP1 🇸🇬</div></div>
            <div class="meta-item"><div class="meta-key">Plan</div><div class="meta-val">1vCPU / 1GB</div></div>
            <div class="meta-item"><div class="meta-key">Public IP</div><div class="meta-val mono" style="color:var(--muted-foreground);">—</div></div>
            <div class="meta-item"><div class="meta-key">Last Action</div><div class="meta-val">2d ago</div></div>
          </div>
          <div class="droplet-actions">
            <button class="btn btn-sm btn-success" onclick="dropletAction(3,'on')">Power On</button>
            <button class="btn btn-sm" onclick="dropletAction(3,'refresh')">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
              Refresh
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- ==================== PRODUCTS > DIGITAL ==================== -->
    <div class="page-view" id="page-products-digital">
      <x-layout.page-header variant="dashboard" title="Digital Products" subtitle="Your downloadable files, templates, and kits." />
      <x-ui.panel variant="dashboard">
        <x-ui.table-shell variant="dashboard">
            <thead><tr><th>Product</th><th>Format</th><th>Status</th><th>Purchased</th><th></th></tr></thead>
            <tbody>
              <tr>
                <td><strong>NovaDash UI Kit</strong></td>
                <td><span class="type-tag">Figma + ZIP</span></td>
                <td><span class="status-badge badge-active"><span class="dot"></span>Active</span></td>
                <td style="font-size:0.8rem;color:var(--muted-foreground);">Feb 14, 2026</td>
                <td><button class="btn btn-sm btn-accent">⬇ Download</button></td>
              </tr>
              <tr>
                <td><strong>DataViz Pro UI Kit</strong></td>
                <td><span class="type-tag">Figma</span></td>
                <td><span class="status-badge badge-starting"><span class="dot"></span>Expiring</span></td>
                <td style="font-size:0.8rem;color:var(--muted-foreground);">Jan 10, 2026</td>
                <td><button class="btn btn-sm btn-warning">Renew</button></td>
              </tr>
              <tr>
                <td><strong>Indie Maker Notion Pack</strong></td>
                <td><span class="type-tag">Notion</span></td>
                <td><span class="status-badge badge-active"><span class="dot"></span>Active</span></td>
                <td style="font-size:0.8rem;color:var(--muted-foreground);">Dec 5, 2025</td>
                <td><button class="btn btn-sm btn-accent">⬇ Download</button></td>
              </tr>
            </tbody>
        </x-ui.table-shell>
      </x-ui.panel>
    </div>

    <!-- ==================== PRODUCTS > ACCESS ==================== -->
    <div class="page-view" id="page-products-access">
      <x-layout.page-header variant="dashboard" title="Product Access" subtitle="Manage licenses and entitlements for your products." />
      <x-ui.panel variant="dashboard">
        <x-ui.table-shell variant="dashboard">
            <thead><tr><th>Product</th><th>License Key</th><th>Entitlement</th><th>Expires</th><th></th></tr></thead>
            <tbody>
              <tr>
                <td><strong>NovaDash UI Kit</strong></td>
                <td class="meta-val mono" style="font-size:0.72rem;">NOVA-XXXX-XXXX-1A2B</td>
                <td><span class="status-badge badge-active"><span class="dot"></span>Active</span></td>
                <td style="font-size:0.8rem;color:var(--muted-foreground);">Feb 2027</td>
                <td><button class="btn btn-sm">Revoke</button></td>
              </tr>
              <tr>
                <td><strong>AI Prompt Course</strong></td>
                <td class="meta-val mono" style="font-size:0.72rem;">AIP-XXXX-XXXX-3C4D</td>
                <td><span class="status-badge badge-starting"><span class="dot"></span>Pending</span></td>
                <td style="font-size:0.8rem;color:var(--muted-foreground);">—</td>
                <td><button class="btn btn-sm" disabled style="opacity:0.4;">—</button></td>
              </tr>
              <tr>
                <td><strong>DataViz Pro UI Kit</strong></td>
                <td class="meta-val mono" style="font-size:0.72rem;">DVP-XXXX-XXXX-5E6F</td>
                <td><span class="status-badge badge-starting"><span class="dot"></span>Expiring</span></td>
                <td style="font-size:0.8rem;color:var(--secondary);font-weight:700;">7 days</td>
                <td><button class="btn btn-sm btn-warning">Renew</button></td>
              </tr>
            </tbody>
        </x-ui.table-shell>
      </x-ui.panel>
    </div>

    <!-- ==================== ORDERS ==================== -->
    <div class="page-view" id="page-orders">
      <x-layout.page-header variant="dashboard" title="Orders" subtitle="Your full purchase history and order details." />
      <x-ui.panel variant="dashboard">
        <x-ui.table-shell variant="dashboard">
            <thead><tr><th>Order ID</th><th>Product</th><th>Type</th><th>Status</th><th>Date</th><th>Amount</th><th></th></tr></thead>
            <tbody>
              <tr>
                <td style="font-weight:700;">#ORD-0042</td>
                <td>NovaDash UI Kit</td>
                <td><span class="type-tag">digital</span></td>
                <td><span class="status-badge badge-active"><span class="dot"></span>Active</span></td>
                <td style="font-size:0.8rem;color:var(--muted-foreground);">Feb 14, 2026</td>
                <td class="order-amount">$49</td>
                <td><a class="order-link" onclick="navigate('products-digital', document.querySelector('[data-page=products-digital]'))">View Product →</a></td>
              </tr>
              <tr>
                <td style="font-weight:700;">#ORD-0041</td>
                <td>koncoweb VPS — SGP1</td>
                <td><span class="type-tag">vps_droplet</span></td>
                <td><span class="status-badge badge-running"><span class="dot"></span>Running</span></td>
                <td style="font-size:0.8rem;color:var(--muted-foreground);">Mar 1, 2026</td>
                <td class="order-amount">$24/mo</td>
                <td><a class="order-link" onclick="navigate('products-droplets', document.querySelector('[data-page=products-droplets]'))">Manage VPS →</a></td>
              </tr>
              <tr>
                <td style="font-weight:700;">#ORD-0040</td>
                <td>AI Prompt Engineering Course</td>
                <td><span class="type-tag">course</span></td>
                <td><span class="status-badge badge-starting"><span class="dot"></span>Pending</span></td>
                <td style="font-size:0.8rem;color:var(--muted-foreground);">Apr 1, 2026</td>
                <td class="order-amount">$99</td>
                <td><a class="order-link" href="#">View →</a></td>
              </tr>
              <tr>
                <td style="font-weight:700;">#ORD-0039</td>
                <td>DataViz Pro UI Kit</td>
                <td><span class="type-tag">digital</span></td>
                <td><span class="status-badge badge-starting"><span class="dot"></span>Expiring</span></td>
                <td style="font-size:0.8rem;color:var(--muted-foreground);">Jan 10, 2026</td>
                <td class="order-amount">$69</td>
                <td><a class="order-link" href="#">Renew →</a></td>
              </tr>
              <tr>
                <td style="font-weight:700;">#ORD-0038</td>
                <td>Indie Maker Notion Pack</td>
                <td><span class="type-tag">template</span></td>
                <td><span class="status-badge badge-active"><span class="dot"></span>Active</span></td>
                <td style="font-size:0.8rem;color:var(--muted-foreground);">Dec 5, 2025</td>
                <td class="order-amount">$15</td>
                <td><a class="order-link" href="#">View →</a></td>
              </tr>
            </tbody>
        </x-ui.table-shell>
      </x-ui.panel>
    </div>

    <!-- ==================== ACCOUNT ==================== -->
    <div class="page-view" id="page-account">
      <x-layout.page-header variant="dashboard" title="Account" subtitle="Manage your profile and billing information." />
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
        <div class="panel">
          <div class="panel-header"><div class="panel-title">Profile</div><button class="btn btn-sm">Edit</button></div>
          <div class="panel-body">
            <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;">
              <div style="width:56px;height:56px;border-radius:50%;border:2px solid var(--foreground);box-shadow:3px 3px 0 var(--shadow);background:linear-gradient(135deg,var(--accent),var(--secondary));display:flex;align-items:center;justify-content:center;font-family:var(--font-heading);font-weight:900;font-size:1.3rem;color:white;">AL</div>
              <div>
                <div style="font-family:var(--font-heading);font-size:1.1rem;font-weight:800;">Aldo</div>
                <div style="font-size:0.8rem;color:var(--muted-foreground);">devaldo@index-now.dev</div>
              </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;">
              <div style="display:flex;justify-content:space-between;font-size:0.82rem;padding:8px 0;border-bottom:1px solid var(--border);"><span style="color:var(--muted-foreground);font-weight:600;">Location</span><span style="font-weight:700;">Jakarta, Indonesia</span></div>
              <div style="display:flex;justify-content:space-between;font-size:0.82rem;padding:8px 0;border-bottom:1px solid var(--border);"><span style="color:var(--muted-foreground);font-weight:600;">Member since</span><span style="font-weight:700;">Oct 2025</span></div>
              <div style="display:flex;justify-content:space-between;font-size:0.82rem;padding:8px 0;"><span style="color:var(--muted-foreground);font-weight:600;">Plan</span><span><span class="status-badge badge-accent" style="font-size:0.65rem;">Pro</span></span></div>
            </div>
          </div>
        </div>
        <div class="panel">
          <div class="panel-header"><div class="panel-title">Billing</div><button class="btn btn-sm">Update</button></div>
          <div class="panel-body">
            <div style="display:flex;flex-direction:column;gap:8px;">
              <div style="display:flex;justify-content:space-between;font-size:0.82rem;padding:8px 0;border-bottom:1px solid var(--border);"><span style="color:var(--muted-foreground);font-weight:600;">Payment method</span><span style="font-weight:700;">•••• 4242</span></div>
              <div style="display:flex;justify-content:space-between;font-size:0.82rem;padding:8px 0;border-bottom:1px solid var(--border);"><span style="color:var(--muted-foreground);font-weight:600;">Next billing</span><span style="font-weight:700;">May 1, 2026</span></div>
              <div style="display:flex;justify-content:space-between;font-size:0.82rem;padding:8px 0;"><span style="color:var(--muted-foreground);font-weight:600;">Monthly total</span><span style="font-family:var(--font-heading);font-weight:900;font-size:1rem;">$24/mo</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== SUPPORT ==================== -->
    <div class="page-view" id="page-support">
      <x-layout.page-header variant="dashboard" title="Support" subtitle="Get help or open a ticket.">
        <x-slot:actions>
          <x-ui.button variant="accent">+ New Ticket</x-ui.button>
        </x-slot:actions>
      </x-layout.page-header>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:24px;">
        <div class="stat-card" style="cursor:pointer;">
          <div class="stat-icon">📚</div>
          <div style="font-family:var(--font-heading);font-size:0.95rem;font-weight:800;margin-top:4px;">Documentation</div>
          <div style="font-size:0.78rem;color:var(--muted-foreground);margin-top:4px;">Browse guides and tutorials</div>
        </div>
        <div class="stat-card" style="cursor:pointer;">
          <div class="stat-icon">💬</div>
          <div style="font-family:var(--font-heading);font-size:0.95rem;font-weight:800;margin-top:4px;">Live Chat</div>
          <div style="font-size:0.78rem;color:var(--muted-foreground);margin-top:4px;">Mon–Fri, 9am–6pm WIB</div>
        </div>
        <div class="stat-card" style="cursor:pointer;">
          <div class="stat-icon">📧</div>
          <div style="font-family:var(--font-heading);font-size:0.95rem;font-weight:800;margin-top:4px;">Email Support</div>
          <div style="font-size:0.78rem;color:var(--muted-foreground);margin-top:4px;">Response within 24h</div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-header"><div class="panel-title">Your Tickets</div></div>
        <x-ui.empty-state
          variant="dashboard"
          icon="🎉"
          title="No open tickets"
          description="Everything looks good. Open a ticket if you need help."
        />
      </div>
    </div>

  </main>
</div>

<!-- ============================================================
     TOAST NOTIFICATION
============================================================ -->
<x-ui.toast id="toast" variant="dashboard" />

<script>
  /* ===================== SIDEBAR TOGGLE ===================== */
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('sidebarToggle');

  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    // close submenu when collapsing
    if (sidebar.classList.contains('collapsed')) {
      document.querySelectorAll('.submenu').forEach(s => s.classList.remove('open'));
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('open'));
    }
  });

  /* ===================== SUBMENU ===================== */
  function toggleSubmenu(navId, subId) {
    if (sidebar.classList.contains('collapsed')) {
      sidebar.classList.remove('collapsed');
    }
    const navEl = document.getElementById(navId);
    const subEl = document.getElementById(subId);
    const isOpen = subEl.classList.contains('open');
    // close others
    document.querySelectorAll('.submenu').forEach(s => s.classList.remove('open'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('open'));
    if (!isOpen) {
      subEl.classList.add('open');
      navEl.classList.add('open');
    }
  }

  /* ===================== NAVIGATION ===================== */
  function navigate(page, el) {
    // Hide all pages
    document.querySelectorAll('.page-view').forEach(p => p.classList.remove('active'));
    // Show target
    const target = document.getElementById('page-' + page);
    if (target) { target.classList.add('active'); }

    // Update nav active states
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active', 'sub-active'));
    document.querySelectorAll('.nav-sub-item').forEach(n => n.classList.remove('active'));

    if (page === 'overview') {
      document.querySelector('[data-page="overview"]').classList.add('active');
    } else if (page === 'orders') {
      document.querySelector('[data-page="orders"]').classList.add('active');
    } else if (page === 'account') {
      document.querySelector('[data-page="account"]').classList.add('active');
    } else if (page === 'support') {
      document.querySelector('[data-page="support"]').classList.add('active');
    } else if (page.startsWith('products')) {
      // mark products parent as sub-active
      document.getElementById('navProducts').classList.add('sub-active');
      // mark submenu item
      const sub = document.querySelector(`.nav-sub-item[data-page="${page}"]`);
      if (sub) sub.classList.add('active');
      // ensure submenu open
      document.getElementById('submenuProducts').classList.add('open');
      document.getElementById('navProducts').classList.add('open');
    }

    // scroll main to top
    document.querySelector('.main').scrollTop = 0;

    const pathMap = {
      overview: '/dashboard',
      orders: '/dashboard/orders',
      account: '/dashboard/account',
      support: '/dashboard/support',
      'products-all': '/dashboard/products',
      'products-droplets': '/dashboard/products/droplets',
      'products-digital': '/dashboard/products?section=digital',
      'products-access': '/dashboard/products?section=access',
    };

    if (pathMap[page]) {
      window.history.replaceState({ page }, '', pathMap[page]);
    }
  }

  /* ===================== DROPLET ACTIONS ===================== */
  function dropletAction(id, action) {
    const card = document.getElementById('droplet-' + id);
    const btns = card.querySelectorAll('button');
    btns.forEach(b => { b.disabled = true; b.style.opacity = '0.5'; });

    let msg = '';
    let done = () => { btns.forEach(b => { b.disabled = false; b.style.opacity = '1'; }); };

    if (action === 'on') {
      msg = '⚡ Powering on droplet…';
      showToast(msg, 'starting');
      setTimeout(() => {
        // update badge
        const badge = card.querySelector('.status-badge');
        badge.className = 'status-badge badge-running';
        badge.innerHTML = '<span class="dot"></span>Running';
        // swap button
        const actionRow = card.querySelector('.droplet-actions');
        actionRow.innerHTML = `
          <button class="btn btn-sm btn-danger" onclick="dropletAction(${id},'off')">Power Off</button>
          <button class="btn btn-sm btn-warning" onclick="dropletAction(${id},'reboot')">Reboot</button>
          <button class="btn btn-sm" onclick="dropletAction(${id},'refresh')">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            Refresh
          </button>`;
        showToast('✅ Droplet is running.', 'success');
      }, 2200);
    } else if (action === 'off') {
      msg = '🔌 Powering off droplet…';
      showToast(msg, 'starting');
      setTimeout(() => {
        const badge = card.querySelector('.status-badge');
        badge.className = 'status-badge badge-stopped';
        badge.innerHTML = '<span class="dot"></span>Stopped';
        const actionRow = card.querySelector('.droplet-actions');
        actionRow.innerHTML = `
          <button class="btn btn-sm btn-success" onclick="dropletAction(${id},'on')">Power On</button>
          <button class="btn btn-sm" onclick="dropletAction(${id},'refresh')">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            Refresh
          </button>`;
        showToast('✅ Droplet stopped.', 'success');
      }, 2000);
    } else if (action === 'reboot') {
      msg = '🔄 Rebooting droplet…';
      showToast(msg, 'starting');
      setTimeout(() => { done(); showToast('✅ Reboot complete.', 'success'); }, 2500);
    } else if (action === 'refresh') {
      msg = '🔍 Refreshing status…';
      showToast(msg, 'neutral');
      setTimeout(() => { done(); showToast('✅ Status refreshed.', 'success'); }, 1200);
    }
  }

  function refreshAll() {
    showToast('🔄 Refreshing all droplets…', 'neutral');
    setTimeout(() => showToast('✅ All statuses updated.', 'success'), 1800);
  }

  async function handleLogout(redirectTo) {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: { Accept: 'application/json' }
      });
    } catch (error) {
      console.error('Logout request failed', error);
    }

    document.cookie = 'sb-access-token=; Path=/; Max-Age=0; SameSite=Lax';
    document.cookie = 'sb-refresh-token=; Path=/; Max-Age=0; SameSite=Lax';
    window.location.href = redirectTo;
  }

  /* ===================== TOAST ===================== */
  let toastTimer;
  function showToast(msg, type) {
    const toast = document.getElementById('toast');
    const colors = {
      success: 'var(--quaternary)',
      starting: 'var(--tertiary)',
      neutral: 'var(--foreground)',
    };
    toast.style.background = colors[type] || 'var(--foreground)';
    toast.style.color = type === 'neutral' ? 'white' : 'var(--foreground)';
    toast.style.borderColor = colors[type] || 'var(--foreground)';
    toast.textContent = msg;
    toast.style.display = 'flex';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.style.display = 'none'; }, 3200);
  }

  const initialPage = @json($initialPageValue);
  navigate(initialPage, null);
</script>
</body>
</html>
