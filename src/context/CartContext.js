"use client";
import { createContext, useContext, useState, useMemo } from "react";
import toast from "react-hot-toast";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem("bakeryCart");
    return stored ? JSON.parse(stored) : [];
  });

  const updateCart = (newCart) => {
    setCartItems(newCart);
    localStorage.setItem("bakeryCart", JSON.stringify(newCart));
  };

  const addToCart = (product) => {
    const normalizedProduct = {
      id: product._id || product.id,
      name: product.name,
      price: product.price,
      size: product.size || null,
      image: product.image,
    };

    const existing = cartItems.find(
      (item) =>
        item.id === normalizedProduct.id &&
        item.size === normalizedProduct.size,
    );

    let updatedCart;

    if (existing) {
      updatedCart = cartItems.map((item) =>
        item.id === normalizedProduct.id && item.size === normalizedProduct.size
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      );
    } else {
      updatedCart = [...cartItems, { ...normalizedProduct, quantity: 1 }];
    }

    updateCart(updatedCart);
    toast.success("Added to cart 🛍️");
  };

  const increaseQty = (id, size) => {
    const updated = cartItems.map((item) =>
      item.id === id && item.size === size
        ? { ...item, quantity: item.quantity + 1 }
        : item,
    );
    updateCart(updated);
  };

  const decreaseQty = (id, size) => {
    const updated = cartItems
      .map((item) =>
        item.id === id && item.size === size
          ? { ...item, quantity: item.quantity - 1 }
          : item,
      )
      .filter((item) => item.quantity > 0);

    updateCart(updated);
  };

  const removeFromCart = (id, size) => {
    updateCart(
      cartItems.filter((item) => !(item.id === id && item.size === size)),
    );
  };

  const clearCart = () => {
    updateCart([]);
  };

  // ✅ Calculate total price safely
  const totalPrice = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => acc + Number(item.price) * item.quantity,
      0,
    );
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        increaseQty,
        decreaseQty,
        removeFromCart,
        clearCart,
        totalPrice, // ✅ Added here
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
