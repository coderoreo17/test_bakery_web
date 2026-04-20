"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";

export default function CustomCakePage() {
  const router = useRouter();

  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    size: "",
    flavor: "",
    shape: "",
    message: "",
    description: "",
    image: null,
    pickupDate: "",
    timeSlot: "",
    paymentMethod: "COP",
  });

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });
  };

  const MAX_FILE_SIZE = 3 * 1024 * 1024;

  const handleChange = async (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files?.[0];

      if (file) {
        if (file.size > MAX_FILE_SIZE) {
          toast.error("Image must be less than 3MB");

          e.target.value = "";
          setFormData((prev) => ({
            ...prev,
            image: null,
          }));
          setImagePreview(null);
          return;
        }

        // 🔥 CONVERT TO BASE64 (CRITICAL)
        const base64 = await convertToBase64(file);

        setFormData((prev) => ({
          ...prev,
          image: base64, // ✅ THIS FIXES EVERYTHING
        }));

        setImagePreview(base64); // better than objectURL
      } else {
        setFormData((prev) => ({
          ...prev,
          image: null,
        }));
        setImagePreview(null);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  console.log(formData.image);

  const handleSubmit = (e) => {
    e.preventDefault();
    const { size, flavor, shape } = formData;
    if (!size || !flavor || !shape) {
      toast.error("Please fill all required fields.");
      return;
    }
    localStorage.setItem("customCakeData", JSON.stringify(formData));
    router.push("/checkout?type=custom");
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: null,
    }));

    setImagePreview(null);

    // reset file input manually
    document.querySelector('input[name="image"]').value = "";
  };

  return (
    <div className="bg-secondary min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-center my-10">
          Design Your Custom Cake
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-xl shadow-md space-y-6"
        >
          {/* Size */}
          <div>
            <label className="block font-semibold mb-2">Cake Size *</label>
            <select
              name="size"
              value={formData.size}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-3 rounded-lg"
            >
              <option value="">Select Size</option>
              <option value="0.5kg">0.5 KG</option>
              <option value="1kg">1 KG</option>
              <option value="2kg">2 KG</option>
              <option value="3kg">3 KG</option>
            </select>
          </div>

          {/* Flavor */}
          <div>
            <label className="block font-semibold mb-2">Flavor *</label>
            <select
              name="flavor"
              value={formData.flavor}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-3 rounded-lg"
            >
              <option value="">Select Flavor</option>
              <option value="Chocolate">Chocolate</option>
              <option value="Vanilla">Vanilla</option>
              <option value="Red Velvet">Red Velvet</option>
              <option value="Butterscotch">Butterscotch</option>
              <option value="Strawberry">Strawberry</option>
            </select>
          </div>

          {/* Shape */}
          <div>
            <label className="block font-semibold mb-2">Shape *</label>
            <select
              name="shape"
              value={formData.shape}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-3 rounded-lg"
            >
              <option value="">Select Shape</option>
              <option value="Round">Round</option>
              <option value="Square">Square</option>
              <option value="Heart">Heart</option>
              <option value="Custom">Custom Shape</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="block font-semibold mb-2">Cake Message</label>
            <input
              type="text"
              name="message"
              placeholder="Eg: Happy Birthday Aarav"
              value={formData.message}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-3 rounded-lg"
            />
          </div>

          {/* Theme Description */}
          <div>
            <label className="block font-semibold mb-2">
              Theme Description
            </label>
            <textarea
              name="description"
              placeholder="Describe your cake design idea..."
              rows="4"
              value={formData.description}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-3 rounded-lg"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block font-semibold mb-2">
              Upload Reference Image (Max 2MB)
            </label>

            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="w-full"
            />
          </div>
          {imagePreview && (
            <div className="relative inline-block">
              <p className="text-sm font-medium mb-2">Preview:</p>

              <Image
                src={imagePreview}
                alt="Preview"
                width={192}
                height={192}
                className="w-70 max-h-40 object-cover rounded-lg border shadow"
              />

              {/* ❌ Remove Button */}
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-8 right-1 text-red-500 bg-white/80 text-lg font-bold rounded-full w-7 h-7 flex items-center justify-center shadow cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-accent text-primary font-semibold py-3 rounded-lg hover:opacity-90 transition cursor-pointer"
          >
            Proceed to Checkout
          </button>
        </form>
      </div>
    </div>
  );
}
