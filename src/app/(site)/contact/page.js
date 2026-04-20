"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, subject, message } = formData;

    if (!name || !email || !subject || !message) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      toast.success("Message sent successfully 🎉");

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-secondary min-h-screen py-16 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 my-10">

        {/* LEFT SIDE INFO */}
        <div>
          <h2 className="text-3xl font-bold mb-6 text-primary">
            Get in Touch
          </h2>

          <p className="text-gray-700 mb-6">
            Have a custom cake request or special inquiry? 
            We'd love to hear from you!
          </p>

          <div className="space-y-4 text-gray-700">
            <p><strong>📍 Address:</strong> Your Bakery Street, City</p>
            <p><strong>📞 Phone:</strong> +91 9876543210</p>
            <p><strong>📧 Email:</strong> bakery@email.com</p>
            <p><strong>🕒 Hours:</strong> 7:00 AM – 11:00 PM</p>
          </div>
        </div>

        {/* RIGHT SIDE FORM */}
        <div className="bg-white p-8 rounded-xl shadow-md">
          <h3 className="text-2xl text-center font-bold mb-6">
            Send Message
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              type="text"
              name="name"
              placeholder="Your Name *"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-3 rounded-lg"
            />

            <input
              type="email"
              name="email"
              placeholder="Your Email *"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-3 rounded-lg"
            />

            <input
              type="text"
              name="subject"
              placeholder="Subject *"
              value={formData.subject}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-3 rounded-lg"
            />

            <textarea
              name="message"
              placeholder="Your Message *"
              rows="5"
              value={formData.message}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-3 rounded-lg"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-darkBrown transition disabled:opacity-70 cursor-pointer"
            >
              Send Message
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}