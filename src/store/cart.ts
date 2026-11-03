import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = { id: string; qty: number };

type CartState = {
  lines: CartLine[];
  add: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (id) =>
        set((state) => {
          const hit = state.lines.find((line) => line.id === id);
          if (!hit) return { lines: [...state.lines, { id, qty: 1 }] };
          return {
            lines: state.lines.map((line) =>
              line.id === id ? { ...line, qty: Math.min(9, line.qty + 1) } : line,
            ),
          };
        }),
      setQty: (id, qty) =>
        set((state) => ({
          lines:
            qty <= 0
              ? state.lines.filter((line) => line.id !== id)
              : state.lines.map((line) =>
                  line.id === id ? { ...line, qty: Math.min(9, qty) } : line,
                ),
        })),
      clear: () => set({ lines: [] }),
    }),
    { name: "falak-cart" },
  ),
);

export type SavedOrder = {
  id: string;
  at: string;
  name: string;
  city: string;
  phone: string;
  note: string;
  total: number;
  lines: { name: string; qty: number; price: number }[];
  isGift?: boolean;
  giftRecipient?: string;
  giftMessage?: string;
};

export function saveOrder(order: SavedOrder) {
  try {
    const raw = localStorage.getItem("falak-orders");
    const prev: unknown = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(prev) ? prev : [];
    localStorage.setItem("falak-orders", JSON.stringify([order, ...list].slice(0, 20)));
  } catch {
    /* private mode or a full disk — the message can still be copied */
  }
}
