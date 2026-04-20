import "./globals.css";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import { NotificationProvider } from "@/context/NotificationContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <AuthProvider>
          <CartProvider>
            <NotificationProvider>
              <main className="flex-grow">{children}</main>
              <Footer />
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: "#4B2E2E",
                    color: "#fff",
                  },
                }}
              />
            </NotificationProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
