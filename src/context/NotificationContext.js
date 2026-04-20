"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);

  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;

    const checkNotifications = async () => {
      const getEmailFromCookie = () => {
        const match = document.cookie.match(/(^| )userEmail=([^;]+)/);
        return match ? match[2] : null;
      };

      const email = getEmailFromCookie();

      if (!email) return;

      const res = await fetch(`/api/orders/notifications?email=${email}`);

      const data = await res.json();

      if (data?.length) {
        const order = data[0];

        setNotification({
          message: (
            <>
              We regret to inform you that your order{" "}
              <strong>{order.orderNumber}</strong> could not be processed.
              Reason: <strong>{order.rejectionReason}</strong>.
            </>
          ),
        });
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 4000);
    return () => clearInterval(interval);
  }, [pathname]);

  return (
    <NotificationContext.Provider value={{ notification, setNotification }}>
      {notification && (
        <div className="fixed top-0 left-0 w-full z-[9999] animate-slideDown">
          <div className="bg-red-50 border-b-4 border-red-500 shadow-lg px-6 py-2 flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-red-700 text-lg">
                Order Update
              </h3>

              <p className="text-sm text-gray-700 mt-1">
                {notification.message}
              </p>
            </div>

            <button
              onClick={() => setNotification(null)}
              className="text-red-600 hover:text-red-800 text-xl font-bold ml-4 cursor-pointer"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);
