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
      top: 0;
      left: 0;
      right: 0;
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
      gap: 4px;
    }

    .brand-logo .loka { color: var(--tertiary); }

    .search-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--input);
      border: 2px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 6px 14px;
      transition: border-color 0.2s, box-shadow 0.2s;
      min-width: 320px;
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
      padding: 24px 18px;
      border-right: 2px solid var(--foreground);
      background: var(--background);
    }

    .sidebar-section { margin-bottom: 20px; }
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

    .sidebar-divider {
      height: 2px;
      background: var(--border);
      border-radius: 9999px;
      margin: 8px 0 16px;
    }

    .main {
      flex: 1;
      padding: 28px;
      min-width: 0;
    }

    .hero-strip {
      background: var(--accent);
      border: 2px solid var(--foreground);
      border-radius: var(--radius-xl);
      box-shadow: 6px 6px 0 var(--shadow);
      padding: 26px 30px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      overflow: hidden;
      position: relative;
      gap: 12px;
    }

    .hero-strip::before {
      content: '';
      position: absolute;
      top: -24px;
      right: 80px;
      width: 112px;
      height: 112px;
      border: 2px solid rgba(255,255,255,0.2);
      border-radius: 50%;
    }

    .hero-text { position: relative; z-index: 1; }

    .hero-text h1 {
      font-family: var(--font-heading);
      font-size: 1.9rem;
      font-weight: 900;
      color: var(--accent-foreground);
      line-height: 1.15;
      margin-bottom: 8px;
    }

    .hero-text h1 span { color: var(--tertiary); }

    .hero-text p {
      color: rgba(255,255,255,0.85);
      font-size: 0.95rem;
      font-weight: 500;
    }

    .hero-badges { display: flex; gap: 10px; position: relative; z-index: 1; }

    .hero-badge {
      background: rgba(255,255,255,0.15);
      border: 2px solid rgba(255,255,255,0.35);
      border-radius: var(--radius-md);
      padding: 10px 14px;
      text-align: center;
      min-width: 96px;
    }

    .hero-badge .num {
      font-family: var(--font-heading);
      font-size: 1.2rem;
      font-weight: 900;
      color: white;
      display: block;
      text-transform: capitalize;
    }

    .hero-badge .label {
      font-size: 0.7rem;
      font-weight: 700;
      color: rgba(255,255,255,0.75);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
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

    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 16px;
    }

    .product-card {
      background: var(--card);
      border: 2px solid var(--foreground);
      border-radius: var(--radius-xl);
      overflow: hidden;
      box-shadow: 4px 4px 0 var(--shadow);
      transition: transform 0.2s var(--ease-bounce), box-shadow 0.2s var(--ease-bounce);
      display: flex;
      flex-direction: column;
    }

    .product-card:hover {
      transform: translate(-3px, -3px);
      box-shadow: 7px 7px 0 var(--shadow);
    }

    .card-thumb {
      position: relative;
      width: 100%;
      height: 150px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border-bottom: 2px solid var(--foreground);
      font-size: 2.4rem;
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

    .card-body {
      padding: 14px;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 7px;
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

    .card-footer {
      padding: 12px 14px;
      border-top: 2px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .price-main {
      font-family: var(--font-heading);
      font-size: 1.1rem;
      font-weight: 900;
      color: var(--foreground);
    }

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
      display: inline-flex;
    }

    .buy-btn:hover { transform: translate(-1px, -1px); box-shadow: 4px 4px 0 var(--shadow); }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 48px 22px;
      background: var(--card);
      border: 2px solid var(--border);
      border-radius: var(--radius-xl);
    }

    .empty-state .icon { font-size: 2.5rem; margin-bottom: 12px; }

    .empty-state h3 {
      font-family: var(--font-heading);
      font-size: 1.2rem;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .empty-state p { color: var(--muted-foreground); font-size: 0.875rem; }

    @media (max-width: 980px) {
      .sidebar { display: none; }
      .search-bar { display: none; }
      .hero-badges { display: none; }
      .main { padding: 18px; }
      .product-grid { grid-template-columns: 1fr; }
      .hero-text h1 { font-size: 1.5rem; }
    }

    .thumb-purple { background: linear-gradient(135deg, #EDE9FE, #DDD6FE); }
    .thumb-pink { background: linear-gradient(135deg, #FCE7F3, #FBCFE8); }
    .thumb-amber { background: linear-gradient(135deg, #FEF3C7, #FDE68A); }
    .thumb-green { background: linear-gradient(135deg, #D1FAE5, #A7F3D0); }
    .thumb-blue { background: linear-gradient(135deg, #DBEAFE, #BFDBFE); }
    .thumb-red { background: linear-gradient(135deg, #FEE2E2, #FECACA); }
    .thumb-teal { background: linear-gradient(135deg, #CCFBF1, #99F6E4); }
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

  <a href="/dashboard/orders" class="btn btn-accent">My Orders</a>
</header>

<div class="page-wrapper">
  <aside class="sidebar">
    <div class="sidebar-section">
      <div class="sidebar-title">Category</div>
      <div class="filter-chip-group" id="categoryFilters"></div>
    </div>

    <div class="sidebar-divider"></div>

    <div class="sidebar-section">
      <div class="sidebar-title">Availability</div>
      <div class="filter-chip-group" id="availabilityFilters">
        <div class="filter-chip active" data-value="" onclick="toggleAvailability(this, '')">Any</div>
        <div class="filter-chip" data-value="available" onclick="toggleAvailability(this, 'available')">Available</div>
        <div class="filter-chip" data-value="out-of-stock" onclick="toggleAvailability(this, 'out-of-stock')">Out of stock</div>
        <div class="filter-chip" data-value="coming-soon" onclick="toggleAvailability(this, 'coming-soon')">Coming soon</div>
      </div>
    </div>

    <div class="sidebar-divider"></div>

    <div class="sidebar-section">
      <div class="sidebar-title">Price</div>
      <div class="controls">
        <input id="minPrice" type="number" min="0" placeholder="Min" />
        <input id="maxPrice" type="number" min="0" placeholder="Max" />
      </div>
      <button class="btn" style="width: 100%; justify-content: center;" onclick="applyPrice()">Apply Price</button>
    </div>

    <div class="sidebar-divider"></div>

    <div class="sidebar-section">
      <div class="sidebar-title">Type</div>
      <input id="typeInput" placeholder="Product type" onblur="applyType()" />
    </div>

    <button class="btn" style="width:100%; justify-content:center;" onclick="resetAllFilters()">Reset All Filters</button>
  </aside>

  <main class="main">
    <div class="hero-strip">
      <div class="hero-text">
        <h1>Premium Digital<br>Products <span>for Builders</span></h1>
        <p>Templates, UI kits, and plugins from live backend catalog.</p>
      </div>
      <div class="hero-badges">
        <div class="hero-badge">
          <span class="num" id="heroCount">0</span>
          <span class="label">Products</span>
        </div>
        <div class="hero-badge">
          <span class="num" id="heroSort">featured</span>
          <span class="label">Sort</span>
        </div>
      </div>
    </div>

    <div class="toolbar">
      <span class="result-count">Showing <span id="resultCount">0</span> products</span>
      <select class="sort-select" id="sortSelect" onchange="handleSort(this.value)">
        <option value="recommended">Featured</option>
        <option value="newest">Newest</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
    </div>

    <div class="product-grid" id="productGrid"></div>
  </main>
</div>

<script>
  const THUMBS = ['thumb-purple','thumb-pink','thumb-amber','thumb-green','thumb-blue','thumb-red','thumb-teal','thumb-orange'];
  const ICONS = ['🎨','🚀','📘','⚡','✅','🤖','🧩','📊','📱','📕','✍️','📈'];

  let state = {
    category: '',
    availability: '',
    min_price: '',
    max_price: '',
    type: '',
    sort: 'recommended',
    search: '',
  };

  let PRODUCTS = [];

  function toPrice(item) {
    const prices = Array.isArray(item.prices) ? item.prices : [];
    if (prices.length === 0) return null;
    const nums = prices.map((p) => Number.parseFloat(p.amount)).filter((n) => Number.isFinite(n));
    if (nums.length === 0) return null;
    return Math.min(...nums);
  }

  function normalizeProduct(item, index) {
    return {
      id: item.id,
      title: item.name,
      category: item.category?.slug || 'uncategorized',
      categoryName: item.category?.name || 'Uncategorized',
      desc: item.short_description || 'No description yet.',
      price: toPrice(item),
      status: item.status || 'available',
      slug: item.slug,
      thumb: THUMBS[index % THUMBS.length],
      icon: ICONS[index % ICONS.length],
      type: item.product_type || '',
    };
  }

  function buildParams() {
    const params = new URLSearchParams();
    if (state.category) params.set('category', state.category);
    if (state.availability) params.set('availability', state.availability);
    if (state.min_price) params.set('min_price', state.min_price);
    if (state.max_price) params.set('max_price', state.max_price);
    if (state.type) params.set('type', state.type);
    if (state.sort) params.set('sort', state.sort);
    params.set('per_page', '48');
    return params;
  }

  function statusBadge(status) {
    const map = {
      'available': ['badge-quaternary', 'Available'],
      'out-of-stock': ['badge-secondary', 'Out'],
      'coming-soon': ['badge-tertiary', 'Soon'],
    };
    const [cls, text] = map[status] || ['badge-muted', status];
    return `<span class="badge ${cls}">${text}</span>`;
  }

  function renderCategoryFilters() {
    const grouped = new Map();
    PRODUCTS.forEach((p) => {
      if (!grouped.has(p.category)) grouped.set(p.category, { label: p.categoryName, count: 0 });
      grouped.get(p.category).count += 1;
    });

    const root = document.getElementById('categoryFilters');
    const rows = [
      `<div class="filter-chip ${state.category === '' ? 'active' : ''}" data-value="" onclick="toggleCategory(this, '')">All Products <span class="chip-count">${PRODUCTS.length}</span></div>`
    ];

    [...grouped.entries()].sort((a, b) => a[1].label.localeCompare(b[1].label)).forEach(([slug, info]) => {
      rows.push(`<div class="filter-chip ${state.category === slug ? 'active' : ''}" data-value="${slug}" onclick="toggleCategory(this, '${slug}')">${info.label} <span class="chip-count">${info.count}</span></div>`);
    });

    root.innerHTML = rows.join('');
  }

  function getFiltered() {
    let list = [...PRODUCTS];
    if (state.search) {
      const q = state.search.toLowerCase();
      list = list.filter((p) => (p.title + ' ' + p.desc + ' ' + p.categoryName).toLowerCase().includes(q));
    }
    return list;
  }

  function render() {
    const filtered = getFiltered();
    const grid = document.getElementById('productGrid');
    document.getElementById('resultCount').textContent = String(filtered.length);
    document.getElementById('heroCount').textContent = String(filtered.length);
    document.getElementById('heroSort').textContent = state.sort;

    if (filtered.length === 0) {
      grid.innerHTML = `<div class="empty-state"><div class="icon">🔍</div><h3>No products found</h3><p>Try adjusting your filters or search query.</p></div>`;
      return;
    }

    grid.innerHTML = filtered.map((p, i) => `
      <article class="product-card" style="animation-delay:${i * 0.05}s">
        <div class="card-thumb ${p.thumb}">
          <div>${p.icon}</div>
          <div class="card-badge-top">${statusBadge(p.status)}</div>
        </div>
        <div class="card-body">
          <div class="card-category">${p.categoryName}</div>
          <div class="card-title">${p.title}</div>
          <div class="card-desc">${p.desc}</div>
        </div>
        <div class="card-footer">
          <div class="price-main">${p.price === null ? 'N/A' : '$' + p.price.toFixed(2)}</div>
          <a href="/products/${p.slug}" class="buy-btn">View Product</a>
        </div>
      </article>
    `).join('');
  }

  function syncUrl() {
    const params = buildParams();
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }

  async function fetchProducts() {
    const params = buildParams();
    syncUrl();
    const response = await fetch(`/api/products?${params.toString()}`);
    const payload = await response.json();
    const rows = Array.isArray(payload.data) ? payload.data : [];
    PRODUCTS = rows.map(normalizeProduct);
    renderCategoryFilters();
    render();
  }

  function toggleCategory(el, slug) {
    state.category = slug;
    document.querySelectorAll('#categoryFilters .filter-chip').forEach((chip) => chip.classList.remove('active'));
    el.classList.add('active');
    fetchProducts().catch(renderError);
  }

  function toggleAvailability(el, value) {
    state.availability = value;
    document.querySelectorAll('#availabilityFilters .filter-chip').forEach((chip) => chip.classList.remove('active'));
    el.classList.add('active');
    fetchProducts().catch(renderError);
  }

  function applyPrice() {
    state.min_price = document.getElementById('minPrice').value;
    state.max_price = document.getElementById('maxPrice').value;
    fetchProducts().catch(renderError);
  }

  function applyType() {
    state.type = document.getElementById('typeInput').value.trim();
    fetchProducts().catch(renderError);
  }

  function handleSearch(value) {
    state.search = value.trim();
    render();
  }

  function handleSort(value) {
    state.sort = value;
    fetchProducts().catch(renderError);
  }

  function resetAllFilters() {
    state = {
      category: '',
      availability: '',
      min_price: '',
      max_price: '',
      type: '',
      sort: 'recommended',
      search: '',
    };

    document.getElementById('globalSearch').value = '';
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    document.getElementById('typeInput').value = '';
    document.getElementById('sortSelect').value = 'recommended';
    document.querySelectorAll('#availabilityFilters .filter-chip').forEach((chip) => chip.classList.remove('active'));
    document.querySelector('#availabilityFilters .filter-chip[data-value=""]').classList.add('active');
    fetchProducts().catch(renderError);
  }

  function renderError() {
    document.getElementById('productGrid').innerHTML = `<div class="empty-state"><div class="icon">⚠️</div><h3>Unable to load products</h3><p>Please refresh and try again.</p></div>`;
  }

  function hydrateFromQuery() {
    const params = new URLSearchParams(window.location.search);
    state.category = params.get('category') || '';
    state.availability = params.get('availability') || '';
    state.min_price = params.get('min_price') || '';
    state.max_price = params.get('max_price') || '';
    state.type = params.get('type') || '';
    state.sort = params.get('sort') || 'recommended';

    document.getElementById('minPrice').value = state.min_price;
    document.getElementById('maxPrice').value = state.max_price;
    document.getElementById('typeInput').value = state.type;
    document.getElementById('sortSelect').value = state.sort;

    document.querySelectorAll('#availabilityFilters .filter-chip').forEach((chip) => {
      chip.classList.toggle('active', chip.dataset.value === state.availability);
    });
    if (!state.availability) {
      const any = document.querySelector('#availabilityFilters .filter-chip[data-value=""]');
      if (any) any.classList.add('active');
    }
  }

  hydrateFromQuery();
  fetchProducts().catch(renderError);
</script>
</body>
</html>
