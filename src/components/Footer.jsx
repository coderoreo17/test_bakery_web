"use client";

import Link from "next/link";
import { Facebook, Instagram, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#5C3A21] text-[#F5E6D3] mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-10">
        
        {/* Brand Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Test Bakery</h2>
          <p className="text-sm leading-relaxed">
            Freshly baked cakes, pastries and delights made with love.
            Order online and pick up at your convenience.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/shop" className="hover:text-white">Shop</Link></li>
            <li><Link href="/custom-cake" className="hover:text-white">Custom Cake</Link></li>
            <li><Link href="/about" className="hover:text-white">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>

        {/* Customer Policies */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Customer Policies</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-white">Terms & Conditions</Link></li>
            <li><Link href="/refund-policy" className="hover:text-white">Refund Policy</Link></li>
            <li className="text-xs mt-2">
              Pickup Only • No Home Delivery
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <MapPin size={16} />
              123 Bakery Street, Your City
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} />
              +91 9876543210
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} />
              support@testbakery.com
            </li>
          </ul>

          {/* Social */}
          <div className="flex gap-4 mt-4">
            <a href="#" className="hover:text-white">
              <Facebook size={20} />
            </a>
            <a href="#" className="hover:text-white">
              <Instagram size={20} />
            </a>
          </div>
        </div>
      </div>
      <p className="text-left max-w-7xl mx-auto px-6 pb-2 underline text-xs text-[#F5E6D3]/70">
        Developed with ❤️ by Test Bakery
      </p>

      {/* Bottom Strip */}
      <div className="border-t border-[#F5E6D3]/20 py-4 text-center text-xs">
        © {new Date().getFullYear()} Test Bakery. All rights reserved.
      </div>
    </footer>
  );
}