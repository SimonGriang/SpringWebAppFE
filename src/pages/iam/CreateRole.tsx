import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Stack, Group, Box, Text, Title, Button, TextInput, Textarea,
  Paper, ThemeIcon, Alert, Divider, ActionIcon,
} from "@mantine/core";
import {
  IconShieldPlus, IconArrowLeft, IconAlertCircle, IconCheck,
} from "@tabler/icons-react";
import { AuthContext } from "../../auth/AuthContext";
import { createApiClient } from "../../api/apiClient";

// ─── API ──────────────────────────────────────────────────────────────────────

function useCreateRoleApi() {
  const { token } = useContext(AuthContext);
  const api = createApiClient(() => token);

  const createRole = (displayName: string, description: string) =>
    api("/backend/api/roles", {
      method: "POST",
      body: JSON.stringify({ displayName, description }),
    });

  return { createRole };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function CreateRolePage() {
  const navigate = useNavigate();
  const { createRole } = useCreateRoleApi();

  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!displayName.trim()) {
      setError("Name der Rolle ist erforderlich.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const created = await createRole(displayName.trim(), description.trim());
      // Nach dem Erstellen direkt zur Detailansicht der neuen Rolle
      navigate(`/rollen/${encodeURIComponent(created.uniqueName)}`);
    } catch (e: any) {
      setError(e?.message ?? "Rolle konnte nicht erstellt werden.");
      setSaving(false);
    }
  };

  return (
    <Box p="xl" maw={580} mx="auto">
      <Stack gap="lg">

        {/* ── Header ── */}
        <Group gap="sm">
          <ActionIcon
            variant="light"
            color="secondary"
            size="lg"
            radius="md"
            onClick={() => navigate("/rols")}
          >
            <IconArrowLeft size={18} />
          </ActionIcon>
          <Group gap="sm">
            <ThemeIcon size={40} variant="light" color="primary" radius="md">
              <IconShieldPlus size={22} />
            </ThemeIcon>
            <Box>
              <Title order={3} fw={600}>Neue Rolle erstellen</Title>
              <Text size="sm" c="dimmed">Lege eine neue Rolle für dein Unternehmen an</Text>
            </Box>
          </Group>
        </Group>

        <Divider />

        {/* ── Error ── */}
        {error && (
          <Alert color="red" icon={<IconAlertCircle size={16} />} radius="md" withCloseButton onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* ── Formular ── */}
        <Paper withBorder radius="md" p="lg">
          <Stack gap="md">
            <TextInput
              label="Name der Rolle"
              description="Wird den Mitarbeitern als Rollenbezeichnung angezeigt"
              placeholder="z. B. Teamleiter, HR-Manager, Buchhalter"
              value={displayName}
              onChange={(e) => setDisplayName(e.currentTarget.value)}
              required
              radius="md"
            />
            <Textarea
              label="Beschreibung"
              description="Optional – hilft dabei, den Zweck der Rolle zu verstehen"
              placeholder="Wofür ist diese Rolle gedacht? Welche Verantwortlichkeiten hat sie?"
              value={description}
              onChange={(e) => setDescription(e.currentTarget.value)}
              rows={4}
              radius="md"
            />
          </Stack>
        </Paper>

        {/* ── Aktionen ── */}
        <Group>
          <Button
            onClick={handleSave}
            loading={saving}
            leftSection={<IconCheck size={16} />}
            radius="md"
            color="primary"
          >
            Rolle erstellen
          </Button>
          <Button
            variant="light"
            color="secondary"
            radius="md"
            onClick={() => navigate("/rollen")}
            disabled={saving}
          >
            Abbrechen
          </Button>
        </Group>

      </Stack>
    </Box>
  );
}