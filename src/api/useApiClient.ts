import { useContext, useMemo } from "react";
import { AuthContext } from "../auth/AuthContext";
import { createApiClient } from "./apiClient";
 
/**
 * Returns a ready-to-use apiClient instance wired to the current auth context.
 *
 * useMemo stellt sicher dass dieselbe Instanz zurückgegeben wird solange
 * sich token und updateToken nicht ändern. Ohne useMemo würde bei jedem
 * Render eine neue Funktion entstehen — das bricht useCallback-Dependencies
 * in allen Pages die useApiClient nutzen und kann Render-Schleifen auslösen.
 */
export function useApiClient() {
  const { token, updateToken } = useContext(AuthContext);
 
  return useMemo(
    () => createApiClient(() => token, updateToken),
    // token als Dependency: neue Client-Instanz nur wenn sich der Token ändert
    // (z.B. nach Silent Refresh) — nicht bei jedem Render
    [token, updateToken]
  );
}