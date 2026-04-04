'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
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
          .then(r => {
            if (r.status === 401) {
              setIsLoggedIn(false);
              setItems([]);
              setLoaded(true);
              return null;
            }
            return r.json();
          })
          .then(d => {
            if (d) {
              setItems(d.items || []);
            }
            setLoaded(true);
          })
          .catch(() => setLoaded(true));
      } else {
        setLoaded(true);
      }
    }).catch(() => {
      setIsLoggedIn(false);
      setLoaded(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        if (event === 'SIGNED_OUT') {
          setIsLoggedIn(false);
          setItems([]);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const isInWishlist = useCallback((productId: number) => items.includes(productId), [items]);

  const toggleWishlist = useCallback(async (productId: number): Promise<'added' | 'removed' | 'login_required'> => {
    if (!isLoggedIn) return 'login_required';

    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      });

      if (res.status === 401) {
        setIsLoggedIn(false);
        setItems([]);
        return 'login_required';
      }

      if (!res.ok) {
        return 'login_required';
      }

      const data = await res.json();

      if (data.action === 'added') {
        setItems(prev => [...prev, productId]);
      } else if (data.action === 'removed') {
        setItems(prev => prev.filter(id => id !== productId));
      }

      return data.action;
    } catch {
      return 'login_required';
    }
  }, [isLoggedIn]);

  const contextValue = useMemo(() => ({
    items, count: items.length, isInWishlist, toggleWishlist, isLoggedIn,
  }), [items, isInWishlist, toggleWishlist, isLoggedIn]);

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
