export const runtime = "nodejs";

import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";

  let query = {};

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  if (category) {
    query.category = category;
  }

  const products = await Product.find(query).lean();
  const categories = await Product.distinct("category");

  const formattedProducts = products.map((product) => ({
    ...product,
    _id: product._id.toString(),
    inStock: product.inStock !== undefined ? product.inStock : true,
  }));

  return NextResponse.json({ products: formattedProducts, categories });
}