@extends('layouts.app', ['title' => 'Admin Products'])

@section('content')
<style>
  .product-grid { display: grid; gap: 12px; }
  .product-row {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--muted);
    border: 2px solid var(--border);
    border-radius: var(--radius-sm);
  }
  .product-row:hover { border-color: var(--accent); }
  .product-info h3 { font-size: 1rem; margin: 0 0 4px; }
  .product-meta { font-size: 0.8rem; color: var(--muted-foreground); }
  .product-actions { display: flex; gap: 8px; }
  
  .modal-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 200;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .modal-overlay.active { display: flex; }
  .modal {
    background: var(--card);
    border: 2px solid var(--foreground);
    border-radius: var(--radius-md);
    box-shadow: 6px 6px 0 var(--shadow);
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    padding: 20px;
  }
  .modal h2 { margin: 0 0 16px; }
  .form-group { margin-bottom: 14px; }
  .form-group label { display: block; font-weight: 700; font-size: 0.85rem; margin-bottom: 6px; }
  .form-group input, .form-group textarea { width: 100%; }
  .form-group textarea { min-height: 80px; resize: vertical; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  
  .featured-list { display: grid; gap: 10px; margin-top: 8px; }
  .featured-item {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr auto;
    gap: 8px;
    align-items: end;
    padding: 10px;
    background: var(--muted);
    border-radius: var(--radius-sm);
  }
  .featured-item input { font-size: 0.85rem; padding: 8px; }
  .featured-item .remove-btn {
    padding: 8px 12px;
    background: var(--secondary);
    font-size: 0.75rem;
  }
  
  .btn-row { display: flex; gap: 10px; margin-top: 16px; }
  .btn-sm { padding: 6px 12px; font-size: 0.8rem; }
  .btn-add { background: var(--quaternary); }
  .btn-save { background: var(--accent); }
  .btn-cancel { background: var(--muted); color: var(--foreground); }
  
  .loading { text-align: center; padding: 40px; color: var(--muted-foreground); }
  .error { color: #dc2626; font-size: 0.85rem; margin-top: 8px; }
</style>

<div class="card">
  <span class="chip">Admin</span>
  <h1>Admin Products</h1>
  <p class="muted">Manage products and featured highlights.</p>
  
  <div id="product-list" class="product-grid">
    <div class="loading">Loading products...</div>
  </div>
</div>

<div class="modal-overlay" id="editModal">
  <div class="modal">
    <h2>Edit Product</h2>
    <form id="editForm">
      <input type="hidden" id="editId">
      
      <div class="form-row">
        <div class="form-group">
          <label>Name</label>
          <input type="text" id="editName" readonly>
        </div>
        <div class="form-group">
          <label>Status</label>
          <select id="editStatus">
            <option value="available">Available</option>
            <option value="out-of-stock">Out of Stock</option>
            <option value="coming-soon">Coming Soon</option>
          </select>
        </div>
      </div>
      
      <div class="form-group">
        <label>Featured Highlights (shown on product page)</label>
        <div id="featuredList" class="featured-list"></div>
        <button type="button" class="btn btn-sm btn-add" onclick="addFeaturedItem()">Add Item</button>
      </div>
      
      <div id="editError" class="error" style="display:none;"></div>
      
      <div class="btn-row">
        <button type="submit" class="btn btn-save">Save Changes</button>
        <button type="button" class="btn btn-cancel" onclick="closeModal()">Cancel</button>
      </div>
    </form>
  </div>
</div>

<script>
let products = [];

async function loadProducts() {
  try {
    const res = await fetch('/api/admin/products');
    const data = await res.json();
    products = data.data || [];
    renderProducts();
  } catch (e) {
    document.getElementById('product-list').innerHTML = '<div class="error">Failed to load products</div>';
  }
}

function renderProducts() {
  const container = document.getElementById('product-list');
  if (!products.length) {
    container.innerHTML = '<div class="loading">No products found</div>';
    return;
  }
  
  container.innerHTML = products.map(p => `
    <div class="product-row">
      <div class="product-info">
        <h3>${escapeHtml(p.name)}</h3>
        <div class="product-meta">
          <span class="chip">${p.status || 'unknown'}</span>
          ${p.category ? `<span>${escapeHtml(p.category.name)}</span>` : ''}
          ${p.featured?.length ? `<span>• ${p.featured.length} featured items</span>` : ''}
        </div>
      </div>
      <div class="product-actions">
        <button class="btn btn-sm btn-ghost" onclick="openEdit(${p.id})">Edit</button>
      </div>
    </div>
  `).join('');
}

function openEdit(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;
  
  document.getElementById('editId').value = product.id;
  document.getElementById('editName').value = product.name;
  document.getElementById('editStatus').value = product.status || 'available';
  
  const featured = product.featured || [];
  renderFeaturedItems(featured);
  
  document.getElementById('editError').style.display = 'none';
  document.getElementById('editModal').classList.add('active');
}

function renderFeaturedItems(items) {
  const container = document.getElementById('featuredList');
  container.innerHTML = items.map((item, i) => `
    <div class="featured-item" data-index="${i}">
      <div>
        <label style="font-size:0.7rem;color:var(--muted-foreground)">Label</label>
        <input type="text" class="feat-label" value="${escapeHtml(item.label || '')}" placeholder="e.g. Type">
      </div>
      <div>
        <label style="font-size:0.7rem;color:var(--muted-foreground)">Value</label>
        <input type="text" class="feat-value" value="${escapeHtml(item.value || '')}" placeholder="e.g. Account">
      </div>
      <div>
        <label style="font-size:0.7rem;color:var(--muted-foreground)">Sub</label>
        <input type="text" class="feat-sub" value="${escapeHtml(item.sub || '')}" placeholder="e.g. Digital">
      </div>
      <button type="button" class="btn btn-sm remove-btn" onclick="removeFeaturedItem(${i})">Remove</button>
    </div>
  `).join('');
}

function addFeaturedItem() {
  const container = document.getElementById('featuredList');
  const items = getFeaturedItems();
  items.push({ label: '', value: '', sub: '' });
  renderFeaturedItems(items);
}

function removeFeaturedItem(index) {
  const items = getFeaturedItems();
  items.splice(index, 1);
  renderFeaturedItems(items);
}

function getFeaturedItems() {
  const items = [];
  document.querySelectorAll('.featured-item').forEach(el => {
    items.push({
      label: el.querySelector('.feat-label').value.trim(),
      value: el.querySelector('.feat-value').value.trim(),
      sub: el.querySelector('.feat-sub').value.trim()
    });
  });
  return items;
}

function closeModal() {
  document.getElementById('editModal').classList.remove('active');
}

document.getElementById('editForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const id = document.getElementById('editId').value;
  const product = products.find(p => p.id == id);
  if (!product) return;
  
  const featured = getFeaturedItems().filter(f => f.label && f.value);
  
  const payload = {
    name: product.name,
    slug: product.slug,
    status: document.getElementById('editStatus').value,
    featured: featured.length ? featured : null
  };
  
  try {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Update failed');
    }
    
    closeModal();
    loadProducts();
  } catch (err) {
    document.getElementById('editError').textContent = err.message;
    document.getElementById('editError').style.display = 'block';
  }
});

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

loadProducts();
</script>
@endsection
