export const runtime = "nodejs";

import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const { id } = await params;
    const order = await Order.findOne({ orderNumber: id });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const userId = decoded.id || decoded.userId;
    if (order.userId.toString() !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.log("ORDER FETCH ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" }, 
      { status: 500 },
    );
  }
}
