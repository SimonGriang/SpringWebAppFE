import { jwtDecode } from "jwt-decode";
import type { JwtPayload } from "./authTypes";

export const decodeJwt = (token: string): JwtPayload => {
  return jwtDecode<JwtPayload>(token);
};
