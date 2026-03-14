import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import { createApiClient } from "./apiClient";
 
/**
 * Returns a ready-to-use apiClient instance wired to the current auth context.
 * Use this hook in all pages and components instead of calling createApiClient directly.
 *
 * The client automatically:
 * - Attaches the Bearer token to every request
 * - Attempts a silent refresh on 401
 * - Updates the token in AuthContext after a successful refresh
 * - Dispatches a logout event if the refresh fails
 */
export function useApiClient() {
  const { token, updateToken } = useContext(AuthContext);
  return createApiClient(() => token, updateToken);
}