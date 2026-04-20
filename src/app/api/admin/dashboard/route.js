export const runtime = "nodejs";

import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req) {
  await connectDB();

  const token = req.cookies.get("adminToken")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();
  const totalUsers = await User.countDocuments();
  const users = await User.find();

  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);

  const newUsers = users.filter(
    (u) => new Date(u.createdAt) >= sevenDaysAgo,
  ).length;

  const oldUsers = totalUsers - newUsers;

  const userStatusData = [
    { name: "New Users (7d)", value: newUsers },
    { name: "Old Users", value: oldUsers },
  ];

  // ✅ use all orders directly
  const orders = await Order.find();

  const totalRevenue = orders.reduce(
    (acc, order) => acc + (order.totalAmount || 0),
    0,
  );

  const averageOrderValue =
    totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const pendingOrders = orders.filter((o) => o.status === "Pending").length;

  const customOrders = orders.filter((o) => o.orderType === "custom").length;

  /* ✅ EXISTING PIE DATA */
  const statusCounts = {
    Pending: 0,
    Processing: 0,
    Completed: 0,
    Rejected: 0,
  };

  orders.forEach((order) => {
    if (statusCounts[order.status] !== undefined) {
      statusCounts[order.status]++;
    }
  });

  const statusData = Object.keys(statusCounts).map((key) => ({
    name: key,
    value: statusCounts[key],
  }));

  /* ✅ NEW — LAST 7 DAYS DATA */
  const last7Days = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);

    const dayOrders = orders.filter(
      (o) => new Date(o.createdAt).toDateString() === d.toDateString(),
    );

    last7Days.push({
      date: d.toLocaleDateString("en-IN", { weekday: "short" }),
      revenue: dayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
      orders: dayOrders.length,
    });
  }

  /* ✅ NEW — TOP SELLING PRODUCTS */
  const productSales = {};

  orders.forEach((order) => {
    if (order.orderType === "normal") {
      order.products?.forEach((item) => {
        productSales[item.name] =
          (productSales[item.name] || 0) + item.quantity;
      });
    }
  });

  const topProducts = Object.entries(productSales)
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return NextResponse.json({
    stats: {
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue,
      pendingOrders,
      customOrders,
      averageOrderValue,
    },
    statusData,
    last7Days,
    topProducts,
    userStatusData,
  });
}
