export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email"); // 👈 user identifier

    if (!email) return NextResponse.json([]);

    const orders = await Order.find({
      status: "Rejected",
      isNotified: false,
      email: email, // 👈 only this user's orders
    }).sort({ createdAt: -1 });

    if (orders.length > 0) {
      await Order.updateMany(
        { _id: { $in: orders.map((o) => o._id) } },
        { isNotified: true },
      );
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.log(error);
    return NextResponse.json([], { status: 500 });
  }
}
