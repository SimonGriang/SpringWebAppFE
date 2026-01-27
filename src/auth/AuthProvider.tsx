import { useState } from "react";
import { AuthContext } from "./AuthContext";
import type { JwtPayload } from "./authTypes";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<JwtPayload | null>(null);

  const login = (jwt: string, payload: JwtPayload) => {
    setToken(jwt);
    setUser(payload);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
