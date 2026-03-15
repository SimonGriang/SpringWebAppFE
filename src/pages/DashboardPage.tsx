import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Text, Group, SimpleGrid, Stack, Title, ThemeIcon, Badge,
} from "@mantine/core";
import {
  IconClock, IconUsers, IconSettings, IconFileInvoice,
  IconChevronRight,
} from "@tabler/icons-react";
import { AuthContext } from "../auth/AuthContext";
import { useNotificationContext } from "../components/layout/DefaultLayout";

// ─── Module config ────────────────────────────────────────────────────────────

const modules = [
  {
    title: "Zeiterfassung",
    description: "Arbeitszeiten erfassen, bearbeiten und auswerten.",
    icon: IconClock,
    href: "/zeiterfassung",
    moduleKey: "ZEITERFASSUNG",
  },
  {
    title: "Benutzerverwaltung",
    description: "Benutzer anlegen, Rollen verwalten und Berechtigungen steuern.",
    icon: IconUsers,
    href: "/iam/roles",
    moduleKey: "BENUTZERVERWALTUNG",
  },
  {
    title: "Einstellungen",
    description: "Systemweite Konfigurationen und Präferenzen festlegen.",
    icon: IconSettings,
    href: "/einstellungen",
    moduleKey: null,
  },
  {
    title: "Lieferscheinerstellung",
    description: "Lieferscheine erstellen, bearbeiten und exportieren.",
    icon: IconFileInvoice,
    href: "/lieferscheine",
    moduleKey: null,
  },
];

// ─── Module Card ──────────────────────────────────────────────────────────────

function ModuleCard({
  title,
  description,
  icon: Icon,
  href,
  moduleKey,
}: (typeof modules)[0]) {
  const navigate = useNavigate();
  const { moduleCounts } = useNotificationContext();
  const [hovered, setHovered] = useState(false);

  const count = moduleKey ? (moduleCounts[moduleKey] ?? 0) : 0;

  return (
    <Box
      onClick={() => navigate(href)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 12,
        border: "1px solid var(--mantine-color-default-border)",
        padding: "32px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        backgroundColor: "var(--mantine-color-body)",
        boxShadow: hovered
          ? "0 4px 16px rgba(0,0,0,0.08)"
          : "0 1px 4px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-2px)" : "none",
        transition: "box-shadow 0.18s ease, transform 0.18s ease",
        cursor: "pointer",
        minHeight: 220,
        userSelect: "none",
      }}
    >
      {/* Icon */}
      <ThemeIcon size={64} radius="md" variant="light" color="primary">
        <Icon size={34} />
      </ThemeIcon>

      {/* Text */}
      <Box style={{ flex: 1 }}>
        <Text fw={600} size="lg" mb={8}>
          {title}
        </Text>
        <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
          {description}
        </Text>
      </Box>

      {/* Footer: notification badge left, arrow right */}
      <Group justify="space-between" align="center">
        {count > 0 ? (
          <Badge color="red" variant="filled" radius="sm">
            {count} {count === 1 ? "Mitteilung" : "Mitteilungen"}
          </Badge>
        ) : (
          <Badge color="gray" variant="light" radius="sm">
            Keine Mitteilungen
          </Badge>
        )}
        <IconChevronRight
          size={16}
          color="var(--mantine-color-primary-6)"
          style={{
            transform: hovered ? "translateX(3px)" : "none",
            transition: "transform 0.18s ease",
          }}
        />
      </Group>
    </Box>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const { user } = useContext(AuthContext);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Guten Morgen" : hour < 18 ? "Guten Tag" : "Guten Abend";

  return (
    <Box p="xl">
      <Stack gap="xl" maw={1100} mx="auto">

        {/* Header Banner */}
        <Box
          style={{
            borderRadius: 16,
            padding: "32px 36px",
            background:
              "linear-gradient(135deg, var(--mantine-color-primary-6) 0%, var(--mantine-color-secondary-6) 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
          <Box style={{ position: "absolute", bottom: -60, right: 80, width: 140, height: 140, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

          <Stack gap={6} style={{ position: "relative" }}>
            <Text size="sm" fw={500} style={{ color: "rgba(255,255,255,0.7)", letterSpacing: "0.04em" }} tt="uppercase">
              {greeting}
            </Text>
            <Title order={2} fw={700} style={{ color: "#ffffff", fontSize: "1.75rem" }}>
              {user?.employeeFirstname} {user?.employeeSurname}
            </Title>
            <Text style={{ color: "rgba(255,255,255,0.65)" }} size="sm">
              Wähle ein Modul, um direkt in den jeweiligen Funktionsbereich zu springen.
            </Text>
          </Stack>
        </Box>

        {/* Module Grid */}
        <Box>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="md" style={{ letterSpacing: "0.06em" }}>
            Module
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {modules.map((mod) => (
              <ModuleCard key={mod.href} {...mod} />
            ))}
          </SimpleGrid>
        </Box>

      </Stack>
    </Box>
  );
}