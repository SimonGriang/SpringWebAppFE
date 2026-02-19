import React, { useContext } from "react";
import { Card, Text, Group, Button, SimpleGrid, Container, Badge, Stack, Title } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { IconClock, IconUsers, IconSettings, IconFileInvoice } from "@tabler/icons-react";
import { AuthContext } from "../auth/AuthContext";

const modules = [
  { title: "Zeiterfassung", description: "Arbeitszeiten erfassen, bearbeiten und auswerten.", icon: IconClock, href: "/zeiterfassung" },
  { title: "Benutzerverwaltung", description: "Benutzer anlegen, Rollen verwalten und Berechtigungen steuern.", icon: IconUsers, href: "/benutzerverwaltung" },
  { title: "Einstellungen", description: "Systemweite Konfigurationen und Präferenzen festlegen.", icon: IconSettings, href: "/einstellungen" },
  { title: "Lieferscheinerstellung", description: "Lieferscheine erstellen, bearbeiten und exportieren.", icon: IconFileInvoice, href: "/lieferscheine" }
];

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">

        {/* Header */}
        <Stack gap={4}>
          <Title order={1}>
            Dashboard
          </Title>

          <Text c="dimmed">
            Hallo {user?.employeeFirstname ?? ""}, wähle ein Modul, um direkt in
            den jeweiligen Funktionsbereich zu springen.
          </Text>
        </Stack>
        <SimpleGrid
          cols={{ base: 1, sm: 2, lg: 3 }}
          spacing="lg"
        >
          {/* Card 1 */}
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                <IconClock size={80} />
              </div>
            </Card.Section>

            <Group justify="space-between" mt="md" mb="xs">
              <Text fw={500}>Norway Fjord Adventures</Text>
              <Badge color="pink">On Sale</Badge>
            </Group>

            <Text size="sm" c="dimmed">
              Explore magical fjord landscapes with tours and activities.
            </Text>

            <Button color="blue" fullWidth mt="md" radius="md">
              Book classic tour now
            </Button>
          </Card>

          {/* Card 2 */}
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                <IconUsers size={80} />
              </div>
            </Card.Section>

            <Group justify="space-between" mt="md" mb="xs">
              <Text fw={500}>Arctic Expedition</Text>
              <Badge color="pink">On Sale</Badge>
            </Group>

            <Text size="sm" c="dimmed">
              Discover the untouched beauty of the Arctic region.
            </Text>

            <Button color="blue" fullWidth mt="md" radius="md">
              Book classic tour now
            </Button>
          </Card>

          {/* Card 3 */}
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                <IconSettings size={80} />
              </div>
            </Card.Section>

            <Group justify="space-between" mt="md" mb="xs">
              <Text fw={500}>Mountain Hiking</Text>
              <Badge color="pink">On Sale</Badge>
            </Group>

            <Text size="sm" c="dimmed">
              Experience breathtaking mountain views and fresh air.
            </Text>

            <Button color="blue" fullWidth mt="md" radius="md">
              Book classic tour now
            </Button>
          </Card>

          {/* Card 4 */}
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                <IconFileInvoice size={80} />
              </div>
            </Card.Section>

            <Group justify="space-between" mt="md" mb="xs">
              <Text fw={500}>City Exploration</Text>
              <Badge color="pink">On Sale</Badge>
            </Group>

            <Text size="sm" c="dimmed">
              Discover vibrant cities with guided exploration tours.
            </Text>

            <Button color="blue" fullWidth mt="md" radius="md">
              Book classic tour now
            </Button>
          </Card>
      </SimpleGrid>
    </Stack>
  </Container>
  );
}
