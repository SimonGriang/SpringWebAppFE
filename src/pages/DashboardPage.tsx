import { useContext } from "react";
import {
  Badge,
  Button,
  Card,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { IconClock, IconFileInvoice, IconSettings, IconUsers } from "@tabler/icons-react";
import { AuthContext } from "../auth/AuthContext";
import { useNotificationContext } from "../components/layout/DefaultLayout";

// Modul-Key muss exakt dem NotificationModule-Enum im Backend entsprechen
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
    href: "/rols",
    moduleKey: "BENUTZERVERWALTUNG",
  },
  {
    title: "Einstellungen",
    description: "Systemweite Konfigurationen und Präferenzen festlegen.",
    icon: IconSettings,
    href: "/einstellungen",
    moduleKey: null, // kein Modul-Badge
  },
  {
    title: "Lieferscheinerstellung",
    description: "Lieferscheine erstellen, bearbeiten und exportieren.",
    icon: IconFileInvoice,
    href: "/lieferscheine",
    moduleKey: null,
  },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { moduleCounts } = useNotificationContext();

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">

        {/* Header */}
        <Stack gap={4}>
          <Title order={1}>Dashboard</Title>
          <Text c="dimmed">
            Hallo {user?.employeeFirstname ?? ""}, wähle ein Modul, um direkt in
            den jeweiligen Funktionsbereich zu springen.
          </Text>
        </Stack>

        {/* Modul-Karten */}
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {modules.map((mod) => {
            const Icon  = mod.icon;
            const count = mod.moduleKey ? (moduleCounts[mod.moduleKey] ?? 0) : 0;

            return (
              <Card key={mod.title} shadow="sm" padding="lg" radius="md" withBorder>
                <Card.Section>
                  <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                    <Icon size={80} />
                  </div>
                </Card.Section>

                <Group justify="space-between" mt="md" mb="xs">
                  <Text fw={500}>{mod.title}</Text>

                  {/* Badge ersetzt das alte "ON SALE" — zeigt offene Notifications */}
                  {count > 0 ? (
                    <Badge color="red" variant="filled">
                      {count} {count === 1 ? "Mitteilung" : "Mitteilungen"}
                    </Badge>
                  ) : (
                    <Badge color="green" variant="light">
                      Alles erledigt
                    </Badge>
                  )}
                </Group>

                <Text size="sm" c="dimmed">{mod.description}</Text>

                <Button
                  color="blue"
                  fullWidth
                  mt="md"
                  radius="md"
                  onClick={() => navigate(mod.href)}
                >
                  Modul öffnen
                </Button>
              </Card>
            );
          })}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}