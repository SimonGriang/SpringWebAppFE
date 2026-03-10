import { Stack, Title, Text, Paper, Group, ThemeIcon, Badge } from "@mantine/core";
import { IconShield } from "@tabler/icons-react";

export function RoleManagementPage() {
  return (
    <Stack p="xl" gap="lg">
      <Group gap="sm">
        <ThemeIcon size="lg" variant="light" color="primary">
          <IconShield size={20} />
        </ThemeIcon>
        <div>
          <Title order={3} fw={600}>Rollen</Title>
          <Text size="sm" c="dimmed">Übersicht aller Rollen im Unternehmen</Text>
        </div>
      </Group>

      {/* TODO: Hier kommt die echte Rollenliste */}
      <Paper withBorder p="xl" ta="center">
        <Text c="dimmed">Rollenliste wird hier implementiert</Text>
      </Paper>
    </Stack>
  );
}