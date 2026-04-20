export const runtime = "nodejs";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectDB();

  const { email, password } = await req.json();

  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 400 },
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 400 },
    );
  }

  // ✅ Better JWT payload – make sure we include an `id` field since /api/auth/me
  //    expects `decoded.id`. Previously we used `userId` which meant
  //    `decoded.id` was undefined after decoding and the refresh logic would
  //    always return null.
  const token = jwt.sign(
    {
      id: user._id, // <-- use `id` not `userId`
      name: user.name,
      email: user.email,
      role: user.role || "user", // optional for admin later
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  const response = NextResponse.json(
    {
      message: "Login successful",
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

  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
