import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  xp: number;
  streakDays: number;
}

interface StoredAccount {
  email: string;
  password: string;
  user: AuthUser;
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
const LS_ACCOUNTS = "ss_accounts";

function getAccounts(): StoredAccount[] {
  try {
    return JSON.parse(localStorage.getItem(LS_ACCOUNTS) ?? "[]");
  } catch {
    return [];
  }
}

function saveAccounts(accounts: StoredAccount[]) {
  localStorage.setItem(LS_ACCOUNTS, JSON.stringify(accounts));
}

function makeToken(userId: string): string {
  return btoa(`${userId}:${Date.now()}`);
}

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

  const login = async (email: string, password: string) => {
    const accounts = getAccounts();
    const found = accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (!found) throw new Error("No account found with that email");
    if (found.password !== password) throw new Error("Incorrect password");
    persist(makeToken(found.user.id), found.user);
  };

  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    const accounts = getAccounts();
    if (accounts.some((a) => a.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("Email already registered");
    }
    const newUser: AuthUser = {
      id: crypto.randomUUID(),
      email,
      firstName,
      lastName,
      xp: 0,
      streakDays: 0,
    };
    saveAccounts([...accounts, { email, password, user: newUser }]);
    persist(makeToken(newUser.id), newUser);
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
