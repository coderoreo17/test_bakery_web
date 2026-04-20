"use client";

import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="bg-secondary min-h-screen">
      {/* HERO */}
      <section className="py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          About Our Bakery
        </h1>
        <p className="max-w-2xl mx-auto text-lg opacity-90">
          Freshly baked delights made with love, passion, and the finest
          ingredients. Bringing sweetness to your special moments.
        </p>
      </section>

      {/* STORY */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
        <img src="/images/about/About-Image.jfif" alt="Bakery" className="rounded-xl shadow-lg" />

        <div>
          <h2 className="text-3xl font-bold mb-4">Our Story</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Our bakery started with a simple passion — creating delicious,
            handcrafted cakes and desserts that make every occasion special.
            From birthdays to weddings, we believe every celebration deserves
            something sweet and memorable.
          </p>
          <p className="text-gray-600 leading-relaxed">
            We use premium ingredients, traditional recipes, and modern baking
            techniques to ensure every bite is fresh, flavorful, and made with
            care.
          </p>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Us
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 shadow rounded-xl">
              <div className="text-4xl mb-3">🎂</div>
              <h3 className="font-semibold text-lg mb-2">Freshly Baked</h3>
              <p className="text-gray-600 text-sm">
                Every product is baked fresh daily using high quality
                ingredients.
              </p>
            </div>

            <div className="text-center p-6 shadow rounded-xl">
              <div className="text-4xl mb-3">🍰</div>
              <h3 className="font-semibold text-lg mb-2">Custom Cakes</h3>
              <p className="text-gray-600 text-sm">
                Personalized cakes designed for your special occasions.
              </p>
            </div>

            <div className="text-center p-6 shadow rounded-xl">
              <div className="text-4xl mb-3">🚚</div>
              <h3 className="font-semibold text-lg mb-2">On-Time Pickup</h3>
              <p className="text-gray-600 text-sm">
                Reliable pickup scheduling for your convenience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-white py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Taste Something Delicious?
        </h2>
        <p className="mb-6 opacity-90">
          Browse our cakes and place your order today.
        </p>
        <Link
          href="/shop"
          className="bg-accent text-primary px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition"
        >
          Explore Menu
        </Link>
      </section>
    </div>
  );
}
