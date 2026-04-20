export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Contact from "@/models/Contact";
import nodemailer from "nodemailer";

// Get all messages
export async function GET() {
  await connectDB();
  const messages = await Contact.find().sort({ createdAt: -1 });
  return NextResponse.json(messages);
}

// Update read status
export async function PUT(req) {
  await connectDB();

  const { id, type } = await req.json();

  const message = await Contact.findById(id);

  if (!message) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  if (type === "star") {
    message.isStarred = !message.isStarred;
    await message.save();
  }

  return NextResponse.json({ success: true });
}

// Delete message
export async function DELETE(req) {
  await connectDB();
  const { id } = await req.json();

  await Contact.findByIdAndDelete(id);

  return NextResponse.json({ success: true });
}

// Create new message + send confirmation email
export async function POST(req) {
  try {
    await connectDB();
    const { name, email, subject, message } = await req.json();

    const newMessage = new Contact({ name, email, subject, message });
    await newMessage.save();

    // Email transporter
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Send confirmation email
      await transporter.sendMail({
        from: `"Your Bakery" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "We have received your message ✅",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Hi ${name},</h2>
            <p>
              Thank you for contacting us. We have received your message
              and our team will review it shortly.
            </p>
            <p>
              We will get back to you as soon as possible.
            </p>
            <br/>
            <p>Thank you for reaching out to us!</p>
            <p><strong>Your Bakery Team</strong></p>
          </div>
        `,
      });
    } catch (error) {
      console.error("Email sending failed:", error);
      // Continue without failing the request
    }

    return NextResponse.json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 },
    );
  }
}
