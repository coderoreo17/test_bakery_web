"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchAdmin = async () => {
      const res = await fetch("/api/admin/me", { credentials: "include" });
      if (!res.ok) {
        return;
      }
      await res.json();
    };

    fetchAdmin();
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", {
      method: "POST",
      credentials: "include",
    });
    router.push("/admin/login");
  };

  const isLoginRoute = pathname === "/admin/login";

  if (isLoginRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6">
        <h2 className="text-2xl font-bold mb-2">Admin Panel</h2>
        <nav className="space-y-4">
          <Link href="/admin" className="block hover:text-yellow-400">
            Dashboard
          </Link>

          <Link href="/admin/products" className="block hover:text-yellow-400">
            Products
          </Link>

          <Link href="/admin/orders" className="block hover:text-yellow-400">
            Orders
          </Link>

          <Link href="/admin/users" className="block hover:text-yellow-400">
            Users
          </Link>

          <Link href="/admin/contact" className="block hover:text-yellow-400">
            Contact Messages
          </Link>

          <Link href="/admin/customization" className="block hover:text-yellow-400">
            Customization
          </Link>

          <button
            onClick={handleLogout}
            className="mt-6 text-red-400 hover:text-red-600 cursor-pointer"
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">{children}</main>
    </div>
  );
}
