"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Copy,
  CopyCheckIcon,
  CopyIcon,
  ShoppingBag,
} from "lucide-react";
import toast from "react-hot-toast";

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function OrderDetailPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const orderId = pathname?.split("/").pop();

  const handleCopy = () => {
    navigator.clipboard.writeText(order.orderNumber);
    toast.success("Order ID copied!");
  };

  useEffect(() => {
    if (!orderId) {
      setError("Order not found.");
      setLoading(false);
      return;
    }

    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`, {
          credentials: "include",
        });

        if (res.status === 401) {
          router.push("/login");
          return;
        }

        if (!res.ok) {
          const data = await res.json();
          setError(data?.message || "Unable to load order details.");
          return;
        }

        const data = await res.json();
        setOrder(data);
      } catch (fetchError) {
        setError("Unable to load order details.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary to-white py-16">
        <div className="max-w-4xl mx-auto px-6 my-10">
          <p className="text-gray-500">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary to-white my-10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="rounded-2xl bg-white p-8 shadow-lg border">
            <p className="text-red-600 font-semibold mb-4">{error}</p>
            <Link href="/profile" className="text-primary hover:underline">
              Go back to order history
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-white py-16">
      <div className="max-w-4xl mx-auto px-6 my-10">
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft size={16} />
            Back to History
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border p-8">
          <div className="flex items-center gap-4 mb-8">
            <ShoppingBag className="text-accent" size={28} />
            <div>
              <h1 className="text-2xl font-semibold">Order Details</h1>
              <div className="flex">
                <p className="text-sm text-gray-500">
                  Order Id: {order.orderNumber}
                </p>
                <CopyIcon
                  className="ml-2 cursor-pointer hover:opacity-70"
                  size={18}
                  onClick={handleCopy}
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border p-6 mb-8">
            {order.orderType === "custom" ? (
              <h2 className="text-xl font-semibold mb-4">
                Custom Cake Details
              </h2>
            ) : (
              <h2 className="text-xl font-semibold mb-4">
                Items in this order
              </h2>
            )}
            <div className="bg-slate-50 rounded-2xl p-4">
              {order.orderType === "custom" ? (
                <div className="flex flex-col gap-4">
                  {/* IMAGE */}
                  {order.customCake?.image && (
                    <Image
                      src={order.customCake.image}
                      alt="Custom Cake"
                      width={300}
                      height={200}
                      className="w-100 max-h-60 object-cover rounded-xl"
                    />
                  )}

                  {/* DETAILS */}
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>Size:</strong> {order.customCake?.size || "N/A"}
                    </p>
                    <p>
                      <strong>Flavor:</strong>{" "}
                      {order.customCake?.flavor || "N/A"}
                    </p>
                    <p>
                      <strong>Shape:</strong> {order.customCake?.shape || "N/A"}
                    </p>
                    <p>
                      <strong>Message:</strong>{" "}
                      {order.customCake?.message || "N/A"}
                    </p>
                    <p>
                      <strong>Theme:</strong>{" "}
                      {order.customCake?.description || "N/A"}
                    </p>
                  </div>

                  {/* PRICE */}
                  <div className="flex justify-between mt-3 border-t pt-3">
                    <span className="font-medium">Custom Cake</span>
                    <span className="font-semibold">₹{order.totalAmount}</span>
                  </div>
                </div>
              ) : (
                order.products?.map((product, index) => (
                  <div key={index} className="flex items-start gap-4 py-2">
                    {product.image && (
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={80}
                        height={80}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">
                        Qty: {product.quantity}
                        {product.size && (
                          <span className="ml-1">• Size: {product.size}</span>
                        )}
                      </p>
                    </div>
                    <p className="font-semibold">₹{product.price}</p>
                  </div>
                ))
              )}
            </div>

            {/* BILLING */}
            <h2 className="text-xl font-semibold my-4">Billing</h2>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="grid grid-cols-2 gap-1">
                <p className="text-gray-600">MRP</p>
                <p className="font-semibold text-right">
                  ₹
                  {order.orderType === "custom"
                    ? order.totalAmount
                    : order.products?.reduce(
                        (sum, product) =>
                          sum + product.price * product.quantity,
                        0,
                      ) || 0}
                </p>

                <p className="text-gray-600">Discount</p>
                <p className="font-semibold text-right">
                  ₹{order.discount || "0"}
                </p>

                <p className="text-gray-600">Order Total</p>
                <p className="font-semibold text-right">₹{order.totalAmount}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 mb-8">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="text-sm font-semibold">{order.status}</p>
              {order.status === "Rejected" && (
                <p className="text-sm text-red-500 italic">
                  Reason: {order.rejectionReason}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Ordered On</p>
              <p className="text-sm font-semibold">
                {formatDate(order.createdAt)}, {formatTime(order.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Pickup</p>
              <p className="text-sm font-semibold">{order.pickupDate || "-"}</p>
              <p className="text-sm font-semibold">{order.timeSlot || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment Method</p>
              <p className="font-semibold">{order.paymentMethod || "-"}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500">Delivery Address</p>
            <p className="font-medium">
              {order.address?.street || "-"}, {order.address?.city || "-"}
              {" - "}
              {order.address?.pincode || "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
