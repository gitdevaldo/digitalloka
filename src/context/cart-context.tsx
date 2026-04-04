'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export interface CartItem {
  productId: number;
  quantity: number;
  selectedStockId?: number;
  selectedRegion?: string;
  selectedImage?: string;
}

interface CartContextType {
  items: CartItem[];
  count: number;
  hydrated: boolean;
  addItem: (productId: number, qty?: number, options?: { selectedStockId?: number; selectedRegion?: string; selectedImage?: string }) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, qty: number) => void;
  clearCart: () => void;
  isInCart: (productId: number) => boolean;
}

const CartContext = createContext<CartContextType>({
  items: [],
  count: 0,
  hydrated: false,
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  isInCart: () => false,
});

const STORAGE_KEY = 'digitalloka_cart';

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function mergeCartItems(local: CartItem[], server: CartItem[]): CartItem[] {
  const merged = new Map<number, number>();
  for (const item of server) {
    merged.set(item.productId, item.quantity);
  }
  for (const item of local) {
    const existing = merged.get(item.productId);
    if (existing !== undefined) {
      merged.set(item.productId, Math.max(existing, item.quantity));
    } else {
      merged.set(item.productId, item.quantity);
    }
  }
  return Array.from(merged.entries()).map(([productId, quantity]) => ({ productId, quantity }));
}

async function fetchAndMergeServerCart(localItems: CartItem[]): Promise<{ items: CartItem[]; synced: boolean }> {
  try {
    const res = await fetch('/api/user/cart');
    if (!res.ok) return { items: localItems, synced: false };

    const serverData = await res.json();
    const serverItems: CartItem[] = serverData.items || [];
    const merged = mergeCartItems(localItems, serverItems);

    const needsSync = merged.length !== serverItems.length || merged.some(m => {
      const s = serverItems.find(si => si.productId === m.productId);
      return !s || s.quantity !== m.quantity;
    });

    if (needsSync) {
      fetch('/api/user/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: merged }),
      }).catch(() => {});
    }

    return { items: merged, synced: true };
  } catch {
    return { items: localItems, synced: false };
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialSyncDoneRef = useRef(false);

  useEffect(() => {
    const localItems = loadCart();
    const supabase = createSupabaseBrowserClient();

    supabase.auth.getSession().then(async ({ data }) => {
      const loggedIn = !!data.session;
      setIsLoggedIn(loggedIn);

      if (loggedIn) {
        const result = await fetchAndMergeServerCart(localItems);
        setItems(result.items);
        saveCart(result.items);
        initialSyncDoneRef.current = result.synced;
      } else {
        setItems(localItems);
      }
      setLoaded(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN') {
        setIsLoggedIn(true);
        const currentLocal = loadCart();
        const result = await fetchAndMergeServerCart(currentLocal);
        setItems(result.items);
        saveCart(result.items);
        initialSyncDoneRef.current = result.synced;
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        initialSyncDoneRef.current = false;
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
          syncTimeoutRef.current = null;
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  const syncToServer = useCallback((newItems: CartItem[]) => {
    if (!isLoggedIn || !initialSyncDoneRef.current) return;
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      fetch('/api/user/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: newItems }),
      }).catch(() => {});
    }, 500);
  }, [isLoggedIn]);

  useEffect(() => {
    if (loaded) {
      saveCart(items);
      syncToServer(items);
    }
  }, [items, loaded, syncToServer]);

  const addItem = useCallback((productId: number, qty = 1, options?: { selectedStockId?: number; selectedRegion?: string; selectedImage?: string }) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === productId);
      if (existing) {
        return prev.map(i => i.productId === productId ? {
          ...i,
          quantity: i.quantity + qty,
          ...(options?.selectedStockId !== undefined && { selectedStockId: options.selectedStockId }),
          ...(options?.selectedRegion !== undefined && { selectedRegion: options.selectedRegion }),
          ...(options?.selectedImage !== undefined && { selectedImage: options.selectedImage }),
        } : i);
      }
      return [...prev, {
        productId,
        quantity: qty,
        ...(options?.selectedStockId !== undefined && { selectedStockId: options.selectedStockId }),
        ...(options?.selectedRegion !== undefined && { selectedRegion: options.selectedRegion }),
        ...(options?.selectedImage !== undefined && { selectedImage: options.selectedImage }),
      }];
    });
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems(prev => prev.filter(i => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, qty: number) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => i.productId !== productId));
    } else {
      setItems(prev => prev.map(i => i.productId === productId ? { ...i, quantity: qty } : i));
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    if (isLoggedIn) {
      fetch('/api/user/cart', { method: 'DELETE' }).catch(() => {});
    }
  }, [isLoggedIn]);

  const isInCart = useCallback((productId: number) => items.some(i => i.productId === productId), [items]);

  const count = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, count, hydrated: loaded, addItem, removeItem, updateQuantity, clearCart, isInCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
