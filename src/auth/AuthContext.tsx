import { createContext } from "react";
import type { JwtPayload } from "./authTypes";

export type AuthContextType = {
  token: string | null;
  user: JwtPayload | null;
  login: (token: string, payload: JwtPayload) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  login: () => {},
  logout: () => {},
});
