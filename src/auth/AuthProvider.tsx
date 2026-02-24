import { useState } from "react";
import { AuthContext, type User } from "./AuthContext";
import { decodeJwt } from "./jwtDecode";
import type { PermissionProfile } from "./authTypes";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [permissionProfile, setPermissionProfile] = useState<PermissionProfile | null>(null);


  const login = (jwt: string, profile: PermissionProfile) => {
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
    setPermissionProfile(profile);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setPermissionProfile(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, permissionProfile, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
