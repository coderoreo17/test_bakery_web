"use client";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";

export default function CheckoutPage() {
  const { cartItems, totalPrice, clearCart, size } = useCart();
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();

  const searchParams = useSearchParams();
  const orderType = searchParams.get("type") || "normal";

  const isCustom = orderType === "custom";
  const [customData, setCustomData] = useState(null);

  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (showSuccess) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showSuccess]);

  useEffect(() => {
    if (isCustom) {
      const data = localStorage.getItem("customCakeData");
      if (data) {
        setCustomData(JSON.parse(data));
      }
    }
  }, [isCustom]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  const showAddressForm = user
    ? !(
        user.address &&
        user.address.street?.trim() &&
        user.address.city?.trim() &&
        user.address.pincode?.trim()
      )
    : false;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: {
      street: "",
      city: "",
      pincode: "",
    },
    pickupDate: "",
    timeSlot: "",
    paymentMethod: "COP",
  });

  const validateOrderData = () => {
    if (!formData.phone || !formData.pickupDate || !formData.timeSlot?.trim()) {
      toast.error("Please fill all required fields.");
      return false;
    }

    if (
      showAddressForm &&
      (!formData.address.street ||
        !formData.address.city ||
        !formData.address.pincode)
    ) {
      toast.error("Please fill address.");
      return false;
    }

    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // address fields
    if (["street", "city", "pincode"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [name]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  async function placeOrder(e) {
    if (e) e.preventDefault();
    if (!validateOrderData()) return;
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: user.name,
          email: user.email,
          phone: formData.phone,
          address: showAddressForm ? formData.address : user.address,
          orderType,
          pickupDate: formData.pickupDate,
          timeSlot: formData.timeSlot,
          paymentMethod: formData.paymentMethod,
          products: orderType === "normal" ? cartItems : [],
          customCake:
            orderType === "custom"
              ? {
                  size: customData?.size || "",
                  flavor: customData?.flavor || "",
                  shape: customData?.shape || "",
                  message: customData?.message || "",
                  description: customData?.description || "",
                  image: customData?.image || "",
                }
              : undefined,

          totalAmount: totalPrice,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(data);
        toast.error(data.message || "Order failed");
        return;
      }
      document.cookie = `userEmail=${encodeURIComponent(user.email)}; path=/; max-age=86400`;
      if (showAddressForm && refreshUser) {
        await refreshUser();
      }
      setShowSuccess(true);

      setTimeout(() => {
        clearCart();
        router.push("/");
      }, 3000);
    } catch (error) {
      console.log("Error placing order:", error);
      toast.error("An error occurred while placing the order.");
    }
  }

  if (!isCustom && cartItems.length === 0 && !showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h2 className="text-2xl font-semibold">Your cart is empty.</h2>
      </div>
    );
  }

  if (loading) return null;
  if (!user) return null;

  const loadScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    await loadScript();

    const res = await fetch("/api/payment/create-order", {
      method: "POST",
      body: JSON.stringify({ amount: totalPrice }),
    });

    const order = await res.json();

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: "INR",
      name: "Your Bakery",
      description: "Order Payment",
      order_id: order.id,

      handler: async function (response) {
        console.log(response);

        await fetch("/api/orders/confirm", {
          method: "POST",
          body: JSON.stringify(response),
        });

        // after payment success place order
        await placeOrder();

        clearCart();
        toast.success("Payment successful!");
      },

      prefill: {
        name: user.name,
        email: user.email,
      },

      theme: {
        color: "#f97316",
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  // 🔥 NEW FUNCTION deciding what button does
  const handleCheckout = async (e) => {
    if (!validateOrderData()) {
      if (e) e.preventDefault();
      return;
    }

    if (formData.paymentMethod === "Online") {
      e.preventDefault();
      await handlePayment();
    } else {
      await placeOrder(e);
    }
  };

  return (
    <div className="bg-secondary min-h-screen py-16">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 my-10">
        {/* LEFT SIDE */}
        <div className="bg-white p-8 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold mb-6">Checkout Details</h2>

          <form onSubmit={handleCheckout} className="space-y-4">
            {/* inputs remain unchanged */}

            <input
              type="text"
              name="phone"
              placeholder="Phone Number *"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-3 rounded-lg"
            />

            {showAddressForm && (
              <>
                <input
                  type="text"
                  name="street"
                  placeholder="Street *"
                  value={formData.address.street}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg"
                />

                <input
                  type="text"
                  name="city"
                  placeholder="City *"
                  value={formData.address.city}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg"
                />

                <input
                  type="text"
                  name="pincode"
                  placeholder="Pincode *"
                  value={formData.address.pincode}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg"
                />
              </>
            )}

            <div>
              <label className="block text-sm font-semibold mb-1">
                Pickup Date *
              </label>
              <input
                type="date"
                name="pickupDate"
                value={formData.pickupDate}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                Time Slot *
              </label>
              <select
                name="timeSlot"
                value={formData.timeSlot}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg cursor-pointer"
              >
                <option value="">Select Time Slot</option>
                <option value="9AM-10AM">9 AM - 10 AM</option>
                <option value="10AM-11AM">10 AM - 11 AM</option>
                <option value="11AM-12PM">11 AM - 12 PM</option>
                <option value="12PM-1PM">12 PM - 1 PM</option>
                <option value="1PM-2PM">1 PM - 2 PM</option>
                <option value="2PM-3PM">2 PM - 3 PM</option>
                <option value="3PM-4PM">3 PM - 4 PM</option>
                <option value="4PM-5PM">4 PM - 5 PM</option>
              </select>
            </div>
            {/* Payment Method */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Payment Method *
              </label>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COP"
                    checked={formData.paymentMethod === "COP"}
                    onChange={handleChange}
                  />
                  Cash on Pickup
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Online"
                    checked={formData.paymentMethod === "Online"}
                    onChange={handleChange}
                  />
                  Online Payment
                </label>
              </div>
            </div>

            {/* 🔥 Dynamic Button */}
            <button
              type="submit"
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-darkBrown transition font-semibold mt-4 cursor-pointer"
            >
              {formData.paymentMethod === "Online"
                ? "Proceed to Pay"
                : "Place Order"}
            </button>
          </form>
        </div>

        {/* RIGHT SIDE unchanged */}
        <div className="bg-white p-8 rounded-xl shadow-md h-fit">
          <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

          <div className="space-y-4">
            {orderType === "custom" ? (
              <div className="border p-4 rounded-lg bg-gray-50 text-sm space-y-1">
                <p>
                  <strong>Size:</strong> {customData?.size}
                </p>
                <p>
                  <strong>Flavor:</strong> {customData?.flavor}
                </p>
                <p>
                  <strong>Shape:</strong> {customData?.shape}
                </p>
                <p>
                  <strong>Message:</strong> {customData?.message}
                </p>
                <p>
                  <strong>Description:</strong> {customData?.description}
                </p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item._id} className="flex justify-between">
                  <span>
                    {item.name}{" "}
                    {item.size && (
                      <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {item.size}
                      </span>
                    )}{" "}
                    × {item.quantity}
                  </span>
                  <span>₹{item.price}</span>
                </div>
              ))
            )}
          </div>

          <div className="border-t mt-6 pt-6 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-accent">₹{totalPrice}</span>
          </div>
        </div>
      </div>
      {showSuccess && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          {/* FLOATING PARTICLES */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <span
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDuration: `${4 + Math.random() * 4}s`,
                }}
              />
            ))}
          </div>

          {/* MAIN CARD */}
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 w-[90%] max-w-md text-center shadow-2xl animate-popIn overflow-hidden">
            {/* GRADIENT GLOW */}
            <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-green-400/20 via-emerald-300/10 to-transparent blur-2xl"></div>

            {/* SUCCESS RING */}
            <div className="relative flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full flex items-center justify-center relative">
                {/* animated ring */}
                <div className="absolute inset-0 rounded-full border-4 border-green-400/30 animate-ping"></div>

                {/* inner circle */}
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center backdrop-blur-md border border-green-400/30 animate-scaleIn">
                  <svg
                    className="w-10 h-10 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* TEXT */}
            <h2 className="text-2xl font-bold text-white mb-2 tracking-wide">
              Order Confirmed
            </h2>

            {orderType === "custom" ? (
              <p className="text-white/80 text-sm leading-relaxed">
                Our bakery will contact you shortly to finalize your custom cake
                design and details.
              </p>
            ) : (
              <p className="text-white/80 text-sm leading-relaxed">
                Your order is successfully placed and will be ready at your
                selected time.
              </p>
            )}

            {/* LOADING DOTS */}
            <div className="flex justify-center gap-1 mt-6">
              <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-150"></span>
              <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-300"></span>
            </div>

            <p className="text-xs text-white/50 mt-3">Redirecting to home...</p>
          </div>
        </div>
      )}
    </div>
  );
}
