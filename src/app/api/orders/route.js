export const runtime = "nodejs";

import { connectDB } from "@/lib/db";
import Counter from "@/models/Counter";
import Order from "@/models/Order";
import User from "@/models/User";
import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    await connectDB();

    // ✅ 1. Check authentication token
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized - Please login" },
        { status: 401 },
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();

    // ✅ 2. Generate Order Number
    const year = new Date().getFullYear();

    const counter = await Counter.findByIdAndUpdate(
      { _id: "orderNumber" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );

    const paddedNumber = String(counter.seq).padStart(4, "0");
    const orderNumber = `BK-${year}-${paddedNumber}`;

    // ✅ 3. Create Order (secure user data from token)
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { message: "User not found - Invalid token" },
        { status: 401 },
      );
    }

    // custom cake image upload
    let imageUrl = "";

    if (
      body.customCake?.image &&
      typeof body.customCake.image === "string" &&
      body.customCake.image.startsWith("data:image") // ✅ only base64
    ) {
      try {
        const uploadRes = await cloudinary.uploader.upload(
          body.customCake.image,
          {
            folder: "custom-cakes",
          },
        );

        imageUrl = uploadRes.secure_url;
      } catch (err) {
        console.error("CLOUDINARY ERROR:", err);
        return NextResponse.json(
          { error: "Image upload failed" },
          { status: 500 },
        );
      }
    }

    const orderAddress = body.address || user.address;

    const order = await Order.create({
      orderNumber,
      userId: decoded.id,
      customerName: decoded.name,
      email: decoded.email,
      phone: body.phone,
      address: orderAddress,
      pickupDate: body.pickupDate,
      timeSlot: body.timeSlot,
      paymentMethod: body.paymentMethod,
      orderType: body.orderType || "normal",
      products: body.products,
      customCake:
        body.orderType === "custom"
          ? {
              size: body.customCake?.size || "",
              flavor: body.customCake?.flavor || "",
              shape: body.customCake?.shape || "",
              message: body.customCake?.message || "",
              description: body.customCake?.description || "",
              image: imageUrl || "", // ✅ safe
            }
          : undefined,
      totalAmount: body.totalAmount,
      status: "Pending",
    });

    const hasSavedAddress =
      user.address &&
      user.address.street?.trim() &&
      user.address.city?.trim() &&
      user.address.pincode?.trim();

    if (body.address) {
      user.address = body.address;
      await user.save();
    }

    return NextResponse.json(order);
  } catch (error) {
    console.log("ORDER ERROR:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 },
    );
  }
}

// ✅ GET USER ORDERS (Order History Page)
export async function GET(req) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const orders = await Order.find({
      userId: decoded.id,
    }).sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}
