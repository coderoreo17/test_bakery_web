import { NextResponse } from "next/server";
export const runtime = "nodejs";

import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectDB();

    const orders = await Order.find();

    const productSales = {};

    orders.forEach((order) => {
      if (order.orderType === "normal") {
        order.products?.forEach((item) => {
          if (!productSales[item.name]) {
            productSales[item.name] = {
              quantity: 0,
              image: item.image || "",
            };
          }
          productSales[item.name].quantity += item.quantity;
          // if image is missing but later order has one, preserve it
          if (!productSales[item.name].image && item.image) {
            productSales[item.name].image = item.image;
          }
        });
      }
    });

    const topProductNames = Object.entries(productSales)
      .map(([name, { quantity, image }]) => ({ name, quantity, image }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 4);

    // Fetch full product data
    const topProducts = await Promise.all(
      topProductNames.map(async ({ name }) => {
        const product = await Product.findOne({ name }).lean();
        if (product) {
          return {
            ...product,
            _id: product._id.toString(),
            inStock: product.inStock !== undefined ? product.inStock : true,
          };
        }
        return null;
      })
    );

    const filteredTopProducts = topProducts.filter(Boolean);

    return NextResponse.json(filteredTopProducts, { status: 200 });
  } catch (error) {
    console.error("Error fetching top products:", error);
    return NextResponse.json([], { status: 500 });
  }
}
