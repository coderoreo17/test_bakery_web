"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [filterCategory, setFilterCategory] = useState("");
  const [editImage, setEditImage] = useState(null);
  const [fileKey, setFileKey] = useState(Date.now());
  const [sizes, setSizes] = useState([{ label: "1/2 Kg", price: "" }]);
  const [editData, setEditData] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    image: "",
  });

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    image: null,
  });

  async function fetchProducts() {
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(data);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("category", form.category);
    formData.append("description", form.description);
    formData.append("image", form.image);

    if (form.category === "Cakes") {
      formData.append("sizes", JSON.stringify(sizes));
    } else {
      formData.append("price", form.price);
    }

    await fetch("/api/admin/products", {
      method: "POST",
      body: formData,
    });

    setForm({
      name: "",
      price: "",
      category: "",
      description: "",
      image: null,
    });

    setSizes([{ label: "1/2 Kg", price: "" }]);
    setFileKey(Date.now());

    fetchProducts();
  }

  async function deleteProduct(id) {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      fetchProducts();
    } else {
      toast("Failed to delete product", { type: "error" });
    }
  }

  async function toggleStock(id) {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
    });

    if (res.ok) {
      fetchProducts();
      toast("Stock status updated", { type: "success" });
    } else {
      toast("Failed to update stock status", { type: "error" });
    }
  }

  async function updateProduct(id) {
    const formData = new FormData();
    formData.append("name", editData.name);
    formData.append("category", editData.category);
    formData.append("description", editData.description);

    if (editData.sizes?.length) {
      formData.append("sizes", JSON.stringify(editData.sizes));
    } else {
      formData.append("price", editData.price);
    }

    if (editImage) {
      formData.append("image", editImage);
    }

    await fetch(`/api/admin/products/${id}`, {
      method: "PUT",
      body: formData,
    });

    setEditingId(null);
    setEditImage(null);
    fetchProducts();
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory = filterCategory
      ? product.category === filterCategory
      : true;

    return matchesSearch && matchesCategory;
  });
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Manage Products</h1>

      {/* Add Product Form */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-10 max-w-md">
        <input
          type="text"
          placeholder="Product Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border p-2 rounded"
          required
        />

        {form.category === "Cakes" ? (
          <div className="space-y-2">
            <label className="font-medium">Sizes & Prices</label>

            {sizes.map((size, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Size (e.g. 1/2 Kg)"
                  value={size.label}
                  onChange={(e) => {
                    const newSizes = [...sizes];
                    newSizes[index].label = e.target.value;
                    setSizes(newSizes);
                  }}
                  className="border p-2 rounded w-1/2"
                />

                <input
                  type="number"
                  placeholder="Price"
                  value={size.price}
                  onChange={(e) => {
                    const newSizes = [...sizes];
                    newSizes[index].price = e.target.value;
                    setSizes(newSizes);
                  }}
                  className="border p-2 rounded w-1/2"
                />

                <button
                  type="button"
                  onClick={() => setSizes(sizes.filter((_, i) => i !== index))}
                  className="px-2 bg-red-500 text-white rounded"
                >
                  ×
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setSizes([...sizes, { label: "", price: "" }])}
              className="bg-gray-200 px-3 py-1 rounded"
            >
              + Add Size
            </button>
          </div>
        ) : (
          <input
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="w-full border p-2 rounded"
            required
          />
        )}

        {/* ✅ Category Selector */}
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">Select Category</option>
          <option value="Cakes">Cakes</option>
          <option value="Pastries and more">Pastries and more</option>
          <option value="Beverages">Beverages</option>
          <option value="Snacks">Snacks</option>
          <option value="Desserts">Desserts</option>
        </select>

        <input
          key={fileKey}
          type="file"
          accept="image/*"
          onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
          className="w-full border p-2 rounded"
        />

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full border p-2 rounded"
        />

        <button className="bg-black text-white px-4 py-2 rounded cursor-pointer hover:bg-gray-800 transition-colors">
          Add Product
        </button>
      </form>

      {/* 🔍 Search + Filter */}
      <div className="flex gap-4 mb-4 max-w-2xl">
        <input
          type="text"
          placeholder="Search product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 w-full rounded"
        />

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Select Category</option>
          <option value="Cakes">Cakes</option>
          <option value="Pastries and more">Pastries and more</option>
          <option value="Beverages">Beverages</option>
          <option value="Snacks">Snacks</option>
          <option value="Desserts">Desserts</option>
        </select>
      </div>

      {/* Products Table */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Image</th> {/* ✅ NEW */}
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Price</th>
            <th className="p-2 border">Category</th>
            <th className="p-2 border">Description</th>
            <th className="p-2 border">Stock</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product) => (
            <tr key={product._id}>
              {/*  Image */}
              <td className="p-2 border text-center align-middle">
                {editingId === product._id ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative w-16 h-16 group cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        id={`editImageUpload-${product._id}`}
                        onChange={(e) => setEditImage(e.target.files[0])}
                        className="hidden"
                      />

                      <Image
                        src={
                          editImage
                            ? URL.createObjectURL(editImage)
                            : editData.image
                        }
                        alt="Preview"
                        fill
                        className="object-cover rounded"
                      />

                      <label
                        htmlFor={`editImageUpload-${product._id}`}
                        className="absolute inset-0 
    bg-black/30 backdrop-blur-sm 
    flex items-center justify-center 
    rounded opacity-0 
    group-hover:opacity-100 
    transition duration-300
    cursor-pointer"
                      >
                        <span className="text-white text-xl font-bold">+</span>
                      </label>
                    </div>
                  </div>
                ) : (
                  product.image && (
                    <div className="flex justify-center items-center">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover rounded cursor-pointer"
                        onClick={() => setPreviewImage(product.image)}
                      />
                    </div>
                  )
                )}
              </td>
              {/* Name */}
              <td className="p-2 border text-center">
                {editingId === product._id ? (
                  <input
                    value={editData.name}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                    className="border p-1 rounded"
                  />
                ) : (
                  product.name
                )}
              </td>

              {/* Price */}
              <td className="p-2 border text-center">
                {editingId === product._id ? (
                  product.sizes?.length ? (
                    <div className="flex flex-col items-center space-y-1">
                      {editData.sizes?.map((size, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <span className="bg-amber-100 px-2 py-0.5 rounded">
                            {size.label}
                          </span>

                          <input
                            type="number"
                            value={size.price}
                            onChange={(e) => {
                              const updated = [...editData.sizes];
                              updated[i].price = e.target.value;
                              setEditData({ ...editData, sizes: updated });
                            }}
                            className="border p-1 rounded w-20 text-center"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="number"
                      value={editData.price}
                      onChange={(e) =>
                        setEditData({ ...editData, price: e.target.value })
                      }
                      className="border p-1 rounded"
                    />
                  )
                ) : product.sizes?.length ? (
                  <div className="flex flex-col items-center">
                    {product.sizes.map((s, i) => (
                      <div key={i} className="text-center">
                        {s.label} = ₹{s.price}
                      </div>
                    ))}
                  </div>
                ) : (
                  `₹${product.price}`
                )}
              </td>

              {/* ✅ Category Column */}
              <td className="p-2 border text-center">
                {editingId === product._id ? (
                  <select
                    value={editData.category}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        category: e.target.value,
                      })
                    }
                    className="border p-1 rounded"
                  >
                    <option value="Cakes">Cakes</option>
                    <option value="Pastries">Pastries</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Juices">Juices</option>
                    <option value="Snacks">Snacks</option>
                  </select>
                ) : (
                  product.category
                )}
              </td>

              {/* ✅ Description Column */}
              <td className="p-2 border text-center">
                {editingId === product._id ? (
                  <input
                    value={editData.description}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        description: e.target.value,
                      })
                    }
                    className="border p-1 rounded w-full"
                  />
                ) : (
                  product.description
                )}
              </td>

              {/* Stock Column */}
              <td className="p-2 border text-center">
                <span className={`px-2 py-1 rounded text-sm ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </td>

              {/* Actions */}
              <td className="p-2 border text-center space-x-2">
                {editingId === product._id ? (
                  <>
                    <button
                      onClick={() => updateProduct(product._id)}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors cursor-pointer"
                    >
                      Save
                    </button>

                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditingId(product._id);
                        setEditData({
                          name: product.name,
                          price: product.price,
                          category: product.category,
                          description: product.description,
                          image: product.image,
                          sizes: product.sizes || [],
                        });
                      }}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors cursor-pointer"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteProduct(product._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>

                    <button
                      onClick={() => toggleStock(product._id)}
                      className={`px-3 py-1 rounded hover:opacity-80 transition-colors cursor-pointer ${product.inStock ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'}`}
                    >
                      {product.inStock ? 'Mark Out of Stock' : 'Mark In Stock'}
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* ✅ Image Dialog Modal */}
      {previewImage && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
          <div className="relative bg-white p-6 rounded-xl shadow-2xl max-w-3xl w-full flex justify-center">
            {/* Close Button */}
            <button
              className="absolute top-2 right-4 text-2xl font-bold text-gray-600 hover:text-black transition-colors cursor-pointer"
              onClick={() => setPreviewImage(null)}
            >
              ×
            </button>

            {/* Large Image */}
            <Image
              src={previewImage}
              alt="Preview"
              width={600}
              height={400}
              className="max-h-[80vh] object-contain rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
}
