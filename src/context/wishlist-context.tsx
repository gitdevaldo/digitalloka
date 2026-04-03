'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

interface WishlistContextType {
  items: number[];
  count: number;
  isInWishlist: (productId: number) => boolean;
  toggleWishlist: (productId: number) => Promise<'added' | 'removed' | 'login_required'>;
  isLoggedIn: boolean;
}

const WishlistContext = createContext<WishlistContextType>({
  items: [],
  count: 0,
  isInWishlist: () => false,
  toggleWishlist: async () => 'login_required',
  isLoggedIn: false,
});

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<number[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const loggedIn = !!data.session;
      setIsLoggedIn(loggedIn);
      if (loggedIn) {
        fetch('/api/wishlist')
          .then(r => r.json())
          .then(d => { setItems(d.items || []); setLoaded(true); })
          .catch(() => setLoaded(true));
      } else {
        setLoaded(true);
      }
    });
  }, []);

  const isInWishlist = useCallback((productId: number) => items.includes(productId), [items]);

  const toggleWishlist = useCallback(async (productId: number): Promise<'added' | 'removed' | 'login_required'> => {
    if (!isLoggedIn) return 'login_required';

    const res = await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId }),
    });
    const data = await res.json();

    if (data.action === 'added') {
      setItems(prev => [...prev, productId]);
    } else if (data.action === 'removed') {
      setItems(prev => prev.filter(id => id !== productId));
    }

    return data.action;
  }, [isLoggedIn]);

  return (
    <WishlistContext.Provider value={{ items, count: items.length, isInWishlist, toggleWishlist, isLoggedIn }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}

