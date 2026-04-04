'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

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

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveCart(items);
  }, [items, loaded]);

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

  const clearCart = useCallback(() => setItems([]), []);

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
