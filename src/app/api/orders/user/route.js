export const runtime = "nodejs";

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";

// This endpoint is largely redundant with /api/orders but kept for
// backwards compatibility. It now reads the JWT from the same cookie
// used by the rest of the API so client code no longer needs to send a
// bearer header (and our profile page already prefers `/api/orders`).
export async function GET(req) {
  try {
    await connectDB();

    // read token from cookie instead of authorization header
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const orders = await Order.find({
      userId: new mongoose.Types.ObjectId(decoded.userId || decoded.id),
    }).sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
