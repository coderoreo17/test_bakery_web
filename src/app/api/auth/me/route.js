export const runtime = "nodejs";

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET(req) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const userId = decoded.id || decoded.userId;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.id || decoded.userId;
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    let hasUpdate = false;

    if (body.name) {
      user.name = body.name;
      hasUpdate = true;
    }

    if (body.address) {
      user.address = {
        street: body.address.street || "",
        city: body.address.city || "",
        pincode: body.address.pincode || "",
      };
      hasUpdate = true;
    }

    if (!hasUpdate) {
      return NextResponse.json(
        { message: "Name or address is required" },
        { status: 400 },
      );
    }

    await user.save();

    return NextResponse.json(
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          image: user.image,
          address: user.address,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("AUTH ME PATCH ERROR:", error);
    return NextResponse.json(
      { message: "Failed to update address" },
      { status: 500 },
    );
  }
}
