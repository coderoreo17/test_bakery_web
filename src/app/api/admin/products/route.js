import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  await connectDB();

  const products = await Product.find().sort({ createdAt: -1 }).lean();

  const formattedProducts = products.map((product) => ({
    ...product,
    _id: product._id.toString(),
    inStock: product.inStock !== undefined ? product.inStock : true, // ensure inStock is set
  }));

  return NextResponse.json(formattedProducts);
}

export async function POST(req) {
  try {
    await connectDB();

    const formData = await req.formData();

    const name = formData.get("name");
    const price = formData.get("price");
    const sizesRaw = formData.get("sizes");
    const category = formData.get("category");
    const description = formData.get("description");
    const file = formData.get("image");

    let imageUrl = "";

    // upload image
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

      imageUrl = uploadResponse.secure_url;
    }

    const productData = {
      name,
      category,
      description,
      image: imageUrl,
    };

    // Cakes → sizes
    if (sizesRaw) {
      productData.sizes = JSON.parse(sizesRaw);
    } else {
      productData.price = price;
    }

    const product = await Product.create(productData);

    return NextResponse.json(product);
  } catch (error) {
    console.log("POST ERROR:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
