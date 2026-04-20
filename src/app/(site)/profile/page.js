"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User, ShoppingBag, LogOut, Edit } from "lucide-react";
import { useJsApiLoader } from "@react-google-maps/api";
import { useRef } from "react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const {
    user,
    logout,
    loading: authLoading,
    updateAddress,
    updateProfile,
  } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editNameMode, setEditNameMode] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [nameForm, setNameForm] = useState(user?.name || "");
  const [addressForm, setAddressForm] = useState({
    street: "",
    city: "",
    pincode: "",
  });

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const inputRef = useRef(null);
  const autoCompleteRef = useRef(null);

  // 1️⃣ Redirect effect
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!isLoaded || !editMode) return;
    if (!inputRef.current) return;
    if (!window.google?.maps?.places) return;

    autoCompleteRef.current = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ["address"],
        componentRestrictions: { country: "in" },
      },
    );

    autoCompleteRef.current.addListener("place_changed", () => {
      const place = autoCompleteRef.current.getPlace();

      let street = "";
      let city = "";
      let pincode = "";

      place.address_components?.forEach((component) => {
        const types = component.types;

        if (types.includes("route")) {
          street = component.long_name;
        }

        if (types.includes("locality")) {
          city = component.long_name;
        }

        if (types.includes("postal_code")) {
          pincode = component.long_name;
        }
      });

      setAddressForm({ street, city, pincode });
    });

    return () => {
      if (autoCompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(
          autoCompleteRef.current,
        );
      }
    };
  }, [isLoaded, editMode]);

  useEffect(() => {
    if (user) {
      setAvatarError(false);
      setAddressForm({
        street: user.address?.street || "",
        city: user.address?.city || "",
        pincode: user.address?.pincode || "",
      });
      setNameForm(user.name || "");
    }
  }, [user]);

  // 2️⃣ Fetch orders effect
  useEffect(() => {
    // don't fetch until cookie-based user info is available
    if (!user) return;

    async function fetchOrders() {
      try {
        // use the central orders endpoint which reads the JWT from cookies
        const res = await fetch(`/api/orders`, { credentials: "include" });
        const data = await res.json();

        // backend should return an array; guard just in case
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          console.error("unexpected orders response", data);
          setOrders([]);
        }
      } catch (error) {
        console.log("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [user]);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNameChange = (e) => {
    setNameForm(e.target.value);
  };

  const handleSaveName = async () => {
    if (!nameForm.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    try {
      await updateProfile({ name: nameForm.trim() });
      toast.success("Name updated successfully.");
      setEditNameMode(false);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to update name.");
    }
  };

  const handleSaveAddress = async () => {
    if (
      !addressForm.street.trim() ||
      !addressForm.city.trim() ||
      !addressForm.pincode.trim()
    ) {
      toast.error("Please fill all address fields.");
      return;
    }

    try {
      await updateAddress(addressForm);
      toast.success("Address updated successfully.");
      setEditMode(false);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to update address.");
    }
  };

  // ✅ NOW safe to return conditionally
  if (authLoading) return null;
  if (!user) return null;

  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return "bg-gray-100 text-gray-700";
      case "Processing":
        return "bg-yellow-100 text-yellow-700";
      case "Ready to Pickup":
        return "bg-blue-100 text-blue-700";
      case "Completed":
        return "bg-green-100 text-green-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatOrderDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatOrderTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-secondary to-white py-16">
      <div className="max-w-6xl mx-auto px-6 my-10">
        {/* Page Title */}
        <h1 className="text-4xl font-bold mb-12 text-center">My Dashboard</h1>

        <div className="grid md:grid-cols-3 gap-10">
          {/* ================= USER CARD ================= */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border hover:shadow-xl transition">
            <div className="flex items-center gap-3 mb-6">
              <User className="text-accent" size={28} />
              <h2 className="text-xl font-semibold">Account Info</h2>
            </div>

            <div className="mb-6 flex justify-center">
              {user.image && !avatarError ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-32 h-32 rounded-full object-cover shadow-md"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-primary text-white text-5xl font-bold flex items-center justify-center shadow-md">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-gray-500">Full Name</p>
                {!editNameMode ? (
                  <div className="-mt-1 flex items-center justify-between gap-3">
                    <p className="font-medium text-lg flex-1">{user.name}</p>
                    <button
                      onClick={() => setEditNameMode(true)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-darkBrown/10 transition cursor-pointer"
                      aria-label="Edit Name"
                    >
                      <Edit size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 mt-3">
                    <input
                      type="text"
                      name="name"
                      value={nameForm}
                      onChange={handleNameChange}
                      placeholder="Full Name"
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleSaveName}
                        className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white hover:bg-darkBrown transition cursor-pointer"
                      >
                        Save Name
                      </button>
                      <button
                        onClick={() => {
                          setEditNameMode(false);
                          setNameForm(user.name || "");
                        }}
                        className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <p className="text-gray-500">Email Address</p>
                <p className="font-medium text-lg">{user.email}</p>
              </div>

              <div>
                <p className="text-gray-500">Address</p>
                {!editMode ? (
                  <div className="-mt-1 flex items-center justify-between">
                    <p className="font-medium text-lg leading-snug flex-1">
                      {user.address?.street
                        ? `${user.address.street}, ${user.address.city} - ${user.address.pincode}`
                        : "Address not provided"}
                    </p>

                    <button
                      onClick={() => setEditMode(true)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg 
               text-gray-500 hover:bg-darkBrown/10 
               transition cursor-pointer"
                      aria-label={
                        user.address?.street ? "Edit Address" : "Add Address"
                      }
                    >
                      <Edit size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 mt-3">
                    <label className="block text-sm font-medium mb-1">
                      Street
                    </label>
                    <input
                      ref={inputRef}
                      type="text"
                      name="street"
                      value={addressForm.street}
                      onChange={handleAddressChange}
                      placeholder="Street"
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg"
                    />
                    <label className="block text-sm font-medium mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={addressForm.city}
                      onChange={handleAddressChange}
                      placeholder="City"
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg"
                    />
                    <label className="block text-sm font-medium mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={addressForm.pincode}
                      onChange={handleAddressChange}
                      placeholder="Pincode"
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleSaveAddress}
                        className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white hover:bg-darkBrown transition cursor-pointer"
                      >
                        Save Address
                      </button>
                      <button
                        onClick={() => {
                          setEditMode(false);
                          setAddressForm({
                            street: user.address?.street || "",
                            city: user.address?.city || "",
                            pincode: user.address?.pincode || "",
                          });
                        }}
                        className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => {
                    logout();
                    router.push("/login");
                  }}
                  className="mt-6 w-full inline-flex items-center justify-center rounded-lg bg-red-500 px-4 py-3 text-sm font-medium text-white hover:bg-red-600 transition cursor-pointer"
                >
                  <LogOut className="mr-2" size={18} />
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* ================= ORDER HISTORY ================= */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-lg p-8 border hover:shadow-xl transition">
            <div className="flex items-center gap-3 mb-8">
              <ShoppingBag className="text-accent" size={28} />
              <h2 className="text-xl font-semibold">Order History</h2>
            </div>

            {loading ? (
              <p className="text-gray-500">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="text-gray-500">No orders placed yet.</p>
            ) : (
              <div className="space-y-5">
                {orders.map((order) => (
                  <Link
                    key={order._id || order.id}
                    href={`/profile/order/${order.orderNumber}`}
                    className="block shadow-md rounded-3xl px-6 py-6 transition hover:bg-gray-100"
                  >
                    <div className="space-y-1">
                      {/* Top row */}
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">
                          Order #{order.orderNumber}
                        </p>

                        <div className="text-right text-xs text-gray-500">
                          <p>{formatOrderDate(order.createdAt)},</p>
                          <p>{formatOrderTime(order.createdAt)}</p>
                        </div>
                      </div>

                      {/* Bottom row */}
                      <div className="flex justify-between items-center">
                        <p className="text-accent text-lg font-semibold">
                          ₹{order.totalAmount}
                        </p>

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                            order.status,
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
