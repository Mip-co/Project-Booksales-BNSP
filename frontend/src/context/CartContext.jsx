import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);
const LEGACY_CART_KEY = 'booksales_cart'; // key lama (satu keranjang untuk semua akun)

/** Keranjang disimpan per akun: booksales_cart_<id user>, atau booksales_cart_guest jika belum login. */
const cartKeyFor = (user) => `booksales_cart_${user?.id ?? 'guest'}`;

function readStoredCart(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? [];
  } catch {
    return [];
  }
}

/**
 * Catatan: harga di keranjang HANYA untuk tampilan.
 * Saat checkout, front-end hanya mengirim { book_id, qty };
 * total yang sebenarnya dihitung ulang oleh server.
 */
export function CartProvider({ children }) {
  const { user } = useAuth();
  const key = cartKeyFor(user);
  const isAdmin = user?.role === 'admin';

  // Isi keranjang disimpan bersama key miliknya, sehingga saat akun berganti
  // (login / logout) keranjang akun lama tidak ikut terbawa atau tertimpa.
  const [store, setStore] = useState(() => ({ key, items: readStoredCart(key) }));
  if (store.key !== key) {
    // Akun berganti -> muat keranjang milik akun yang baru (pola "adjust state during render").
    setStore({ key, items: readStoredCart(key) });
  }
  const items = store.key === key ? store.items : [];
  const setItems = useCallback(
    (updater) => setStore((s) => ({ ...s, items: updater(s.items) })),
    []
  );

  useEffect(() => {
    try {
      localStorage.setItem(store.key, JSON.stringify(store.items));
    } catch {
      // penyimpanan penuh / diblokir — keranjang tetap jalan di memori
    }
  }, [store]);

  // Bersihkan keranjang lama (key tanpa id user) yang kini tidak dipakai lagi.
  useEffect(() => {
    try {
      localStorage.removeItem(LEGACY_CART_KEY);
    } catch {
      // diabaikan
    }
  }, []);

  const add = useCallback((book, qty = 1) => {
    if (isAdmin) return; // Admin tidak berbelanja
    setItems((prev) => {
      const existing = prev.find((i) => i.id === book.id);
      const snapshot = {
        id: book.id,
        title: book.title,
        author: book.author?.name ?? '',
        cover_url: book.cover_url,
        price: Number(book.price),
        stock: book.stock,
      };
      if (existing) {
        return prev.map((i) =>
          i.id === book.id ? { ...i, ...snapshot, qty: Math.min(i.qty + qty, book.stock) } : i
        );
      }
      return [...prev, { ...snapshot, qty: Math.min(qty, book.stock) }];
    });
  }, [isAdmin, setItems]);

  const setQty = useCallback((id, qty) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(qty, i.stock)) } : i))
    );
  }, [setItems]);

  const remove = useCallback((id) => setItems((prev) => prev.filter((i) => i.id !== id)), [setItems]);
  const clear = useCallback(() => setItems(() => []), [setItems]);

  const totalQty = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((sum, i) => sum + i.qty * i.price, 0), [items]);

  const value = useMemo(
    () => ({ items, add, setQty, remove, clear, totalQty, totalPrice }),
    [items, add, setQty, remove, clear, totalQty, totalPrice]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart harus dipakai di dalam <CartProvider>');
  return ctx;
}
