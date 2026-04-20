"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    customOrders: 0,
  });

  const [statusData, setStatusData] = useState([]);
  const [userStatusData, setUserStatusData] = useState([]);

  // ✅ NEW STATES (added only)
  const [last7Days, setLast7Days] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    async function fetchStats() {
      const res = await fetch("/api/admin/dashboard");
      const data = await res.json();

      setStats(data.stats);
      setStatusData(data.statusData);

      // ✅ NEW DATA SETTERS (added only)
      setLast7Days(data.last7Days || []);
      setTopProducts(data.topProducts || []);
      setUserStatusData(data.userStatusData || []);
    }

    fetchStats();
  }, []);

  const COLORS = ["#facc15", "#3b82f6", "#22c55e", "#ef4444"];

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>

      {/* 🔥 Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Products" value={stats.totalProducts} />
        <StatCard title="Total Orders" value={stats.totalOrders} />
        <StatCard title="Total Users" value={stats.totalUsers} />
        <StatCard title="Total Revenue" value={`₹${stats.totalRevenue}`} />
        <StatCard title="Pending Orders" value={stats.pendingOrders} />
        <StatCard title="Custom Orders" value={stats.customOrders} />
        <StatCard
          title="Average Order Value"
          value={`₹${stats.averageOrderValue}`}
        />
      </div>

      {/* 📊 Pie Chart */}
      <div className="grid md:grid-cols-2 gap-8 mb-10">
        {/* 🥧 Order Status Pie */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4">
            Order Status Distribution
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {statusData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 🥧 User Distribution Pie */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4">User Distribution</h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userStatusData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {userStatusData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ✅ NEW SECTION — Revenue & Orders Charts */}
      <div className="grid md:grid-cols-2 gap-8 mb-10">
        {/* Revenue Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-4">Revenue (Last 7 Days)</h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Growth Line Chart */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-4">Orders Growth (Last 7 Days)</h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#3b82f6"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ✅ NEW SECTION — Top Selling Products */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-semibold mb-4">Top Selling Products</h2>

        <div className="space-y-3">
          {topProducts.map((product, index) => (
            <div key={index} className="flex justify-between border-b pb-2">
              <span>{product.name}</span>
              <span className="font-semibold">{product.quantity} sold</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* 🔹 Reusable Stat Card */
function StatCard({ title, value }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
      <h2 className="text-sm text-gray-500 mb-2">{title}</h2>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
