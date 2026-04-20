"use client";

import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 Fetch current user
  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include", // VERY IMPORTANT
      });
      const data = await res.json();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });
      const data = await res.json();
      setUser(data.user);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser();

    // refresh after redirect
    window.addEventListener("focus", fetchUser);

    return () => window.removeEventListener("focus", fetchUser);
  }, []);

  // 🔥 Register
  const register = async (formData) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // IMPORTANT
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message);
    }

    await fetchUser(); // 🔥 FORCE refresh user
  };

  // 🔥 Login
  const login = async (formData) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message);
    }

    // ✅ Immediately set user from response
    setUser(data.user);
  };

  // Google Login
  const googleLogin = async () => {
    window.location.href = "/api/auth/google";
  };

  const updateProfile = async (payload) => {
    const res = await fetch("/api/auth/me", {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to update profile");
    }

    setUser(data.user);
    return data.user;
  };

  const updateAddress = async (address) => {
    return updateProfile({ address });
  };

  // 🔥 Logout
  const logout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        googleLogin,
        logout,
        refreshUser,
        updateProfile,
        updateAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
