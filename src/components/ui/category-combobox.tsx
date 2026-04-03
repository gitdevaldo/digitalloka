'use client';

import { useState, useRef, useEffect } from 'react';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface CategoryComboBoxProps {
  categories: Category[];
  categoryId: string;
  categoryName: string;
  onSelect: (id: string) => void;
  onNewName: (name: string) => void;
  inputClass: string;
}

export function CategoryComboBox({
  categories,
  categoryId,
  categoryName,
  onSelect,
  onNewName,
  inputClass,
}: CategoryComboBoxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedCategory = categories.find(c => String(c.id) === categoryId);

  const displayValue = selectedCategory
    ? selectedCategory.name
    : categoryName || search;

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes((search || displayValue).toLowerCase())
  );

  const exactMatch = categories.some(
    c => c.name.toLowerCase() === (search || displayValue).toLowerCase().trim()
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleInputChange(val: string) {
    setSearch(val);
    onNewName(val);
    if (!open) setOpen(true);
  }

  function handleSelect(cat: Category) {
    onSelect(String(cat.id));
    setSearch('');
    setOpen(false);
  }

  function handleAddNew() {
    const trimmed = (search || displayValue).trim();
    if (!trimmed) return;
    onNewName(trimmed);
    setSearch('');
    setOpen(false);
  }

  return (
    <div className="flex flex-col gap-1.5" ref={wrapperRef} style={{ position: 'relative' }}>
      <span className="text-[0.8rem] font-bold">Category</span>
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          value={displayValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setOpen(true)}
          className={inputClass}
          placeholder="Select or type new category..."
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => { setOpen(!open); inputRef.current?.focus(); }}
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.7rem',
            color: 'var(--muted-foreground)',
            padding: '4px',
          }}
        >
          {open ? '▲' : '▼'}
        </button>
      </div>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 50,
            marginTop: '4px',
            background: 'var(--card)',
            border: '2px solid var(--border)',
            borderRadius: '8px',
            boxShadow: '4px 4px 0 var(--shadow)',
            maxHeight: '220px',
            overflowY: 'auto',
          }}
        >
          {filtered.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => handleSelect(c)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '8px 12px',
                fontSize: '0.82rem',
                fontWeight: String(c.id) === categoryId ? 800 : 500,
                background: String(c.id) === categoryId ? 'var(--accent)' : 'transparent',
                color: String(c.id) === categoryId ? 'var(--accent-foreground)' : 'inherit',
                border: 'none',
                cursor: 'pointer',
                borderBottom: '1px solid var(--border)',
              }}
              onMouseEnter={(e) => {
                if (String(c.id) !== categoryId) {
                  (e.target as HTMLElement).style.background = 'var(--muted)';
                }
              }}
              onMouseLeave={(e) => {
                if (String(c.id) !== categoryId) {
                  (e.target as HTMLElement).style.background = 'transparent';
                }
              }}
            >
              {c.name}
            </button>
          ))}

          {!exactMatch && (search || categoryName) && (search || categoryName).trim() && (
            <button
              type="button"
              onClick={handleAddNew}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                width: '100%',
                textAlign: 'left',
                padding: '8px 12px',
                fontSize: '0.82rem',
                fontWeight: 700,
                background: 'transparent',
                color: 'var(--accent)',
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.background = 'var(--muted)'; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.background = 'transparent'; }}
            >
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '18px',
                height: '18px',
                borderRadius: '4px',
                border: '2px solid var(--accent)',
                fontSize: '0.75rem',
                fontWeight: 900,
              }}>+</span>
              Add &quot;{(search || categoryName).trim()}&quot;
            </button>
          )}

          {filtered.length === 0 && !search && !categoryName && (
            <div style={{ padding: '10px 12px', fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
              No categories yet. Type to create one.
            </div>
          )}
        </div>
      )}

      {categoryName && !categoryId && (
        <span style={{
          fontSize: '0.7rem',
          color: 'var(--accent)',
          fontWeight: 700,
          marginTop: '2px',
        }}>
          New category will be created: &quot;{categoryName}&quot;
        </span>
      )}
    </div>
  );
}
