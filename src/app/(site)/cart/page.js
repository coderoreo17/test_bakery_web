"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cartItems, removeFromCart, increaseQty, decreaseQty, totalPrice } =
    useCart();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 🔴 Prevent hydration mismatch
  if (!mounted) return null;

  return (
    <div className="bg-secondary min-h-screen py-16">
      <div className="max-w-6xl mx-auto px-6 my-10">
        <h1 className="text-4xl font-bold mb-10 text-center">Your Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-600 mb-6">Your cart is currently empty.</p>
            <Link
              href="/shop"
              className="bg-accent text-primary px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="md:col-span-2 space-y-6">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-md p-6 flex justify-between items-center"
                >
                  <div className="flex items-center gap-4">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-21 h-21 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <h2 className="font-semibold text-lg">
                        {item.name}
                        {item.size && (
                          <span className="ml-1.5 text-sm bg-gray-100 px-2 py-1 rounded">
                            {item.size}
                          </span>
                        )}
                      </h2>
                      <p className="text-accent font-bold">
                        ₹{item.price * item.quantity}
                      </p>
                      <div className="flex items-center gap-3 mt-4">
                        <button
                          onClick={() => decreaseQty(item.id, item.size)}
                          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition cursor-pointer"
                        >
                          -
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          onClick={() => increaseQty(item.id, item.size)}
                          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id, item.size)}
                    className="text-red-500 hover:underline transition cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-md p-6 h-fit">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

              <div className="flex justify-between mb-4">
                <span>Total</span>
                <span className="font-bold text-accent">₹{totalPrice}</span>
              </div>

              <Link
                href="/checkout"
                className="block w-full text-center bg-primary text-white p-3 rounded-lg hover:bg-darkBrown transition"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
