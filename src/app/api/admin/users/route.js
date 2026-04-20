export const runtime = "nodejs";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  const users = await User.find().sort({ createdAt: -1 });
  const userWithOrders = await Promise.all(
    users.map(async (user) => {
      const orderCount = await Order.countDocuments({ userId: user._id });
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "user",
        createdAt: user.createdAt,
        orderCount,
      };
    }),
  );

  return NextResponse.json(userWithOrders);
}
