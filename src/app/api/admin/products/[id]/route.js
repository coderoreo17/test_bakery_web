import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// handle operations against a single product (used by admin UI)
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const product = await Product.findById(id).lean();
    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (err) {
    console.error("GET /admin/products/[id]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const formData = await req.formData();
    const name = formData.get("name");
    const price = formData.get("price");
    const sizesRaw = formData.get("sizes");
    const category = formData.get("category");
    const description = formData.get("description");
    const file = formData.get("image");

    const updates = { name, price, category, description };

    if (sizesRaw) {
      updates.sizes = JSON.parse(sizesRaw);
      updates.price = undefined; // remove single price
    } else {
      updates.price = price;
      updates.sizes = [];
    }

    // if there is an updated file upload it to Cloudinary
    if (file && typeof file.arrayBuffer === "function") {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadResponse = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "bakery_products" }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          })
          .end(buffer);
      });
      updates.image = uploadResponse.secure_url;
    }

    const product = await Product.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (err) {
    console.error("PUT /admin/products/[id]", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    product.inStock = !product.inStock;
    await product.save();

    return NextResponse.json(product);
  } catch (err) {
    console.error("PATCH /admin/products/[id]", err);
    return NextResponse.json(
      { error: "Failed to toggle stock" },
      { status: 500 },
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // delete image from Cloudinary
    if (product.image) {
      try {
        const publicId = product.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`bakery_products/${publicId}`);
      } catch (err) {
        console.log("Cloudinary delete failed:", err);
      }
    }

    await Product.findByIdAndDelete(id);

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("DELETE /admin/products/[id]", err);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 },
    );
  }
}
