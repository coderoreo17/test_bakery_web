import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Image from "next/image";
import { notFound } from "next/navigation";

export default async function ProductDetails({ params }) {
  await connectDB();

  const product = await Product.findById(params.id).lean();

  if (!product) {
    return notFound();
  }

  return (
    <div className="max-w-6xl mx-auto py-16 px-6">
      <div className="grid md:grid-cols-2 gap-10">

        <div className="h-96 bg-gray-200 rounded-lg" />

        <div>
          <Image src={product.image} alt={product.name} width={600} height={400} className="w-full h-96 object-cover rounded-lg mb-6" />
          <h1 className="text-3xl font-bold mb-4">
            {product.name}
          </h1>

          <p className="text-gray-600 mb-4">
            {product.description}
          </p>

          <p className="text-2xl font-semibold text-accent">
            ₹{product.price}
          </p>
        </div>

      </div>
    </div>
  );
}