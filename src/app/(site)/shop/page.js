"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");

  const searchParams = useSearchParams();
  const router = useRouter();

  const category = searchParams.get("category") || "";

  // 🔥 Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      const params = new URLSearchParams();

      if (search) params.append("search", search);
      if (category) params.append("category", category);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();

      setProducts(data.products);
      setCategories(data.categories);
    };

    fetchProducts();
  }, [search, category]);

  return (
    <div className="bg-secondary min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-6 my-10">
        {/* Heading */}
        <div className="text-center my-10">
          <h1 className="text-4xl font-bold mb-4">Our Products</h1>
          <p className="text-gray-600">
            Freshly baked delights crafted with love.
          </p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          {/* Search */}
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-4 py-2 w-full md:w-1/3"
          />

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => {
              const value = e.target.value;
              const params = new URLSearchParams(searchParams.toString());

              if (value) {
                params.set("category", value);
              } else {
                params.delete("category");
              }

              router.push(`/shop?${params.toString()}`);
            }}
            className="border rounded-lg px-4 py-2"
          >
            <option value="">All Categories</option>

            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.length > 25 ? cat.slice(0, 25) + "..." : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Products */}
        {products.length === 0 ? (
          <p className="text-center text-gray-500">No products found.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                showDetailsLink={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
