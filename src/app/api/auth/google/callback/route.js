export const runtime = "nodejs";

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET(req) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(origin);
  }

  // 1. Exchange code for token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${origin}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenRes.json();

  // 2. Get Google user
  const userRes = await fetch(
    "https://openidconnect.googleapis.com/v1/userinfo",
    {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    },
  );

  const googleUser = await userRes.json();

  if (!googleUser || !googleUser.email) {
    console.error("Google callback error: email is missing", googleUser);
    const errUrl = new URL(origin);
    errUrl.pathname = "/login";
    errUrl.searchParams.set("error", "google_email_required");
    return NextResponse.redirect(errUrl.toString());
  }

  await connectDB();

  // 3. Check existing user (LOGIN)
  let user = await User.findOne({ email: googleUser.email });
  let isSignup = false;

  // 4. If not exists (SIGNUP)
  if (!user) {
    isSignup = true;
    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const fullName =
      googleUser.name ||
      `${googleUser.given_name || ""} ${googleUser.family_name || ""}`.trim() ||
      "Google User";

    user = await User.create({
      name: fullName,
      email: googleUser.email,
      password: hashedPassword,
      image: googleUser.picture,
    });
  } else {
    // Update existing user with latest Google data
    const updates = {};
    if (googleUser.picture && user.image !== googleUser.picture) {
      updates.image = googleUser.picture;
    }
    const fullName =
      googleUser.name ||
      `${googleUser.given_name || ""} ${googleUser.family_name || ""}`.trim() ||
      null;
    if (fullName && user.name !== fullName) {
      updates.name = fullName;
    }
    if (Object.keys(updates).length > 0) {
      user = await User.findByIdAndUpdate(user._id, updates, {
        new: true,
        runValidators: true,
      });
    }
  }

  // 5. Generate JWT (LOGIN) - match login route structure
  const token = jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || "user",
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  const redirectUrl = new URL(origin);
  redirectUrl.searchParams.set(
    "auth_event",
    isSignup ? "signup" : "login"
  );
  const response = NextResponse.redirect(redirectUrl.toString());

  // 6. Set cookie
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
