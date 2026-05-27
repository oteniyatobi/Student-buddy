import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AxiosError } from "axios";
import { api } from "@/lib/api";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  xp: number;
  streakDays: number;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const LS_USER = "ss_user";
const LS_TOKEN = "ss_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") { setIsLoading(false); return; }
    const storedToken = localStorage.getItem(LS_TOKEN);
    const storedUser = localStorage.getItem(LS_USER);
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch { /* ignore */ }
    }
    setIsLoading(false);
  }, []);

  const persist = (t: string, u: AuthUser) => {
    setToken(t);
    setUser(u);
    localStorage.setItem(LS_TOKEN, t);
    localStorage.setItem(LS_USER, JSON.stringify(u));
  };

  const authRequest = async <T,>(path: string, body: object): Promise<T> => {
    try {
      const { data } = await api.post<T>(path, body);
      return data;
    } catch (err) {
      if (err instanceof AxiosError) {
        throw new Error(err.response?.data?.message || err.message);
      }
      throw err;
    }
  };

  const login = async (email: string, password: string) => {
    const { token: jwt, user: userData } = await authRequest<{ token: string; user: AuthUser }>("/auth/login", { email, password });
    persist(jwt, userData);
  };

  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    const { token: jwt, user: userData } = await authRequest<{ token: string; user: AuthUser }>("/auth/register", { firstName, lastName, email, password });
    persist(jwt, userData);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LS_USER);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
