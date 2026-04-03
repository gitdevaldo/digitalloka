'use client';

import { useState, useRef, useEffect } from 'react';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface SelectedItem {
  type: 'existing' | 'new';
  id?: number;
  name: string;
}

interface CategoryComboBoxProps {
  categories: Category[];
  selected: SelectedItem[];
  onChange: (items: SelectedItem[]) => void;
  inputClass: string;
}

export type { SelectedItem, Category };

export function CategoryComboBox({
  categories,
  selected,
  onChange,
  inputClass,
}: CategoryComboBoxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedIds = new Set(selected.filter(s => s.type === 'existing').map(s => s.id));
  const selectedNewNames = new Set(selected.filter(s => s.type === 'new').map(s => s.name.toLowerCase()));

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const exactMatch = categories.some(
    c => c.name.toLowerCase() === search.toLowerCase().trim()
  ) || selectedNewNames.has(search.toLowerCase().trim());

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function toggleCategory(cat: Category) {
    if (selectedIds.has(cat.id)) {
      onChange(selected.filter(s => !(s.type === 'existing' && s.id === cat.id)));
    } else {
      onChange([...selected, { type: 'existing', id: cat.id, name: cat.name }]);
    }
  }

  function addNewCategory() {
    const trimmed = search.trim();
    if (!trimmed) return;
    if (selectedNewNames.has(trimmed.toLowerCase())) return;
    onChange([...selected, { type: 'new', name: trimmed }]);
    setSearch('');
  }

  function removeItem(idx: number) {
    onChange(selected.filter((_, i) => i !== idx));
  }

  return (
    <div className="flex flex-col gap-1.5" ref={wrapperRef} style={{ position: 'relative' }}>
      <span className="text-[0.8rem] font-bold">Category</span>

      <div
        onClick={() => { setOpen(true); inputRef.current?.focus(); }}
        className={inputClass}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          alignItems: 'center',
          minHeight: '40px',
          cursor: 'text',
          paddingTop: '6px',
          paddingBottom: '6px',
        }}
      >
        {selected.map((item, idx) => (
          <span
            key={`${item.type}-${item.id || item.name}-${idx}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px 2px 10px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 700,
              border: item.type === 'new' ? '2px dashed var(--accent)' : '2px solid var(--border)',
              background: item.type === 'new' ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'var(--muted)',
              color: item.type === 'new' ? 'var(--accent)' : 'inherit',
              whiteSpace: 'nowrap',
            }}
          >
            {item.type === 'new' && (
              <span style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.7 }}>NEW</span>
            )}
            {item.name}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeItem(idx); }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.72rem',
                fontWeight: 900,
                color: 'var(--muted-foreground)',
                padding: '0 2px',
                lineHeight: 1,
              }}
            >
              x
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={search}
          onChange={(e) => { setSearch(e.target.value); if (!open) setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={selected.length === 0 ? 'Search or type new category...' : ''}
          autoComplete="off"
          style={{
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: '0.85rem',
            fontWeight: 500,
            flex: 1,
            minWidth: '120px',
            padding: 0,
          }}
        />
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
            border: '2.5px solid var(--border)',
            borderRadius: '10px',
            boxShadow: '4px 4px 0 var(--shadow)',
            maxHeight: '260px',
            overflowY: 'auto',
          }}
        >
          {filtered.length > 0 && (
            <div style={{ padding: '6px 10px 4px', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-foreground)' }}>
              Existing Categories
            </div>
          )}

          {filtered.map(c => {
            const isSelected = selectedIds.has(c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleCategory(c)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  textAlign: 'left',
                  padding: '9px 12px',
                  fontSize: '0.84rem',
                  fontWeight: isSelected ? 800 : 500,
                  background: isSelected ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'transparent',
                  color: isSelected ? 'var(--accent)' : 'inherit',
                  border: 'none',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--border)',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--muted)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = isSelected ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'transparent';
                }}
              >
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '18px',
                  height: '18px',
                  borderRadius: '4px',
                  border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                  background: isSelected ? 'var(--accent)' : 'transparent',
                  flexShrink: 0,
                  transition: 'all 0.12s',
                }}>
                  {isSelected && (
                    <span style={{ color: 'var(--accent-foreground)', fontSize: '0.65rem', fontWeight: 900 }}>✓</span>
                  )}
                </span>
                {c.name}
              </button>
            );
          })}

          {!exactMatch && search.trim() && (
            <div style={{
              borderTop: filtered.length > 0 ? '2px solid var(--border)' : 'none',
              margin: '0',
            }}>
              <div style={{ padding: '6px 10px 2px', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)' }}>
                Create New
              </div>
              <button
                type="button"
                onClick={addNewCategory}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 12px 12px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  background: 'transparent',
                  color: 'inherit',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'color-mix(in srgb, var(--accent) 8%, transparent)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  background: 'var(--accent)',
                  color: 'var(--accent-foreground)',
                  fontSize: '1rem',
                  fontWeight: 900,
                  flexShrink: 0,
                  boxShadow: '2px 2px 0 var(--shadow)',
                }}>+</span>
                <span style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.84rem' }}>
                    &quot;{search.trim()}&quot;
                  </span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--muted-foreground)', fontWeight: 600 }}>
                    Add as new category
                  </span>
                </span>
              </button>
            </div>
          )}

          {filtered.length === 0 && !search.trim() && (
            <div style={{ padding: '14px 12px', fontSize: '0.82rem', color: 'var(--muted-foreground)', textAlign: 'center' }}>
              No categories yet — type to create one
            </div>
          )}
        </div>
      )}
    </div>
  );
}
