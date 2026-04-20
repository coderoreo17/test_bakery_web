export const dynamic = "force-dynamic";

import Link from "next/link";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import ProductCard from "@/components/ProductCard";
import { TypeAnimation } from "react-type-animation";
import HeroText from "@/components/HeroText";
import Image from "next/image";

export default async function Home() {
  // get top 4 selling products directly from the database instead of using
  // the API route (relative fetch fails under Turbopack with our setup).
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
            price: item.price ?? 0,
          };
        }
        // keep quantity for sorting, but we won't render it
        productSales[item.name].quantity += item.quantity;
        // always keep the latest price in case it changes
        productSales[item.name].price =
          item.price ?? productSales[item.name].price;
        if (!productSales[item.name].image && item.image) {
          productSales[item.name].image = item.image;
        }
      });
    }
  });

  // Try to enrich missing image/price data from the canonical Product collection.
  // Use case-insensitive exact-name lookup per product name to handle
  // small naming/casing differences between order items and product docs.
  const names = Object.keys(productSales);
  const docByName = {};

  // helper to escape user-derived names when building regex
  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  for (const name of names) {
    const regex = new RegExp(`^${escapeRegExp(name)}$`, "i");
    const doc = await Product.findOne({ name: { $regex: regex } }).lean();
    if (doc) docByName[doc.name] = doc;
  }

  const topProducts = Object.entries(productSales)
    .map(([name, { quantity, image, price }]) => {
      const doc = docByName[name];

      if (!doc) return null; // skip invalid

      return {
        _id: doc._id,
        name: doc.name,
        quantity,

        image: doc.image || image || "",
        price: doc.price ?? price ?? 0,

        // 🔥 ADD THESE
        sizes: doc.sizes || [],
        inStock: doc.inStock ?? true,
        category: doc.category,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 4);

  const categoryImages = {
    Cakes: "/images/home/Category-Cakes.jfif",
    "Bakery Items": "/images/home/Category-Bakery-Items.jfif",
    Beverages: "/images/home/Category-Beverages.jfif",
    Snacks: "/images/home/Category-Snacks.jfif",
  };

  return (
    <div>
      {/* ================= HERO ================= */}
      <section className="relative h-[85vh] flex items-center justify-center text-center">
        <div
          className="absolute inset-0 bg-cover blur-xs bg-center"
          style={{
            backgroundImage: 'url("/images/home/Hero-Image.jfif")',
          }}
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 text-white px-6 max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Freshly Baked <span className="text-accent">Happiness</span>
          </h1>

          <HeroText />

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="bg-accent text-primary font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition"
            >
              Shop Now
            </Link>

            <Link
              href="/custom-cake"
              className="border border-white px-6 py-3 rounded-lg hover:bg-white hover:text-primary transition"
            >
              Customize Cake
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FEATURED PRODUCTS ================= */}
      <section className="py-20 bg-secondary">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Featured Delights
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {topProducts.length === 0 ? (
              <p className="col-span-4 text-center text-gray-500">
                No featured products yet.
              </p>
            ) : (
              topProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  showDetailsLink={false}
                />
              ))
            )}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/shop"
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-darkBrown transition"
            >
              Explore All Products
            </Link>
          </div>
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Shop by Category
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 ">
            {["Cakes", "Bakery Items", "Beverages", "Snacks"].map(
              (cat, index) => (
                <Link
                  key={index}
                  href={{
                    pathname: "/shop",
                    query: { category: cat },
                  }}
                  style={{
                    backgroundImage: `url(${categoryImages[cat]})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                  className="relative h-37 rounded-2xl flex items-center justify-center 
  text-xl font-semibold text-white overflow-hidden cursor-pointer"
                >
                  <div className="absolute inset-0 bg-black/50 hover:bg-black/40 transition"></div>
                  <span className="relative z-10">{cat}</span>
                </Link>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ================= CUSTOM CAKE PROMO ================= */}
      <section className="py-20 bg-secondary">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl text-center font-bold mb-6">
              Design Your Dream Cake
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Choose flavor, size, message, and upload your design. Perfect for
              birthdays, weddings, and celebrations.
            </p>
          </div>
          <Image
            src="/images/home/Custom-Cake.jfif"
            alt="custom-cake"
            width={600}
            height={400}
            className="h-72 w-150 bg-gray-300 rounded-xl"
          />

          <div className="text-center">
            <Link
              href="/custom-cake"
              className="bg-accent text-primary px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Start Customization
            </Link>
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-12">What Our Customers Say</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              "Absolutely loved the cake! Super fresh and delicious.",
              "Custom design was exactly what I wanted.",
              "Easy pickup process and great service.",
            ].map((review, index) => (
              <div
                key={index}
                className="bg-secondary p-6 rounded-xl shadow-sm"
              >
                <p className="text-gray-700 text-sm mb-4">“{review}”</p>
                <h4 className="font-semibold">Happy Customer</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="py-16 bg-primary text-center text-white">
        <h2 className="text-3xl font-bold mb-6">
          Ready to Order Fresh Happiness?
        </h2>

        <Link
          href="/shop"
          className="bg-accent text-primary px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition"
        >
          Order Now
        </Link>
      </section>
    </div>
  );
}
