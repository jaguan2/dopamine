import { createContext, useContext, useEffect, useMemo, useState } from "react";

// Cart lines key on price_option_id (an item size IS a distinct line).
// Name/label/price are display snapshots; the server reprices everything
// from the database when the order is placed.
const CartContext = createContext(null);

const STORAGE_KEY = "oec-cart-v1";

export function CartProvider({ children }) {
  const [lines, setLines] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines]);

  function add(priceOptionId, itemName, priceLabel, unitPriceCents) {
    setLines((prev) => {
      const found = prev.find((l) => l.price_option_id === priceOptionId);
      if (found) {
        return prev.map((l) =>
          l.price_option_id === priceOptionId
            ? { ...l, quantity: Math.min(l.quantity + 1, 20) }
            : l
        );
      }
      return [
        ...prev,
        {
          price_option_id: priceOptionId,
          item_name: itemName,
          price_label: priceLabel,
          unit_price_cents: unitPriceCents,
          quantity: 1,
          instructions: "",
        },
      ];
    });
  }

  // One note per line. Ordering the same dish twice with different notes
  // isn't expressible — the kitchen reads the order-level notes for that.
  function setInstructions(priceOptionId, text) {
    setLines((prev) =>
      prev.map((l) =>
        l.price_option_id === priceOptionId
          ? { ...l, instructions: text.slice(0, 300) }
          : l
      )
    );
  }

  function setQty(priceOptionId, quantity) {
    setLines((prev) =>
      quantity < 1
        ? prev.filter((l) => l.price_option_id !== priceOptionId)
        : prev.map((l) =>
            l.price_option_id === priceOptionId
              ? { ...l, quantity: Math.min(quantity, 20) }
              : l
          )
    );
  }

  function clear() {
    setLines([]);
  }

  const count = useMemo(
    () => lines.reduce((n, l) => n + l.quantity, 0),
    [lines]
  );
  const subtotalCents = useMemo(
    () => lines.reduce((n, l) => n + l.unit_price_cents * l.quantity, 0),
    [lines]
  );

  const value = {
    lines, add, setQty, setInstructions, clear, count, subtotalCents,
    drawerOpen, setDrawerOpen,
  };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
