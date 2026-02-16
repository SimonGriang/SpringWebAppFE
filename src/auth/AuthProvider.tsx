import { useState } from "react";
import { AuthContext, type User } from "./AuthContext";
import { decodeJwt } from "./jwtDecode";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const login = (jwt: string) => {
    const payload = decodeJwt(jwt);

    setToken(jwt);
    console.log("Auth token:", jwt);


    setUser({
      sub: payload.sub,
      employeeFirstname: payload.employeeFirstname,
      employeeSurname: payload.employeeSurname,
      companyId: payload.companyId,
      permissions: payload.permissions,
    });
    console.log("Auth user:", {
      sub: payload.sub,
      employeeFirstname: payload.employeeFirstname,
      employeeSurname: payload.employeeSurname,
      companyId: payload.companyId,
      permissions: payload.permissions,
    });
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
