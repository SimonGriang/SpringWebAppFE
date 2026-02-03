import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { createApiClient } from "../api/apiClient";

/**
 * Backend:
 * - prüft JWT
 * - prüft Permission TIME_TRACKING_ACCESS
 */
export const TimeTrackingPage = () => {
  const { token } = useAuth();
  const api = createApiClient(() => token);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/time-tracking")
      .then(() => {})
      .catch(() => {
        setError("Kein Zugriff auf Zeiterfassung");
      });
  }, []);

  if (error) {
    return <h2>{error}</h2>;
  }

  return <h1>Zeiterfassung</h1>;
};
