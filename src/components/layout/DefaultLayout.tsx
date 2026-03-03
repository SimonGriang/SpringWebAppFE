import React, { createContext, useContext, useState } from "react";
import { ActionIcon, Indicator, useMantineTheme } from "@mantine/core";
import { IconBell } from "@tabler/icons-react";
import { DefaultHeader } from "../header/DefaultHeader";
import { NotificationPanel } from "../notifications/NotificationPanel";
import { useNotifications } from "../notifications/UseNotifications";

// ─── Context ─────────────────────────────────────────────────────────────────
interface NotificationContextValue {
  moduleCounts: Record<string, number>;
  unreadCount: number;
  asideOpen: boolean;
  toggleAside: () => void;
}

const NotificationContext = createContext<NotificationContextValue>({
  moduleCounts: {},
  unreadCount: 0,
  asideOpen: false,
  toggleAside: () => {},
});

export function useNotificationContext() {
  return useContext(NotificationContext);
}

const HEADER_HEIGHT = 56;
const PANEL_WIDTH   = 360;

const SCROLLBAR_STYLE = `
  .custom-scroll {
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--mantine-color-gray-4) transparent;
  }
  .custom-scroll::-webkit-scrollbar { width: 5px; }
  .custom-scroll::-webkit-scrollbar-track { background: transparent; }
  .custom-scroll::-webkit-scrollbar-thumb {
    background-color: var(--mantine-color-gray-4);
    border-radius: 99px;
  }
  .custom-scroll::-webkit-scrollbar-thumb:hover {
    background-color: var(--mantine-color-gray-6);
  }
`;

export const DefaultLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [asideOpen, setAsideOpen] = useState(false);
  const { notifications, moduleCounts, loading, unreadCount, markAsRead } = useNotifications();
  const theme = useMantineTheme();

  const toggleAside = () => setAsideOpen((o) => !o);

  function getContrastColor(hex: string): string {
    if (!hex || hex.length < 7) return "white";
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 160 ? "black" : "white";
  }

  const secondaryColor = theme?.colors?.secondary?.[6] ?? "#6c757d";
  const iconColor      = getContrastColor(secondaryColor);

  return (
    <NotificationContext.Provider value={{ moduleCounts, unreadCount, asideOpen, toggleAside }}>
      <style>{SCROLLBAR_STYLE}</style>

      <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>

        {/* Header — nimmt genau HEADER_HEIGHT ein, kein overflow */}
        <div style={{ height: HEADER_HEIGHT, flexShrink: 0, overflow: "hidden" }}>
          <DefaultHeader />
        </div>

        {/* Content + Panel nebeneinander */}
        <div style={{ display: "flex", flex: 1, minHeight: 0 }}>

          <main className="custom-scroll" style={{ flex: 1, minWidth: 0, boxSizing: "border-box" }}>
            {children}
          </main>

          {asideOpen && (
            <div
              style={{
                width: PANEL_WIDTH,
                flexShrink: 0,
                borderLeft: "1px solid var(--mantine-color-gray-3)",
                boxShadow: "-4px 0 16px rgba(0,0,0,0.08)",
                backgroundColor: "var(--mantine-color-body)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <NotificationPanel
                notifications={notifications}
                loading={loading}
                onMarkAsRead={markAsRead}
                onClose={() => setAsideOpen(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Bell Button */}
      {!asideOpen && (
        <Indicator
          color="red"
          size={18}
          label={unreadCount > 9 ? "9+" : String(unreadCount)}
          disabled={unreadCount === 0}
          processing={unreadCount > 0}
          offset={6}
          style={{ position: "fixed", top: HEADER_HEIGHT + 12, right: 16, zIndex: 10 }}
        >
          <ActionIcon
            onClick={toggleAside}
            size={44}
            radius="xl"
            aria-label="Mitteilungen öffnen"
            style={{
              backgroundColor: secondaryColor,
              color: iconColor,
              boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
              transition: "filter 0.15s, transform 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.filter = "brightness(1.12)";
              (e.currentTarget as HTMLElement).style.transform = "scale(1.06)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.filter = "";
              (e.currentTarget as HTMLElement).style.transform = "";
            }}
          >
            <IconBell size={20} color={iconColor} />
          </ActionIcon>
        </Indicator>
      )}
    </NotificationContext.Provider>
  );
};