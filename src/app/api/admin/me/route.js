export const runtime = "nodejs";

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import Admin from "@/models/Admin";

export async function GET(req) {
  try {
    await connectDB();

    const token = req.cookies.get("adminToken")?.value;
    if (!token) {
      return NextResponse.json({ admin: null }, { status: 200 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return NextResponse.json({ admin: null }, { status: 200 });
    }

    const admin = await Admin.findById(decoded.adminId).select("-password");
    if (!admin) {
      return NextResponse.json({ admin: null }, { status: 200 });
    }

    return NextResponse.json({
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("ADMIN ME ERROR:", error);
    return NextResponse.json({ admin: null }, { status: 500 });
  }
}
