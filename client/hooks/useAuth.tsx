import React, { createContext, useContext, useState, ReactNode } from "react";
import type { User } from "@/types/listing";

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

const MOCK_USER: User = {
  id: "user1",
  name: "Sarah M.",
  email: "sarah@example.com",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(MOCK_USER);

  const login = () => {
    setUser(MOCK_USER);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: user !== null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
