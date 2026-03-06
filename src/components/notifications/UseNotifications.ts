import { useState, useEffect, useCallback, useContext, useRef } from "react";
import { createApiClient } from "../../api/apiClient";
import { AuthContext } from "../../auth/AuthContext";

// ─── Typen ────────────────────────────────────────────────────────────────────

export type NotificationCategory = "INFO" | "SUCCESS" | "WARNING" | "ERROR";
export type NotificationModule = "ZEITERFASSUNG" | "BENUTZERVERWALTUNG" | null;
export type NotificationScope = "PERSONAL" | "TEAM" | "COMPANY" | "GLOBAL";

export interface SenderDTO {
  id: number;
  firstname: string;
  surname: string;
}

export interface NotificationDTO {
  id: number;
  title: string;
  message: string;
  category: NotificationCategory;
  module: NotificationModule;
  scope: NotificationScope;
  manuallyDismissable: boolean;
  read: boolean;
  createdAt: string;
  readAt: string | null;
  sender: SenderDTO | null;
}

type ModuleCounts = Partial<Record<NonNullable<NotificationModule>, number>>;

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useNotifications() {
  const { token } = useContext(AuthContext);
  const apiClient = createApiClient(() => token);

  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [moduleCounts, setModuleCounts] = useState<ModuleCounts>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useRef statt lokaler Variable – überlebt Re-Renders ohne den useEffect
  // neu zu triggern, und erlaubt sauberes Cleanup beim Unmount
  const esRef = useRef<EventSource | null>(null);

  const fetchNotifications = useCallback(async () => {
    setError(null);
    try {
      const [unread, counts] = await Promise.all([
        apiClient("/backend/api/notifications/unread") as Promise<NotificationDTO[]>,
        apiClient("/backend/api/notifications/unread/count-per-module") as Promise<ModuleCounts>,
      ]);
      setNotifications(unread);
      setModuleCounts(counts);
    } catch (err) {
      console.error("Fehler beim Laden der Notifications:", err);
      setError("Notifications konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;

    fetchNotifications();

    const connectSse = async () => {
      try {
        // Schritt 1 – kurzlebigen Einmal-Token holen (JWT geht sauber im Header mit)
        const { sseToken } = await apiClient(
          "/backend/api/notifications/sse-token"
        ) as { sseToken: string };

        // Schritt 2 – SSE mit Einmal-Token aufbauen (UUID, kein JWT in der URL)
        const es = new EventSource(
          `/backend/api/notifications/stream?token=${sseToken}`
        );
        esRef.current = es;

        es.addEventListener("notification-update", () => fetchNotifications());

        es.onerror = () => {
          es.close();
          esRef.current = null;
          // Verbindung verloren – nach 5 Sekunden neu verbinden
          setTimeout(connectSse, 5_000);
        };
      } catch {
        // SSE nicht verfügbar – kein Problem, initiales fetch läuft bereits
      }
    };

    connectSse();

    return () => {
      esRef.current?.close();
      esRef.current = null;
    };
  }, [token]); // nur token als Dependency – fetchNotifications bewusst ausgelassen
  // da connectSse nur beim Login/Logout neu aufgebaut werden soll

  const markAsRead = useCallback(
    async (id: number) => {
      try {
        await apiClient(`/backend/api/notifications/${id}/read`, {
          method: "PATCH",
        });
      } catch (err) {
        console.error(`Fehler beim Markieren der Notification ${id}:`, err);
      }
    },
    [token]
  );

  return {
    notifications,
    moduleCounts,
    loading,
    error,
    unreadCount: notifications.length,
    markAsRead,
    refetch: fetchNotifications,
  };
}