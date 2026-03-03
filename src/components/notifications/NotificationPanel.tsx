import { useState } from "react";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Loader,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconBellOff,
  IconCheck,
  IconCircleCheck,
  IconInfoCircle,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import type { NotificationCategory, NotificationDTO, NotificationModule } from "./UseNotifications";

// ─── Kategorie-Konfiguration ─────────────────────────────────────────────────
interface CategoryConfig {
  color: string;
  icon: React.FC<{ size: number }>;
  label: string;
  accentColor: string;
}

const CATEGORY_CONFIG: Record<NotificationCategory, CategoryConfig> = {
  INFO:    { color: "blue",   icon: ({ size }) => <IconInfoCircle size={size} />,    label: "Info",    accentColor: "var(--mantine-color-blue-5)" },
  SUCCESS: { color: "green",  icon: ({ size }) => <IconCircleCheck size={size} />,   label: "Erfolg",  accentColor: "var(--mantine-color-green-5)" },
  WARNING: { color: "yellow", icon: ({ size }) => <IconAlertTriangle size={size} />, label: "Warnung", accentColor: "var(--mantine-color-yellow-5)" },
  ERROR:   { color: "red",    icon: ({ size }) => <IconAlertTriangle size={size} />, label: "Fehler",  accentColor: "var(--mantine-color-red-5)" },
};

const MODULE_LABELS: Record<NonNullable<NotificationModule>, string> = {
  ZEITERFASSUNG:      "Zeiterfassung",
  BENUTZERVERWALTUNG: "Benutzer",
};

type FilterKey = "ALLE" | "UNGELESEN" | "ZEITERFASSUNG" | "BENUTZERVERWALTUNG" | "ALLGEMEIN";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "ALLE",               label: "Alle" },
  { key: "UNGELESEN",          label: "Ungelesen" },
  { key: "ZEITERFASSUNG",      label: "Zeiterfassung" },
  { key: "BENUTZERVERWALTUNG", label: "Benutzer" },
  { key: "ALLGEMEIN",          label: "Allgemein" },
];

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)    return "Gerade eben";
  if (diff < 3600)  return `vor ${Math.floor(diff / 60)} Min.`;
  if (diff < 86400) return `vor ${Math.floor(diff / 3600)} Std.`;
  return `vor ${Math.floor(diff / 86400)} Tagen`;
}

// ─── Filter-Tab ──────────────────────────────────────────────────────────────
function FilterTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <UnstyledButton
      onClick={onClick}
      style={{
        padding: "4px 12px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: active ? 600 : 400,
        backgroundColor: active
          ? "var(--mantine-color-primary-6)"
          : "var(--mantine-color-gray-1)",
        color: active ? "white" : "var(--mantine-color-dimmed)",
        border: "none",
        cursor: "pointer",
        transition: "background-color 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </UnstyledButton>
  );
}

// ─── Einzelne Notification-Karte ─────────────────────────────────────────────
function NotificationCard({ notification, onMarkAsRead }: { notification: NotificationDTO; onMarkAsRead: (id: number) => void }) {
  const cfg = CATEGORY_CONFIG[notification.category];
  const IconComponent = cfg.icon;

  return (
    <Box
      style={{
        borderRadius: 12,
        border: `1px solid var(--mantine-color-${cfg.color}-2)`,
        backgroundColor: `var(--mantine-color-${cfg.color}-0)`,
        display: "flex",
        overflow: "hidden",
      }}
    >
      <Box style={{ width: 4, flexShrink: 0, backgroundColor: cfg.accentColor }} />
      <Box p="sm" style={{ flex: 1, minWidth: 0 }}>
        <Group gap={8} wrap="nowrap" align="center" mb={5}>
          <ThemeIcon color={cfg.color} variant="light" size={22} radius="xl" style={{ flexShrink: 0 }}>
            <IconComponent size={12} />
          </ThemeIcon>
          <Text fw={700} size="sm" lineClamp={1} style={{ flex: 1 }}>
            {notification.title}
          </Text>
        </Group>

        <Group gap={6} mb={7}>
          <Badge color={cfg.color} variant="filled" size="xs" radius="sm">{cfg.label}</Badge>
          {notification.module && (
            <Badge color="gray" variant="light" size="xs" radius="sm">
              {MODULE_LABELS[notification.module]}
            </Badge>
          )}
          <Text size="xs" c="dimmed" ml="auto">{timeAgo(notification.createdAt)}</Text>
        </Group>

        <Text size="xs" c="dimmed" style={{ lineHeight: 1.55 }} mb={10}>
          {notification.message}
        </Text>

        <Group justify="space-between" align="center">
          <Group gap={4}>
            {notification.sender ? (
              <>
                <IconUser size={10} color="var(--mantine-color-dimmed)" />
                <Text size="xs" c="dimmed">
                  {notification.sender.firstname} {notification.sender.surname}
                </Text>
              </>
            ) : (
              <Text size="xs" c="dimmed">System</Text>
            )}
          </Group>

          {notification.manuallyDismissable ? (
            <Button
              size="compact-xs"
              variant="outline"
              color={cfg.color}
              leftSection={<IconCheck size={11} />}
              radius="xl"
              onClick={() => onMarkAsRead(notification.id)}
            >
              Als gelesen markieren
            </Button>
          ) : (
            <Tooltip
              label="Löse das Problem im entsprechenden Modul um diese Meldung zu schließen."
              multiline
              w={210}
              withArrow
              position="top-end"
            >
              <Group gap={4} style={{ cursor: "help" }}>
                <IconAlertTriangle size={11} color="var(--mantine-color-orange-6)" />
                <Text size="xs" fw={600} c="orange">Im Modul lösen</Text>
              </Group>
            </Tooltip>
          )}
        </Group>
      </Box>
    </Box>
  );
}

