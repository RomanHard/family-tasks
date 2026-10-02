import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { user } = await api("/api/auth/me");
      setUser(user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const loginParent = async (email, password) => {
    const { user } = await api("/api/auth/parent/login", {
      method: "POST",
      body: { email, password },
    });
    setUser(user);
  };

  const registerParent = async (email, password) => {
    const { user } = await api("/api/auth/parent/register", {
      method: "POST",
      body: { email, password },
    });
    setUser(user);
  };

  const loginChild = async (nickname, password) => {
    const { user } = await api("/api/auth/child/login", {
      method: "POST",
      body: { nickname, password },
    });
    setUser(user);
  };

  const logout = async () => {
    await api("/api/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, loginParent, registerParent, loginChild, logout, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
