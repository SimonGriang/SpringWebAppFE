import { createContext, useContext } from "react";
import type { PermissionProfile } from "./authTypes";


export type User = {
  sub: string;
  employeeFirstname: string;
  employeeSurname: string;
  companyId: string;
  permissions: string[];
};

export type AuthContextType = {
  token: string | null;
  user: User | null;
  permissionProfile: PermissionProfile | null;
  login: (token: string, permissionProfile: PermissionProfile) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType>(null!);

export const useAuth = () => useContext(AuthContext);
