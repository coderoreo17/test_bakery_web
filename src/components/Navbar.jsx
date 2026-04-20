"use client";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Menu, X, ShoppingCart, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const { cartItems } = useCart();

  const pathname = usePathname();
  const [underlineStyle, setUnderlineStyle] = useState({});
  const navRef = useRef(null);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const active = navRef.current?.querySelector(".active-nav");
    if (active) {
      setUnderlineStyle({
        left: active.offsetLeft,
        width: active.offsetWidth,
      });
    }
  }, [pathname]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setAvatarError(false);
  }, [user?.image]);

  if (!mounted) return null;

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
      {" "}
      <div className="max-w-9xl mx-auto px-4 md:px-10 py-4 flex items-center justify-between">
        {/* Left - Menu + Logo */}
        <div className="flex items-center gap-3">
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>

          <Link href="/" className="text-xl md:text-2xl font-bold text-accent">
            Test Bakery
          </Link>
        </div>
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium relative">
          <span
            className="absolute bottom-0 h-0.5 bg-accent transition-all duration-300"
            style={{
              width:
                pathname === "/"
                  ? "48px"
                  : pathname === "/shop"
                    ? "70px"
                    : pathname === "/custom-cake"
                      ? "100px"
                      : pathname === "/contact"
                        ? "65px"
                        : "0px",
              transform:
                pathname === "/"
                  ? "translateX(-4px)"
                  : pathname === "/shop"
                    ? "translateX(64px)"
                    : pathname === "/custom-cake"
                      ? "translateX(152px)"
                      : pathname === "/contact"
                        ? "translateX(268px)"
                        : "translateX(0px)",
            }}
          />

          <Link
            href="/"
            className={`${pathname === "/" ? "text-accent" : "hover:text-accent"}`}
          >
            Home
          </Link>

          <Link
            href="/shop"
            className={`${pathname === "/shop" ? "text-accent" : "hover:text-accent"}`}
          >
            Products
          </Link>

          <Link
            href="/custom-cake"
            className={`${pathname === "/custom-cake" ? "text-accent" : "hover:text-accent"}`}
          >
            Custom Cake
          </Link>

          <Link
            href="/contact"
            className={`${pathname === "/contact" ? "text-accent" : "hover:text-accent"}`}
          >
            Contact
          </Link>

          <Link href="/cart" className="relative">
            <ShoppingCart className="hover:text-accent transition" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs px-2 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </Link>

          {!loading && (
            <>
              {user ? (
                <div
                  onClick={() => router.push("/profile")}
                  className="cursor-pointer w-10 h-10 rounded-full overflow-hidden"
                >
                  {user.image && !avatarError ? (
                    <img
                      src={user.image}
                      alt={user.name || "User"}
                      className="w-full h-full object-cover"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <div className="w-full h-full bg-primary text-white flex items-center justify-center font-bold">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex gap-4">
                  <button
                    onClick={() => router.push("/login")}
                    className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-white border border-accent hover:text-accent transition"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => router.push("/register")}
                    className="border border-primary text-primary px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition"
                  >
                    Register
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        {/* Mobile Right Icons */}
        <div className="flex items-center gap-4 md:hidden">
          <Link href="/cart" className="relative">
            <ShoppingCart />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </Link>

          {!loading && (
            <>
              {user ? (
                <div
                  onClick={() => router.push("/profile")}
                  className="cursor-pointer w-8 h-8 rounded-full overflow-hidden"
                >
                  {user.image && !avatarError ? (
                    <img
                      src={user.image}
                      alt="User"
                      className="w-full h-full object-cover"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <div className="w-full h-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={() => router.push("/login")}>
                  <User />
                </button>
              )}
            </>
          )}
        </div>
      </div>
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg px-6 py-4 space-y-4 text-sm font-medium z-40">
          <Link href="/" className="block">
            Home
          </Link>
          <Link href="/shop" className="block">
            Products
          </Link>
          <Link href="/custom-cake" className="block">
            Custom Cake
          </Link>
          <Link href="/contact" className="block">
            Contact
          </Link>

          {user ? (
            <button onClick={logout} className="block text-red-500">
              Logout
            </button>
          ) : (
            <>
              <Link href="/login" className="block">
                Login
              </Link>
              <Link href="/register" className="block">
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