// ─── Panel ───────────────────────────────────────────────────────────────────
interface NotificationPanelProps {
  notifications: NotificationDTO[];
  loading: boolean;
  onMarkAsRead: (id: number) => void;
  onClose: () => void;
}

export function NotificationPanel({ notifications, loading, onMarkAsRead, onClose }: NotificationPanelProps) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("ALLE");

  const filtered = notifications.filter((n) => {
    if (activeFilter === "ALLE")               return true;
    if (activeFilter === "UNGELESEN")          return !n.read;
    if (activeFilter === "ALLGEMEIN")          return n.module === null;
    return n.module === activeFilter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Stack gap={0} style={{ height: "100%", overflow: "hidden" }}>

      {/* ── Panel-Header ── */}
      <Box
        px="md"
        pt="md"
        pb="sm"
        style={{ borderBottom: "1px solid var(--mantine-color-gray-2)", flexShrink: 0 }}
      >
        <Group justify="space-between" align="center" mb="sm">
          <Group gap="sm" align="center">
            <Text fw={700} size="lg">Mitteilungen</Text>
            {unreadCount > 0 && (
              <Badge color="red" variant="filled" size="md" radius="xl">
                {unreadCount} neu
              </Badge>
            )}
          </Group>
          <Tooltip label="Schließen" withArrow>
            <ActionIcon variant="subtle" color="gray" size="sm" radius="xl" onClick={onClose}>
              <IconX size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>

        {/*
          wrap="wrap" sorgt dafür dass alle Tabs umbrechen statt zu scrollen.
          Damit sind immer alle Filteroptionen sichtbar egal wie schmal das Panel ist.
        */}
        <Group gap={6} wrap="wrap">
          {FILTERS.map((f) => (
            <FilterTab
              key={f.key}
              label={f.label}
              active={activeFilter === f.key}
              onClick={() => setActiveFilter(f.key)}
            />
          ))}
        </Group>
      </Box>

      {/* ── Inhalt ── */}
      <div className="custom-scroll" style={{ flex: 1, padding: "8px 16px" }}>
        {loading ? (
          <Stack align="center" py="xl" gap="xs">
            <Loader size="sm" />
            <Text size="xs" c="dimmed">Lädt...</Text>
          </Stack>
        ) : filtered.length === 0 ? (
          <Stack align="center" py={48} gap="sm">
            <ThemeIcon size={52} radius="xl" color="gray" variant="light">
              <IconBellOff size={26} />
            </ThemeIcon>
            <Text size="sm" c="dimmed" fw={500}>Keine Mitteilungen</Text>
            <Text size="xs" c="dimmed" ta="center" px="xl">
              {activeFilter === "ALLE"
                ? "Du bist auf dem neuesten Stand."
                : "Keine Mitteilungen in dieser Kategorie."}
            </Text>
          </Stack>
        ) : (
          <Stack gap="sm" pb="md">
            {filtered.map((n) => (
              <NotificationCard key={n.id} notification={n} onMarkAsRead={onMarkAsRead} />
            ))}
          </Stack>
        )}
      </div>
    </Stack>
  );
}