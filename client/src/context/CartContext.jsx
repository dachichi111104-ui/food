import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { getCart } from "../services/cart.service";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  const refreshCartCount = useCallback(async () => {
    if (!user || user.role !== "buyer") {
      setCartCount(0);
      return;
    }
    try {
      const cart = await getCart();
      const total = (cart.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
      setCartCount(total);
    } catch {
      setCartCount(0);
    }
  }, [user]);

  useEffect(() => {
    refreshCartCount();
  }, [refreshCartCount]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
