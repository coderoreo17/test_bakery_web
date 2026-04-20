"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [orderFilter, setOrderFilter] = useState("normal");

  const [dateFilter, setDateFilter] = useState("all");
  const [customDate, setCustomDate] = useState("");

  const [prevNormalCount, setPrevNormalCount] = useState(0);
  const [prevCustomCount, setPrevCustomCount] = useState(0);

  const [newNormalOrders, setNewNormalOrders] = useState(0);
  const [newCustomOrders, setNewCustomOrders] = useState(0);

  const [selectedOrder, setSelectedOrder] = useState(null);

  const [initialized, setInitialized] = useState(false);

  const [rejectData, setRejectData] = useState({
    orderId: null,
    reason: "Out of stock",
  });

  useEffect(() => {
    if (selectedOrder) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedOrder]);

  async function fetchOrders() {
    const res = await fetch("/api/admin/orders");
    const data = await res.json();

    if (!res.ok) {
      console.warn("Failed to fetch admin orders:", data);
      setOrders([]);
      return;
    }

    const orderList = Array.isArray(data) ? data : [];
    if (!Array.isArray(data)) {
      console.warn("Admin orders response was not an array:", data);
    }

    setOrders(orderList);

    const normal = orderList.filter((o) => o.orderType === "normal").length;
    const custom = orderList.filter((o) => o.orderType === "custom").length;

    // Skip badge logic on first load
    if (initialized) {
      if (normal > prevNormalCount) {
        setNewNormalOrders((prev) => prev + (normal - prevNormalCount));
      }

      if (custom > prevCustomCount) {
        setNewCustomOrders((prev) => prev + (custom - prevCustomCount));
      }
    }

    setPrevNormalCount(normal);
    setPrevCustomCount(custom);

    setInitialized(true);
  }
  useEffect(() => {
    fetchOrders(); // first load

    const interval = setInterval(() => {
      fetchOrders();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  async function updateStatus(id, status, reason = "") {
    await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        rejectionReason: reason,
      }),
    });

    setOrders((prev) =>
      prev.map((order) =>
        order._id === id
          ? { ...order, status, rejectionReason: reason }
          : order,
      ),
    );
  }

  const now = new Date();

  function filterByDate(order) {
    const orderDate = new Date(order.createdAt);

    if (dateFilter === "today") {
      return orderDate.toDateString() === now.toDateString();
    }

    if (dateFilter === "yesterday") {
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      return orderDate.toDateString() === yesterday.toDateString();
    }

    if (dateFilter === "7days") {
      const last7 = new Date();
      last7.setDate(now.getDate() - 7);
      return orderDate >= last7;
    }

    if (dateFilter === "month") {
      const lastMonth = new Date();
      lastMonth.setMonth(now.getMonth() - 1);
      return orderDate >= lastMonth;
    }

    if (dateFilter === "custom" && customDate) {
      return orderDate.toDateString() === new Date(customDate).toDateString();
    }

    return true;
  }

  function groupOrders(orderList) {
    const groups = {
      today: [],
      yesterday: [],
      last7: [],
      month: [],
    };

    const today = new Date();

    orderList.forEach((order) => {
      const orderDate = new Date(order.createdAt);
      const diff = (today - orderDate) / (1000 * 60 * 60 * 24);

      if (orderDate.toDateString() === today.toDateString()) {
        groups.today.push(order);
      } else if (diff <= 1) {
        groups.yesterday.push(order);
      } else if (diff <= 7) {
        groups.last7.push(order);
      } else if (diff <= 30) {
        groups.month.push(order);
      }
    });

    return groups;
  }

  const filteredOrders = orders
    .filter((order) => order.orderType === orderFilter)
    .filter(filterByDate)
    .filter((order) =>
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (a.status === "Completed") return 1;
      if (b.status === "Completed") return -1;
      return 0;
    });

  const grouped = groupOrders(filteredOrders);

  function renderOrders(orderList) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {orderList.map((order) => (
          <div
            key={order._id}
            className={`relative overflow-hidden bg-white shadow-md rounded-xl p-5 border transition-all duration-500
            ${
              order.status === "Rejected"
                ? "border-red-400"
                : order.status === "Processing"
                  ? "border-yellow-400"
                  : order.status === "Ready to Pickup"
                    ? "border-blue-400"
                    : order.status === "Completed"
                      ? "border-green-400"
                      : "border-gray-200"
            }`}
          >
            {order.status === "Rejected" && (
              <div className="absolute top-0 right-0">
                <div className="bg-red-500 text-white text-[10px] font-bold px-7 py-1 transform rotate-45 translate-x-6 translate-y-4 shadow-md">
                  REJECTED
                </div>
              </div>
            )}

            {order.status === "Completed" && (
              <div className="absolute top-0 right-0">
                <div className="bg-green-500 text-white text-[10px] font-bold px-5 py-1 transform rotate-45 translate-x-6 translate-y-4 shadow-md">
                  COMPLETED
                </div>
              </div>
            )}

            <div className="flex justify-between mb-4">
              <div>
                <p className="text-xs font-mono text-gray-500">
                  {order.orderNumber}
                </p>
                <h2 className="font-semibold text-lg">{order.customerName}</h2>
                <p className="text-xs text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="text-right">
                <p className="font-bold text-lg text-left">
                  ₹{order.totalAmount}
                </p>
                <p className="text-sm">Payment Method: {order.paymentMethod}</p>
              </div>
            </div>

            <div className="text-sm text-gray-600 space-y-1 mb-3">
              <p>{order.email}</p>
              <p>{order.phone}</p>
              <p>
                {typeof order.address === "string"
                  ? order.address
                  : order.address?.street
                    ? `${order.address.street}, ${order.address.city} - ${order.address.pincode}`
                    : "Address not provided"}
              </p>
            </div>
            <div>
              {order.rejectionReason && (
                <p className="bg-red-100 text-black text-sm mb-2 pl-2 rounded z-50">
                  <i className="fas fa-exclamation-triangle mr-2">
                    Rejection Reason: {order.rejectionReason}
                  </i>
                </p>
              )}
            </div>

            <div className="bg-gray-100 p-3 rounded-lg mb-3 text-sm">
              <p>
                <span className="font-semibold">Pickup Date:</span>{" "}
                {order.pickupDate || "Not specified"}
              </p>
              <p>
                <span className="font-semibold">Time Slot:</span>{" "}
                {order.timeSlot || "Not specified"}
              </p>
            </div>

            <div className="flex gap-6 mt-4 items-center">
              <div className="flex gap-6 mt-4 items-center">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-2">
                    {order.orderType === "custom"
                      ? "Specifications"
                      : "Products"}
                  </h3>

                  {order.orderType === "custom" ? (
                    <div className="text-sm text-gray-500 flex items-center justify-between">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-blue-600 hover:underline text-xs font-semibold cursor-pointer"
                      >
                        View Details
                      </button>
                    </div>
                  ) : (
                    order.products.map((item, index) => (
                      <div
                        key={item._id || index}
                        className="flex justify-between border-b pb-1 text-xs"
                      >
                        <span>
                          {item.name}{" "}
                          {item.size && (
                            <span className="text-xs bg-lime-100 p-0.5 rounded">
                              ({item.size})
                            </span>
                          )}{" "}
                          × {item.quantity}
                        </span>
                        <span>₹{item.price}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {order.status !== "Rejected" && order.status !== "Completed" && (
                <div className="w-32 space-y-2">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    className="w-full border p-1.5 text-xs rounded"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Ready to Pickup">Ready to Pickup</option>
                    <option value="Completed">Completed</option>
                  </select>

                  <button
                    onClick={() =>
                      setRejectData({
                        orderId: order._id,
                        reason: "Out of stock",
                      })
                    }
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-1.5 text-xs rounded transition cursor-pointer"
                  >
                    Reject
                  </button>
                  {rejectData.orderId && (
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                      <div className="bg-white rounded-xl shadow-xl p-6 w-96">
                        <h3 className="text-lg font-semibold mb-3">
                          Select Rejection Reason
                        </h3>

                        <div className="space-y-2 text-sm">
                          {[
                            "Out of stock",
                            "Kitchen closed",
                            "Delivery slot unavailable",
                            "Payment issue",
                            "Incorrect order details",
                          ].map((reason) => (
                            <label
                              key={reason}
                              className="flex gap-2 cursor-pointer"
                            >
                              <input
                                type="radio"
                                name="reject"
                                value={reason}
                                checked={rejectData.reason === reason}
                                onChange={(e) =>
                                  setRejectData({
                                    ...rejectData,
                                    reason: e.target.value,
                                  })
                                }
                              />
                              {reason}
                            </label>
                          ))}
                        </div>

                        <div className="flex justify-end gap-2 mt-5">
                          <button
                            onClick={() =>
                              setRejectData({ orderId: null, reason: "" })
                            }
                            className="px-4 py-2 bg-gray-200 rounded cursor-pointer"
                          >
                            Cancel
                          </button>

                          <button
                            disabled={!rejectData.reason}
                            onClick={() => {
                              updateStatus(
                                rejectData.orderId,
                                "Rejected",
                                rejectData.reason,
                              );
                              setRejectData({ orderId: null, reason: "" });
                            }}
                            className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50 cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Manage Orders</h1>

      {/* Order Type Buttons */}
      <div className="flex gap-4 mb-6">
        <div
          onClick={() => {
            setOrderFilter("normal");
            setNewNormalOrders(0);
          }}
          className={`relative cursor-pointer px-6 py-3 rounded-lg shadow-md font-semibold ${
            orderFilter === "normal" ? "bg-blue-600 text-white" : "bg-white"
          }`}
        >
          Normal Orders
          {orderFilter === "custom" && newNormalOrders > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {newNormalOrders}
            </span>
          )}
        </div>
        <div
          onClick={() => {
            setOrderFilter("custom");
            setNewCustomOrders(0);
          }}
          className={`relative cursor-pointer px-6 py-3 rounded-lg shadow-md font-semibold ${
            orderFilter === "custom" ? "bg-purple-600 text-white" : "bg-white"
          }`}
        >
          Custom Orders
          {orderFilter === "normal" && newCustomOrders > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {newCustomOrders}
            </span>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by Order Number (e.g. BK-2026-0001)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-96 border px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Date Filter */}
      <div className="flex gap-3 mb-8">
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="all">All</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="7days">Last 7 Days</option>
          <option value="month">Last Month</option>
          <option value="custom">Custom</option>
        </select>

        {dateFilter === "custom" && (
          <input
            type="date"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            className="border px-3 py-2 rounded"
          />
        )}
      </div>

      {/* ORDER GROUPS */}
      {grouped.today.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-4">Today</h2>
          {renderOrders(grouped.today)}
        </>
      )}

      {grouped.yesterday.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mt-10 mb-4">Yesterday</h2>
          {renderOrders(grouped.yesterday)}
        </>
      )}

      {grouped.last7.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mt-10 mb-4">Last 7 Days</h2>
          {renderOrders(grouped.last7)}
        </>
      )}

      {grouped.month.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mt-10 mb-4">Last Month</h2>
          {renderOrders(grouped.month)}
        </>
      )}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-lg relative">
            <h2 className="text-lg font-bold mb-4">Custom Order Details</h2>

            <div className="text-sm space-y-2">
              <p>
                <strong>Name:</strong> {selectedOrder.customerName}
              </p>
              <p>
                <strong>Phone:</strong> {selectedOrder.phone}
              </p>
              <p>
                <strong>Date:</strong> {selectedOrder.pickupDate}
              </p>
              <p>
                <strong>Time:</strong> {selectedOrder.timeSlot}
              </p>

              {/* 🔥 IMPORTANT: show custom fields */}
              <p>
                <strong>Flavor:</strong>{" "}
                {selectedOrder.customCake?.flavor || "-"}
              </p>
              <p>
                <strong>Shape:</strong> {selectedOrder.customCake?.shape || "-"}
              </p>
              <p>
                <strong>Size:</strong> {selectedOrder.customCake?.size || "-"}
              </p>
              <p>
                <strong>Message:</strong>{" "}
                {selectedOrder.customCake?.message || "-"}
              </p>
              <p>
                <strong>Theme:</strong>{" "}
                {selectedOrder.customCake?.description || "-"}
              </p>
              <p>
                <strong>Image:</strong>{" "}
                {(selectedOrder.customCake?.image && (
                  <div className="relative w-full h-60 mt-4">
                    <Image
                      src={selectedOrder.customCake.image}
                      alt="Custom Cake"
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                ))}
              </p>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-6 w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
