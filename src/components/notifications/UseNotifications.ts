import { useState, useEffect, useCallback } from "react";

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

// Mock-Daten — werden ersetzt sobald Backend-Endpoints aktiv sind
const MOCK: NotificationDTO[] = [
  {
    id: 1,
    title: "Arbeitszeitverletzung",
    message: "Dein Eintrag vom 01.03.2026 überschreitet die zulässige Arbeitszeit. Bitte korrigiere den Eintrag im Modul.",
    category: "WARNING",
    module: "ZEITERFASSUNG",
    scope: "PERSONAL",
    manuallyDismissable: false,
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    readAt: null,
    sender: null,
  },
  {
    id: 2,
    title: "Willkommen im System",
    message: "Dein Account wurde erfolgreich eingerichtet. Bei Fragen wende dich an deinen Teamlead.",
    category: "INFO",
    module: null,
    scope: "PERSONAL",
    manuallyDismissable: true,
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    readAt: null,
    sender: { id: 5, firstname: "Maria", surname: "Huber" },
  },
  {
    id: 3,
    title: "Systemwartung am 10.03.2026",
    message: "Am 10.03.2026 um 22:00 Uhr findet eine planmäßige Wartung statt. Das System ist ca. 30 Minuten nicht verfügbar.",
    category: "INFO",
    module: null,
    scope: "GLOBAL",
    manuallyDismissable: true,
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    readAt: null,
    sender: null,
  },
  {
    id: 4,
    title: "Fehlende Zeiterfassung",
    message: "Für den 28.02.2026 fehlt deine Zeiterfassung. Bitte trage sie nach.",
    category: "ERROR",
    module: "ZEITERFASSUNG",
    scope: "PERSONAL",
    manuallyDismissable: false,
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    readAt: null,
    sender: null,
  },
];

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [moduleCounts, setModuleCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const computeModuleCounts = (notifs: NotificationDTO[]) => {
    const counts: Record<string, number> = {};
    notifs.forEach((n) => {
      if (n.module) counts[n.module] = (counts[n.module] ?? 0) + 1;
    });
    return counts;
  };

  const fetchNotifications = useCallback(async () => {
    try {
      // TODO: Echte API-Aufrufe wenn Backend steht:
      // const [unread, counts] = await Promise.all([
      //   apiClient.get('/notifications/unread'),
      //   apiClient.get('/notifications/unread/count-per-module'),
      // ]);
      // setNotifications(unread);
      // setModuleCounts(counts);

      const unread = MOCK.filter((n) => !n.read);
      setNotifications(unread);
      setModuleCounts(computeModuleCounts(unread));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // TODO: SSE aktivieren wenn Backend steht:
    // const es = new EventSource('/api/notifications/stream', { withCredentials: true });
    // es.addEventListener('notification-update', () => fetchNotifications());
    // es.onerror = () => { es.close(); setTimeout(fetchNotifications, 3000); };
    // return () => es.close();
  }, [fetchNotifications]);

  const markAsRead = useCallback(
    async (id: number) => {
      // TODO: await apiClient.patch(`/notifications/${id}/read`);
      // Nach echtem Backend-Aufruf übernimmt SSE das State-Update automatisch

      // Mock: direkt aus lokalem State entfernen
      setNotifications((prev) => {
        const updated = prev.filter((n) => n.id !== id);
        setModuleCounts(computeModuleCounts(updated));
        return updated;
      });
    },
    []
  );

  return {
    notifications,
    moduleCounts,
    loading,
    unreadCount: notifications.length,
    markAsRead,
    refetch: fetchNotifications,
  };
}