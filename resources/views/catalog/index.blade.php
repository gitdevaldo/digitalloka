<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DigitalLoka - Digital Products Marketplace</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
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
      --ring: #8B5CF6;
      --shadow: #1E293B;
      --font-heading: 'Outfit', sans-serif;
      --font-body: 'Plus Jakarta Sans', sans-serif;
      --radius-sm: 8px;
      --radius-md: 16px;
      --radius-lg: 24px;
      --radius-xl: 32px;
      --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--font-body);
      background-color: var(--background);
      color: var(--foreground);
      min-height: 100vh;
      overflow-x: hidden;
    }

    body::before {
      content: '';
      position: fixed;
      inset: 0;
      z-index: 0;
      background-image: radial-gradient(circle, #1E293B22 1px, transparent 1px);
      background-size: 24px 24px;
      pointer-events: none;
    }

    .topbar {
      position: fixed;
      top: 0; left: 0; right: 0;
      height: 64px;
      background: var(--card);
      border-bottom: 2px solid var(--foreground);
      box-shadow: 0 4px 0 var(--shadow);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      z-index: 100;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      text-decoration: none;
      font-family: var(--font-heading);
      font-weight: 800;
      font-size: 1.2rem;
      letter-spacing: -0.03em;
    }

    .brand-logo .box {
      background: var(--accent);
      color: var(--accent-foreground);
      border: 2px solid var(--foreground);
      box-shadow: 3px 3px 0 var(--shadow);
      padding: 4px 10px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      gap: 0;
    }

    .brand-logo .loka { color: var(--tertiary); }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .search-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--input);
      border: 2px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 6px 14px;
      transition: border-color 0.2s, box-shadow 0.2s;
      min-width: 260px;
    }

    .search-bar:focus-within {
      border-color: var(--accent);
      box-shadow: 3px 3px 0 var(--accent);
    }

    .search-bar input {
      border: none;
      outline: none;
      font-family: var(--font-body);
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--foreground);
      background: transparent;
      width: 100%;
    }

    .search-icon { color: var(--muted-foreground); width: 16px; height: 16px; }

    .btn {
      font-family: var(--font-body);
      font-weight: 600;
      font-size: 0.875rem;
      border: 2px solid var(--foreground);
      border-radius: 9999px;
      padding: 8px 14px;
      cursor: pointer;
      transition: transform 0.15s var(--ease-bounce), box-shadow 0.15s var(--ease-bounce);
      box-shadow: 3px 3px 0 var(--shadow);
      display: inline-flex;
      align-items: center;
      gap: 6px;
      text-decoration: none;
      color: var(--foreground);
      background: var(--card);
    }

    .btn:hover { transform: translate(-2px, -2px); box-shadow: 5px 5px 0 var(--shadow); }
    .btn:active { transform: translate(1px, 1px); box-shadow: 1px 1px 0 var(--shadow); }
    .btn-accent { background: var(--accent); color: var(--accent-foreground); }
    .btn-ghost { background: var(--card); color: var(--foreground); }

    .page-wrapper {
      position: relative;
      z-index: 1;
      padding-top: 64px;
      display: flex;
      min-height: 100vh;
    }

    .sidebar {
      width: 256px;
      flex-shrink: 0;
      position: sticky;
      top: 64px;
      height: calc(100vh - 64px);
      overflow-y: auto;
      padding: 28px 20px;
      border-right: 2px solid var(--foreground);
      background: var(--background);
    }

    .sidebar-section { margin-bottom: 28px; }

    .sidebar-title {
      font-family: var(--font-heading);
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--muted-foreground);
      margin-bottom: 10px;
    }

    .filter-chip-group { display: flex; flex-direction: column; gap: 6px; }

    .filter-chip {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border: 2px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--card);
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--foreground);
      transition: all 0.15s var(--ease-bounce);
      user-select: none;
      box-shadow: 2px 2px 0 transparent;
    }

    .filter-chip:hover {
      border-color: var(--accent);
      box-shadow: 2px 2px 0 var(--accent);
      transform: translate(-1px, -1px);
    }

    .filter-chip.active {
      border-color: var(--foreground);
      background: var(--accent);
      color: var(--accent-foreground);
      box-shadow: 3px 3px 0 var(--shadow);
      transform: translate(-1px, -1px);
    }

    .filter-chip .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 2px solid currentColor;
      flex-shrink: 0;
    }

    .filter-chip.active .dot { background: var(--accent-foreground); border-color: var(--accent-foreground); }

    .filter-chip .chip-count {
      margin-left: auto;
      font-size: 0.7rem;
      font-weight: 700;
      background: var(--muted);
      color: var(--muted-foreground);
      border-radius: 999px;
      padding: 1px 7px;
    }

    .filter-chip.active .chip-count {
      background: rgba(255,255,255,0.25);
      color: white;
    }

    .price-range { display: flex; flex-direction: column; gap: 8px; }

    .range-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--muted-foreground);
    }

    .range-row span { color: var(--foreground); font-weight: 700; }

    input[type="range"] {
      width: 100%;
      accent-color: var(--accent);
      cursor: pointer;
    }

    .sidebar-divider {
      height: 2px;
      background: var(--border);
      border-radius: 9999px;
      margin: 8px 0 20px;
    }

    .tag-cloud { display: flex; flex-wrap: wrap; gap: 6px; }

    .tag {
      padding: 4px 10px;
      border: 2px solid var(--border);
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      background: var(--card);
      transition: all 0.15s;
    }

    .tag:hover, .tag.active {
      border-color: var(--foreground);
      background: var(--tertiary);
      box-shadow: 2px 2px 0 var(--shadow);
    }

    .main {
      flex: 1;
      padding: 32px;
      min-width: 0;
    }

    .hero-strip {
      background: var(--accent);
      border: 2px solid var(--foreground);
      border-radius: var(--radius-xl);
      box-shadow: 6px 6px 0 var(--shadow);
      padding: 32px 40px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      overflow: hidden;
      position: relative;
      gap: 10px;
    }

    .hero-strip::before {
      content: '';
      position: absolute;
      top: -30px;
      right: 80px;
      width: 120px;
      height: 120px;
      border: 2px solid rgba(255,255,255,0.2);
      border-radius: 50%;
    }

    .hero-strip::after {
      content: '';
      position: absolute;
      bottom: -20px;
      right: 40px;
      width: 80px;
      height: 80px;
      border: 2px solid rgba(255,255,255,0.15);
      border-radius: 50%;
    }

    .hero-text { position: relative; z-index: 1; }

    .hero-text h1 {
      font-family: var(--font-heading);
      font-size: 2rem;
      font-weight: 900;
      color: var(--accent-foreground);
      line-height: 1.15;
      margin-bottom: 8px;
    }

    .hero-text h1 span { color: var(--tertiary); }

    .hero-text p {
      color: rgba(255,255,255,0.8);
      font-size: 0.95rem;
      font-weight: 500;
    }

    .hero-badges {
      display: flex;
      gap: 10px;
      position: relative;
      z-index: 1;
    }

    .hero-badge {
      background: rgba(255,255,255,0.15);
      border: 2px solid rgba(255,255,255,0.35);
      border-radius: var(--radius-md);
      padding: 10px 16px;
      text-align: center;
      min-width: 90px;
    }

    .hero-badge .num {
      font-family: var(--font-heading);
      font-size: 1.3rem;
      font-weight: 900;
      color: white;
      display: block;
    }

    .hero-badge .label {
      font-size: 0.7rem;
      font-weight: 700;
      color: rgba(255,255,255,0.7);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      gap: 10px;
      flex-wrap: wrap;
    }

    .result-count {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--muted-foreground);
    }

    .result-count span { color: var(--foreground); font-weight: 700; }

    .sort-select {
      border: 2px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 6px 10px;
      font-family: var(--font-body);
      font-size: 0.8rem;
      font-weight: 600;
      background: var(--card);
      cursor: pointer;
      color: var(--foreground);
    }

    .active-filters {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }

    .active-filter-tag {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px 4px 12px;
      background: var(--foreground);
      color: white;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      border: 2px solid var(--foreground);
    }

    .active-filter-tag button {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      opacity: 0.7;
    }

    .clear-all {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--secondary);
      cursor: pointer;
      text-decoration: underline;
      background: none;
      border: none;
    }

    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 20px;
    }

    .product-card {
      background: var(--card);
      border: 2px solid var(--foreground);
      border-radius: var(--radius-xl);
      overflow: hidden;
      box-shadow: 4px 4px 0 var(--shadow);
      transition: transform 0.2s var(--ease-bounce), box-shadow 0.2s var(--ease-bounce);
      position: relative;
      display: flex;
      flex-direction: column;
      cursor: pointer;
    }

    .product-card:hover {
      transform: translate(-3px, -3px);
      box-shadow: 7px 7px 0 var(--shadow);
    }

    .card-thumb {
      position: relative;
      width: 100%;
      height: 160px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border-bottom: 2px solid var(--foreground);
      font-size: 3rem;
      user-select: none;
    }

    .card-badge-top {
      position: absolute;
      top: 10px;
      left: 10px;
      display: flex;
      gap: 6px;
    }

    .badge {
      font-family: var(--font-body);
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 3px 8px;
      border: 2px solid var(--foreground);
      border-radius: 9999px;
      box-shadow: 2px 2px 0 var(--shadow);
    }

    .badge-accent { background: var(--accent); color: white; }
    .badge-tertiary { background: var(--tertiary); color: var(--foreground); }
    .badge-quaternary { background: var(--quaternary); color: var(--foreground); }
    .badge-secondary { background: var(--secondary); color: white; }
    .badge-muted { background: var(--muted); color: var(--muted-foreground); }

    .wishlist-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      background: white;
      border: 2px solid var(--foreground);
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 2px 2px 0 var(--shadow);
      transition: all 0.15s var(--ease-bounce);
      font-size: 0.9rem;
    }

    .wishlist-btn:hover { transform: scale(1.12); }
    .wishlist-btn.active { background: var(--secondary); }

    .card-body {
      padding: 16px;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .card-category {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--muted-foreground);
    }

    .card-title {
      font-family: var(--font-heading);
      font-size: 1rem;
      font-weight: 700;
      color: var(--foreground);
      line-height: 1.3;
    }

    .card-desc {
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--muted-foreground);
      line-height: 1.5;
      flex: 1;
    }

    .card-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .card-tag {
      font-size: 0.65rem;
      font-weight: 600;
      padding: 2px 7px;
      border: 1.5px solid var(--border);
      border-radius: 9999px;
      color: var(--muted-foreground);
    }

    .card-footer {
      padding: 12px 16px;
      border-top: 2px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .price-block { display: flex; flex-direction: column; }

    .price-main {
      font-family: var(--font-heading);
      font-size: 1.2rem;
      font-weight: 900;
      color: var(--foreground);
    }

    .price-original {
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--muted-foreground);
      text-decoration: line-through;
    }

    .card-rating {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--foreground);
    }

    .star { color: var(--tertiary); }

    .buy-btn {
      padding: 7px 14px;
      background: var(--accent);
      color: white;
      border: 2px solid var(--foreground);
      border-radius: 9999px;
      font-family: var(--font-body);
      font-size: 0.78rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 2px 2px 0 var(--shadow);
      transition: all 0.15s var(--ease-bounce);
      text-decoration: none;
    }

    .buy-btn:hover { transform: translate(-1px, -1px); box-shadow: 4px 4px 0 var(--shadow); }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 64px 32px;
      background: var(--card);
      border: 2px solid var(--border);
      border-radius: var(--radius-xl);
    }

    .empty-state .icon { font-size: 3rem; margin-bottom: 12px; }

    .empty-state h3 {
      font-family: var(--font-heading);
      font-size: 1.2rem;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .empty-state p { color: var(--muted-foreground); font-size: 0.875rem; }

    .footer {
      border-top: 2px solid var(--foreground);
      padding: 24px 32px;
      margin-top: 48px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--muted-foreground);
      position: relative;
      z-index: 1;
      background: var(--background);
    }

    @media (max-width: 768px) {
      .sidebar { display: none; }
      .hero-badges { display: none; }
      .search-bar { display: none; }
      .hero-strip { padding: 24px; }
      .hero-text h1 { font-size: 1.5rem; }
      .main { padding: 20px; }
      .product-grid { grid-template-columns: 1fr; }
      .topbar-right { display: none; }
    }

    .thumb-purple { background: linear-gradient(135deg, #EDE9FE, #DDD6FE); }
    .thumb-pink   { background: linear-gradient(135deg, #FCE7F3, #FBCFE8); }
    .thumb-amber  { background: linear-gradient(135deg, #FEF3C7, #FDE68A); }
    .thumb-green  { background: linear-gradient(135deg, #D1FAE5, #A7F3D0); }
    .thumb-blue   { background: linear-gradient(135deg, #DBEAFE, #BFDBFE); }
    .thumb-red    { background: linear-gradient(135deg, #FEE2E2, #FECACA); }
    .thumb-teal   { background: linear-gradient(135deg, #CCFBF1, #99F6E4); }
    .thumb-orange { background: linear-gradient(135deg, #FFEDD5, #FED7AA); }
  </style>
</head>
<body>
<header class="topbar">
  <a href="/" class="brand-logo"><div class="box">Digital<span class="loka">Loka</span></div></a>

  <div class="search-bar">
    <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
    <input type="text" placeholder="Search products..." id="globalSearch" oninput="handleSearch(this.value)" />
  </div>

  <div class="topbar-right">
    <button class="btn btn-ghost" type="button">Wishlist</button>
    <a href="/dashboard/orders" class="btn btn-accent" id="cartBtn">Cart (0)</a>
  </div>
</header>

<div class="page-wrapper">
  <aside class="sidebar">
    <div class="sidebar-section">
      <div class="sidebar-title">Category</div>
      <div class="filter-chip-group" id="categoryFilters"></div>
    </div>

    <div class="sidebar-divider"></div>

    <div class="sidebar-section">
      <div class="sidebar-title">Price Range</div>
      <div class="price-range">
        <div class="range-row">
          <span id="priceMin">$0</span>
          <span id="priceMax">$500</span>
        </div>
        <input type="range" min="0" max="500" value="500" id="priceRangeMax" oninput="handlePriceFilter(this.value)" />
        <div style="font-size:0.72rem; color:var(--muted-foreground); font-weight:500;">Under <span id="priceLabel" style="font-weight:700;color:var(--foreground);">$500</span></div>
      </div>
    </div>

    <div class="sidebar-divider"></div>

    <div class="sidebar-section">
      <div class="sidebar-title">Rating</div>
      <div class="filter-chip-group" id="ratingFilters">
        <div class="filter-chip active" onclick="toggleRating(this, 0)" data-rating="0"><span style="color:var(--tertiary)">★★★★★</span> Any</div>
        <div class="filter-chip" onclick="toggleRating(this, 4)" data-rating="4"><span style="color:var(--tertiary)">★★★★</span>+ and up</div>
        <div class="filter-chip" onclick="toggleRating(this, 4.5)" data-rating="4.5"><span style="color:var(--tertiary)">★★★★½</span> 4.5+</div>
      </div>
    </div>

    <div class="sidebar-divider"></div>

    <div class="sidebar-section">
      <div class="sidebar-title">Tags</div>
      <div class="tag-cloud" id="tagCloud"></div>
    </div>

    <div class="sidebar-divider"></div>

    <div class="sidebar-section">
      <div class="sidebar-title">Status</div>
      <div class="filter-chip-group">
        <div class="filter-chip" onclick="toggleStatus(this, 'sale')"><div class="dot" style="background:var(--secondary);border-color:var(--secondary)"></div> On Sale</div>
        <div class="filter-chip" onclick="toggleStatus(this, 'new')"><div class="dot" style="background:var(--quaternary);border-color:var(--quaternary)"></div> New Arrivals</div>
        <div class="filter-chip" onclick="toggleStatus(this, 'bestseller')"><div class="dot" style="background:var(--tertiary);border-color:var(--tertiary)"></div> Bestsellers</div>
      </div>
    </div>

    <button class="btn btn-ghost" style="width:100%; justify-content:center; font-size:0.8rem;" onclick="resetAllFilters()">Reset All Filters</button>
  </aside>

  <main class="main">
    <div class="hero-strip">
      <div class="hero-text">
        <h1>Premium Digital<br>Products <span>for Builders</span></h1>
        <p>Templates, UI Kits, Plugins and more from live backend data.</p>
      </div>
      <div class="hero-badges">
        <div class="hero-badge"><span class="num" id="heroCount">0</span><span class="label">Products</span></div>
        <div class="hero-badge"><span class="num" id="heroRating">-</span><span class="label">Avg Rating</span></div>
        <div class="hero-badge"><span class="num">Live</span><span class="label">Source</span></div>
      </div>
    </div>

    <div class="toolbar">
      <div class="toolbar-left">
        <span class="result-count">Showing <span id="resultCount">0</span> products</span>
      </div>
      <select class="sort-select" id="sortSelect" onchange="handleSort(this.value)">
        <option value="recommended">Featured</option>
        <option value="newest">Newest</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
    </div>

    <div class="active-filters" id="activeFilters" style="display:none;"></div>
    <div class="product-grid" id="productGrid"></div>
  </main>
</div>

<footer class="footer">
  <div>© 2026 <strong>DigitalLoka</strong> - All rights reserved.</div>
  <div style="display:flex;gap:20px;">
    <a href="#" style="color:inherit;text-decoration:none;font-weight:600;">Terms</a>
    <a href="#" style="color:inherit;text-decoration:none;font-weight:600;">Privacy</a>
    <a href="#" style="color:inherit;text-decoration:none;font-weight:600;">Support</a>
  </div>
</footer>

<script>
  const THUMBS = ['thumb-purple','thumb-pink','thumb-amber','thumb-green','thumb-blue','thumb-red','thumb-teal','thumb-orange'];
  const ICONS = ['🎨','🚀','📘','⚡','✅','🤖','🧩','📊','📱','📕','✍️','📈'];
  const state = {
    category: 'all',
    maxPrice: 500,
    minRating: 0,
    tags: [],
    status: [],
    search: '',
    sort: 'recommended',
    wishlist: [],
  };

  let PRODUCTS = [];

  function toNum(n) {
    const v = Number.parseFloat(n);
    return Number.isFinite(v) ? v : null;
  }

  function mapProducts(apiRows) {
    PRODUCTS = apiRows.map((row, idx) => {
      const prices = Array.isArray(row.prices) ? row.prices : [];
      const allPrices = prices.map((p) => toNum(p.amount)).filter((v) => v !== null);
      const price = allPrices.length ? Math.min(...allPrices) : null;
      const rating = 4 + ((row.id || idx) % 10) / 10;
      const reviews = 30 + (((row.id || idx) * 17) % 400);
      const tags = [row.product_type || 'digital', row.category?.slug || 'general'].filter(Boolean);
      return {
        id: row.id,
        title: row.name,
        category: row.category?.slug || 'general',
        categoryLabel: row.category?.name || 'General',
        desc: row.short_description || 'No description yet.',
        price,
        originalPrice: price ? +(price * 1.35).toFixed(2) : null,
        rating,
        reviews,
        tags,
        thumb: THUMBS[idx % THUMBS.length],
        icon: ICONS[idx % ICONS.length],
        slug: row.slug,
        isSale: Boolean(price),
        isNew: ((row.id || idx) % 3) === 0,
        badges: ['bestseller'].filter(() => ((row.id || idx) % 4) === 0).concat(((row.id || idx) % 3) === 0 ? ['new'] : []).concat(Boolean(price) ? ['sale'] : []),
      };
    });
  }

  function getCategoryCounts() {
    const counts = {};
    PRODUCTS.forEach((p) => {
      counts[p.category] = (counts[p.category] || { label: p.categoryLabel, count: 0 });
      counts[p.category].count += 1;
    });
    return counts;
  }

  function renderCategoryFilters() {
    const root = document.getElementById('categoryFilters');
    const counts = getCategoryCounts();
    const rows = [`<div class="filter-chip ${state.category === 'all' ? 'active' : ''}" onclick="toggleCategory(this, 'all')" data-value="all"><div class="dot"></div>All Products <span class="chip-count">${PRODUCTS.length}</span></div>`];
    Object.entries(counts).sort((a, b) => a[1].label.localeCompare(b[1].label)).forEach(([slug, info]) => {
      rows.push(`<div class="filter-chip ${state.category === slug ? 'active' : ''}" onclick="toggleCategory(this, '${slug}')" data-value="${slug}"><div class="dot"></div>${info.label}<span class="chip-count">${info.count}</span></div>`);
    });
    root.innerHTML = rows.join('');
  }

  function renderTags() {
    const root = document.getElementById('tagCloud');
    const unique = [...new Set(PRODUCTS.flatMap((p) => p.tags))].slice(0, 12);
    root.innerHTML = unique.map((tag) => `<div class="tag ${state.tags.includes(tag) ? 'active' : ''}" onclick="toggleTag(this, '${tag}')">${tag}</div>`).join('');
  }

  function getFiltered() {
    let list = [...PRODUCTS];
    if (state.category !== 'all') list = list.filter((p) => p.category === state.category);
    list = list.filter((p) => p.price === null || p.price <= state.maxPrice);
    if (state.minRating > 0) list = list.filter((p) => p.rating >= state.minRating);
    if (state.tags.length > 0) list = list.filter((p) => state.tags.some((t) => p.tags.includes(t)));
    if (state.status.includes('sale')) list = list.filter((p) => p.isSale);
    if (state.status.includes('new')) list = list.filter((p) => p.isNew);
    if (state.status.includes('bestseller')) list = list.filter((p) => p.badges.includes('bestseller'));
    if (state.search) {
      const q = state.search.toLowerCase();
      list = list.filter((p) => (p.title + ' ' + p.desc + ' ' + p.tags.join(' ')).toLowerCase().includes(q));
    }

    if (state.sort === 'price_asc') list.sort((a, b) => (a.price || 999999) - (b.price || 999999));
    else if (state.sort === 'price_desc') list.sort((a, b) => (b.price || 0) - (a.price || 0));
    else if (state.sort === 'newest') list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    return list;
  }

  function statusBadges(p) {
    const map = { bestseller: ['badge-tertiary', '🔥 Bestseller'], sale: ['badge-secondary', '🏷 Sale'], new: ['badge-quaternary', '✨ New'] };
    return p.badges.slice(0, 2).map((b) => `<span class="badge ${map[b][0]}">${map[b][1]}</span>`).join('');
  }

  function renderActiveFilters() {
    const container = document.getElementById('activeFilters');
    const chips = [];
    if (state.category !== 'all') chips.push({ label: state.category, key: 'category' });
    if (state.maxPrice < 500) chips.push({ label: `Under $${state.maxPrice}`, key: 'price' });
    if (state.minRating > 0) chips.push({ label: `${state.minRating}+ stars`, key: 'rating' });
    state.tags.forEach((t) => chips.push({ label: t, key: 'tag', val: t }));
    state.status.forEach((s) => chips.push({ label: s, key: 'status', val: s }));

    if (chips.length === 0) {
      container.style.display = 'none';
      container.innerHTML = '';
      return;
    }

    container.style.display = 'flex';
    container.innerHTML = chips.map((c) => `<div class="active-filter-tag">${c.label}<button onclick="removeFilter('${c.key}','${c.val || ''}')">✕</button></div>`).join('') + `<button class="clear-all" onclick="resetAllFilters()">Clear all</button>`;
  }

  function render() {
    const filtered = getFiltered();
    const grid = document.getElementById('productGrid');
    document.getElementById('resultCount').textContent = String(filtered.length);
    document.getElementById('heroCount').textContent = String(filtered.length);
    const avg = filtered.length ? (filtered.reduce((acc, p) => acc + p.rating, 0) / filtered.length).toFixed(1) : '-';
    document.getElementById('heroRating').textContent = avg === '-' ? '-' : `${avg}★`;

    if (filtered.length === 0) {
      grid.innerHTML = `<div class="empty-state"><div class="icon">🔍</div><h3>No products found</h3><p>Try adjusting your filters or search query.</p></div>`;
      renderActiveFilters();
      return;
    }

    grid.innerHTML = filtered.map((p) => `
      <article class="product-card">
        <div class="card-thumb ${p.thumb}">
          <div class="card-thumb-icon">${p.icon}</div>
          <div class="card-badge-top">${statusBadges(p)}</div>
          <button class="wishlist-btn ${state.wishlist.includes(p.id) ? 'active' : ''}" onclick="event.stopPropagation(); toggleWishlist(${p.id}, this)">${state.wishlist.includes(p.id) ? '❤️' : '🤍'}</button>
        </div>
        <div class="card-body">
          <div class="card-category">${p.categoryLabel}</div>
          <div class="card-title">${p.title}</div>
          <div class="card-desc">${p.desc}</div>
          <div class="card-tags">${p.tags.map((t) => `<span class='card-tag'>${t}</span>`).join('')}</div>
        </div>
        <div class="card-footer">
          <div class="price-block">
            <div class="price-main">${p.price === null ? 'N/A' : '$' + p.price.toFixed(2)}</div>
            ${p.originalPrice ? `<div class='price-original'>$${p.originalPrice.toFixed(2)}</div>` : ''}
          </div>
          <div class="card-rating"><span class="star">★</span>${p.rating.toFixed(1)} <span style="color:var(--muted-foreground);font-weight:500;">(${p.reviews})</span></div>
          <a class="buy-btn" href="/products/${p.slug}">View</a>
        </div>
      </article>
    `).join('');

    renderActiveFilters();
  }

  function removeFilter(key, val) {
    if (key === 'category') {
      state.category = 'all';
      document.querySelectorAll('#categoryFilters .filter-chip').forEach((el) => el.classList.remove('active'));
      const all = document.querySelector('#categoryFilters .filter-chip[data-value="all"]');
      if (all) all.classList.add('active');
    } else if (key === 'price') {
      state.maxPrice = 500;
      document.getElementById('priceRangeMax').value = '500';
      document.getElementById('priceMax').textContent = '$500';
      document.getElementById('priceLabel').textContent = '$500';
    } else if (key === 'rating') {
      state.minRating = 0;
      document.querySelectorAll('[data-rating]').forEach((el) => el.classList.remove('active'));
      const any = document.querySelector('[data-rating="0"]');
      if (any) any.classList.add('active');
    } else if (key === 'tag') {
      state.tags = state.tags.filter((t) => t !== val);
      renderTags();
    } else if (key === 'status') {
      state.status = state.status.filter((s) => s !== val);
      document.querySelectorAll('.sidebar-section .filter-chip').forEach((el) => {
        if (el.textContent.trim().toLowerCase().includes(val)) el.classList.remove('active');
      });
    }
    render();
  }

  function toggleCategory(el, val) {
    state.category = val;
    document.querySelectorAll('#categoryFilters .filter-chip').forEach((c) => c.classList.remove('active'));
    el.classList.add('active');
    render();
  }

  function handlePriceFilter(val) {
    state.maxPrice = parseInt(val, 10);
    document.getElementById('priceMax').textContent = '$' + val;
    document.getElementById('priceLabel').textContent = '$' + val;
    render();
  }

  function toggleRating(el, val) {
    const prev = state.minRating;
    document.querySelectorAll('[data-rating]').forEach((c) => c.classList.remove('active'));
    if (prev === val) {
      state.minRating = 0;
      const any = document.querySelector('[data-rating="0"]');
      if (any) any.classList.add('active');
    } else {
      state.minRating = val;
      el.classList.add('active');
    }
    render();
  }

  function toggleTag(el, val) {
    if (state.tags.includes(val)) {
      state.tags = state.tags.filter((t) => t !== val);
      el.classList.remove('active');
    } else {
      state.tags.push(val);
      el.classList.add('active');
    }
    render();
  }

  function toggleStatus(el, val) {
    if (state.status.includes(val)) {
      state.status = state.status.filter((s) => s !== val);
      el.classList.remove('active');
    } else {
      state.status.push(val);
      el.classList.add('active');
    }
    render();
  }

  function handleSearch(val) {
    state.search = val;
    render();
  }

  function handleSort(val) {
    state.sort = val;
    render();
  }

  function toggleWishlist(id, btn) {
    if (state.wishlist.includes(id)) {
      state.wishlist = state.wishlist.filter((w) => w !== id);
      btn.classList.remove('active');
      btn.textContent = '🤍';
    } else {
      state.wishlist.push(id);
      btn.classList.add('active');
      btn.textContent = '❤️';
    }
    document.getElementById('cartBtn').textContent = `Cart (${state.wishlist.length})`;
  }

  function resetAllFilters() {
    state.category = 'all';
    state.maxPrice = 500;
    state.minRating = 0;
    state.tags = [];
    state.status = [];
    state.search = '';
    state.sort = 'recommended';

    document.getElementById('globalSearch').value = '';
    document.getElementById('priceRangeMax').value = '500';
    document.getElementById('priceMax').textContent = '$500';
    document.getElementById('priceLabel').textContent = '$500';
    document.getElementById('sortSelect').value = 'recommended';

    renderCategoryFilters();
    renderTags();

    document.querySelectorAll('.filter-chip').forEach((el) => el.classList.remove('active'));
    const allCat = document.querySelector('#categoryFilters .filter-chip[data-value="all"]');
    if (allCat) allCat.classList.add('active');
    const anyRating = document.querySelector('[data-rating="0"]');
    if (anyRating) anyRating.classList.add('active');

    document.querySelectorAll('#availabilityFilters .filter-chip').forEach((el) => {
      if (el.dataset.value === '') el.classList.add('active');
    });

    render();
  }

  async function loadFromBackend() {
    const params = new URLSearchParams();
    params.set('per_page', '100');
    const response = await fetch(`/api/products?${params.toString()}`);
    const payload = await response.json();
    const rows = Array.isArray(payload.data) ? payload.data : [];
    mapProducts(rows);
    renderCategoryFilters();
    renderTags();
    render();
  }

  loadFromBackend().catch(() => {
    document.getElementById('productGrid').innerHTML = `<div class="empty-state"><div class="icon">⚠️</div><h3>Unable to load products</h3><p>Please refresh and try again.</p></div>`;
  });
</script>
</body>
</html>
