import { useState, useEffect, useCallback, useRef } from "react";
import { AuthContext, type User } from "./AuthContext";
import { decodeJwt } from "./jwtDecode";
import type { PermissionProfile } from "./authTypes";
import { AUTH_LOGOUT_EVENT } from "../api/apiClient";

// How many milliseconds before expiry to proactively refresh the token.
// With a 15-minute token, refresh triggers at the 13-minute mark.
const REFRESH_BEFORE_EXPIRY_MS = 2 * 60 * 1000; // 2 minutes

// How often the AuthProvider checks whether a refresh is needed.
const REFRESH_CHECK_INTERVAL_MS = 60 * 1000; // every 60 seconds

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [permissionProfile, setPermissionProfile] = useState<PermissionProfile | null>(null);
  // Tracks whether the initial silent refresh attempt on startup has completed
  const [initializing, setInitializing] = useState(true);

  // Store expiry time separately to avoid decoding on every interval tick
  const tokenExpiryRef = useRef<number | null>(null);

  // ── Apply a new access token to state ─────────────────────────────────────

  const applyToken = useCallback((jwt: string, profile: PermissionProfile) => {
    const payload = decodeJwt(jwt);
    tokenExpiryRef.current = payload.exp * 1000; // Convert to milliseconds

    setToken(jwt);
    setUser({
      sub: payload.sub,
      employeeFirstname: payload.employeeFirstname,
      employeeSurname: payload.employeeSurname,
      companyId: payload.companyId,
      permissions: payload.permissions,
    });
    setPermissionProfile(profile);
  }, []);

  // ── Called by apiClient when it receives a new token after a silent refresh ─

  const updateToken = useCallback((newJwt: string) => {
    if (!newJwt) return;
    const payload = decodeJwt(newJwt);
    tokenExpiryRef.current = payload.exp * 1000;
    setToken(newJwt);
    setUser({
      sub: payload.sub,
      employeeFirstname: payload.employeeFirstname,
      employeeSurname: payload.employeeSurname,
      companyId: payload.companyId,
      permissions: payload.permissions,
    });
    // permissionProfile stays the same — permissions don't change on token refresh
  }, []);

  // ── Public login function (called from LoginPage) ──────────────────────────

  const login = useCallback((jwt: string, profile: PermissionProfile) => {
    applyToken(jwt, profile);
  }, [applyToken]);

  // ── Logout — clears state and revokes the refresh token cookie ─────────────

  const logout = useCallback(async () => {
    // Best-effort request to revoke the httpOnly cookie on the backend.
    // We proceed with local logout even if the request fails.
    if (token) {
      try {
        await fetch("/backend/api/auth/logout", {
          method: "POST",
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // Ignore network errors on logout
      }
    }
    tokenExpiryRef.current = null;
    setToken(null);
    setUser(null);
    setPermissionProfile(null);
  }, [token]);

  // ── Silent refresh helper ──────────────────────────────────────────────────

  const silentRefresh = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch("/backend/api/auth/refresh", {
        method: "POST",
        credentials: "include", // Sends the httpOnly cookie automatically
      });

      if (!res.ok) return false;

      const data = await res.json();
      if (!data.accessToken) return false;

      applyToken(data.accessToken, data.permissionProfile);
      return true;
    } catch {
      return false;
    }
  }, [applyToken]);

  // ── On app startup: attempt silent refresh to restore session ──────────────
  // If the user has a valid refresh token cookie from a previous session,
  // this will log them back in without showing the login page.

  useEffect(() => {
    silentRefresh().finally(() => setInitializing(false));
  }, []);

  // ── Proactive refresh interval ─────────────────────────────────────────────
  // Checks every minute whether the access token is about to expire.
  // Refreshes silently if within REFRESH_BEFORE_EXPIRY_MS of expiry.

  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      const expiry = tokenExpiryRef.current;
      if (!expiry) return;

      const msUntilExpiry = expiry - Date.now();

      if (msUntilExpiry <= REFRESH_BEFORE_EXPIRY_MS) {
        silentRefresh().then((success) => {
          if (!success) logout();
        });
      }
    }, REFRESH_CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [token, silentRefresh, logout]);

  // ── Listen for logout events dispatched by apiClient on 401 ───────────────

  useEffect(() => {
    const handleLogoutEvent = () => logout();
    window.addEventListener(AUTH_LOGOUT_EVENT, handleLogoutEvent);
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, handleLogoutEvent);
  }, [logout]);

  // ── Show nothing while checking for an existing session ───────────────────
  // Prevents a flash of the login page on reload when a valid cookie exists.

  if (initializing) return null;

  return (
    <AuthContext.Provider value={{ token, user, permissionProfile, login, logout, updateToken }}>
      {children}
    </AuthContext.Provider>
  );
};