import { createContext, useContext } from "react";

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
  login: (token: string) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType>(null!);

export const useAuth = () => useContext(AuthContext);
