"use client";

import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";

export default function AddToCartButton({ product, disabled = false }) {
  const { addToCart } = useCart();
  const [showModal, setShowModal] = useState(false);
  const defaultSize =
    product.sizes?.find((s) => s.isDefault) || product.sizes?.[0];

  const [selectedSize, setSelectedSize] = useState(defaultSize?.label || "");

  useEffect(() => {
    if (showModal) {
      const defaultSize =
        product.sizes?.find((s) => s.isDefault) || product.sizes?.[0];
      setSelectedSize(defaultSize?.label || "");
    }
  }, [showModal, product]);

  const handleAddToCart = () => {
    if (product.sizes?.length > 0) {
      setShowModal(true);
    } else {
      addToCart({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
      });
    }
  };

  const handleConfirmSize = () => {
    // only for cakes (products having sizes)
    if (product.sizes?.length) {
      const selected = product.sizes.find((s) => s.label === selectedSize);

      addToCart({
        id: `${product._id}-${selectedSize}`,
        _id: product._id,
        name: product.name,
        price: selected?.price,
        size: selectedSize,
        image: product.image,
      });
    } else {
      // normal products
      addToCart({
        id: product._id,
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
      });
    }

    setShowModal(false);
  };

  return (
    <>
      <button
        onClick={handleAddToCart}
        disabled={disabled}
        className={`w-full font-semibold py-2 rounded-lg transition cursor-pointer ${
          product.inStock
            ? "bg-accent text-primary hover:opacity-90"
            : "bg-gray-400 text-gray-600 cursor-not-allowed"
        }`}
      >
        {product.inStock ? "Add to Cart" : "Out of Stock"}
      </button>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowModal(false)} // click outside close
        >
          {/* Modal Box */}
          <div
            onClick={(e) => e.stopPropagation()} // prevent close on inside click
            className="bg-white rounded-xl shadow-xl w-[90%] max-w-md p-6 relative 
                       animate-in zoom-in-95 fade-in duration-200"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl font-bold cursor-pointer"
            >
              ✕
            </button>

            <h2 className="text-lg font-bold mb-4 text-center">
              Select Cake Size
            </h2>

            <div className="space-y-3 mb-6">
              {product.sizes?.map((s) => (
                <label
                  key={s.label}
                  className="flex items-center cursor-pointer"
                >
                  <input
                    type="radio"
                    name="cake-size"
                    value={s.label}
                    checked={selectedSize === s.label}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-4 h-4 mr-3"
                  />
                  <span>
                    {s.label} - ₹{s.price}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex justify-center">
              <button
                disabled={disabled}
                onClick={handleConfirmSize}
                className="px-6 py-2 bg-accent text-primary font-semibold rounded-lg hover:opacity-90 transition cursor-pointer"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
