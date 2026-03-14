import { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Stack, Group, Box, Text, Title, Button, TextInput, Paper,
  ThemeIcon, Badge, ActionIcon, Modal, Alert, Loader, Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconShield, IconShieldOff, IconPlus, IconTrash,
  IconChevronRight, IconAlertCircle, IconSearch, IconUsers,
} from "@tabler/icons-react";
import { AuthContext } from "../../auth/AuthContext";
import { createApiClient } from "../../api/apiClient";
import { ModuleContentShell } from "../../components/layout/ModuleContentShell";


// ─── Types ────────────────────────────────────────────────────────────────────

interface PermissionDTO {
  id: number;
}

interface RoleDto {
  uniqueName: string;
  displayName: string;
  description: string;
  permissions: PermissionDTO[];
  assignedEmployeeCount: number;
}

// ─── API Hook ─────────────────────────────────────────────────────────────────

function useRoleListApi() {
  const { token } = useContext(AuthContext);
  const api = createApiClient(() => token);

  const getRoles = useCallback(
    (): Promise<RoleDto[]> => api("/backend/api/roles"),
    [token]
  );

  const deleteRole = useCallback(
    (roleName: string): Promise<void> =>
      api(`/backend/api/roles/${encodeURIComponent(roleName)}`, { method: "DELETE" }),
    [token]
  );

  return { getRoles, deleteRole };
}

// ─── Sub-Component: RoleCard ──────────────────────────────────────────────────

function RoleCard({
  role,
  onClick,
  onDelete,
}: {
  role: RoleDto;
  onClick: () => void;
  onDelete: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isDeletable = role.assignedEmployeeCount === 0;
 
  return (
    <Paper
      withBorder
      radius="md"
      style={{
        cursor: "pointer",
        borderColor: hovered
          ? "var(--mantine-color-primary-4)"
          : "var(--mantine-color-default-border)",
        transition: "border-color 0.15s, box-shadow 0.15s",
        boxShadow: hovered ? "0 2px 8px rgba(0,0,0,0.08)" : undefined,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <Group p="md" justify="space-between" wrap="nowrap">
        {/* Left */}
        <Group gap="md" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
          <ThemeIcon size={38} variant="light" color="primary" radius="md" style={{ flexShrink: 0 }}>
            <IconShield size={20} />
          </ThemeIcon>
          <Box style={{ minWidth: 0 }}>
            <Text fw={600} truncate>{role.displayName}</Text>
            <Text size="xs" c="dimmed" truncate>
              {role.description || "No description"}
            </Text>
          </Box>
        </Group>
 
        {/* Right */}
        <Group gap="xs" wrap="nowrap" style={{ flexShrink: 0 }}>
          <Badge variant="light" color="primary" size="sm" radius="sm">
            {role.permissions.length}{" "}
            {role.permissions.length === 1 ? "Berechtigung" : "Berechtigungen"}
          </Badge>
 
          {/* Show assigned employee count if any */}
          {role.assignedEmployeeCount > 0 && (
            <Badge variant="light" color="gray" size="sm" radius="sm" leftSection={<IconUsers size={10} />}>
              {role.assignedEmployeeCount}
            </Badge>
          )}
 
          <Tooltip
            label={
              isDeletable
                ? "Rolle löschen"
                : `Nicht löschbar – ${role.assignedEmployeeCount} ${role.assignedEmployeeCount === 1 ? "Mitarbeiter" : "Mitarbeitern"} zugewiesen`
            }
            withArrow
          >
            <ActionIcon
              color="red"
              variant="subtle"
              size="sm"
              radius="md"
              disabled={!isDeletable}
              onClick={(e) => {
                e.stopPropagation();
                if (isDeletable) onDelete();
              }}
            >
              <IconTrash size={14} />
            </ActionIcon>
          </Tooltip>
          <IconChevronRight
            size={16}
            color="var(--mantine-color-dimmed)"
            style={{
              transition: "transform 0.15s",
              transform: hovered ? "translateX(2px)" : "none",
            }}
          />
        </Group>
      </Group>
    </Paper>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function RoleManagementPage() {
  const navigate = useNavigate();
  const { getRoles, deleteRole } = useRoleListApi();

  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<RoleDto | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);

  // ── Laden ─────────────────────────────────────────────────────────────────

  const loadRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRoles(await getRoles());
    } catch (e: any) {
      setError(e?.message ?? "Rollen konnten nicht geladen werden");
    } finally {
      setLoading(false);
    }
  }, [getRoles]);

  useEffect(() => { loadRoles(); }, []);

  // ── Löschen ───────────────────────────────────────────────────────────────

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteRole(deleteTarget.uniqueName);
      closeDelete();
      setDeleteTarget(null);
      await loadRoles();
    } catch (e: any) {
      setError(e?.message ?? "Löschen fehlgeschlagen");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Filter ────────────────────────────────────────────────────────────────

  const filtered = roles.filter(
    (r) =>
      r.displayName.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase())
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <ModuleContentShell>
        <Stack p="lg">

          {/* Header */}
          <Group justify="space-between" align="flex-start">
            <Group gap="sm">
              <ThemeIcon size={40} variant="light" color="primary" radius="md">
                <IconShield size={22} />
              </ThemeIcon>
              <Box>
                <Title order={3} fw={600}>Rollen</Title>
                <Text size="sm" c="dimmed">
                  {roles.length} {roles.length === 1 ? "Rolle" : "Rollen"} im Unternehmen
                </Text>
              </Box>
            </Group>
          </Group>

          {/* Error */}
          {error && (
            <Alert
              color="red"
              icon={<IconAlertCircle size={16} />}
              radius="md"
              withCloseButton
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {/* Search + Create */}
          <Group gap="sm" wrap="nowrap">
            <TextInput
              placeholder="Rollen durchsuchen..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              radius="md"
              style={{ flex: 1 }}
            />
            <Button
              leftSection={<IconPlus size={16} />}
              radius="md"
              color="primary"
              onClick={() => navigate("/rollen/erstellen")}
              style={{ flexShrink: 0 }}
            >
              Neue Rolle
            </Button>
          </Group>

          {/* Liste */}
          {loading ? (
            <Group justify="center" py="xl">
              <Loader size="sm" color="primary" />
              <Text size="sm" c="dimmed">Rollen werden geladen...</Text>
            </Group>
          ) : filtered.length === 0 ? (
            <Paper withBorder p="xl" ta="center" radius="md">
              <ThemeIcon size={48} variant="light" color="gray" mx="auto" mb="sm">
                <IconShieldOff size={24} />
              </ThemeIcon>
              <Text fw={500} mb={4}>
                {search ? "Keine Treffer" : "Noch keine Rollen vorhanden"}
              </Text>
              <Text size="sm" c="dimmed">
                {search
                  ? `Keine Rolle enthält „${search}"`
                  : "Erstelle die erste Rolle für dein Unternehmen"}
              </Text>
            </Paper>
          ) : (
            <Stack gap="sm">
              {filtered.map((role) => (
                <RoleCard
                  key={role.uniqueName}
                  role={role}
                  onClick={() => navigate(`/rollen/${encodeURIComponent(role.uniqueName)}`)}
                  onDelete={() => { setDeleteTarget(role); openDelete(); }}
                />
              ))}
            </Stack>
          )}

        </Stack>
      </ModuleContentShell>
      {/* Delete Modal */}
      <Modal
        opened={deleteOpened}
        onClose={closeDelete}
        title={
          <Group gap="sm">
            <ThemeIcon color="red" variant="light" size="md" radius="md">
              <IconTrash size={16} />
            </ThemeIcon>
            <Text fw={600}>Rolle löschen</Text>
          </Group>
        }
        centered
        size="sm"
        radius="md"
      >
        <Stack gap="md">
          <Alert color="red" radius="md" icon={<IconAlertCircle size={16} />}>
            Die Rolle <strong>{deleteTarget?.displayName}</strong> wird unwiderruflich
            gelöscht. Die Rolle ist keinem Mitarbeiter mehr zugeordnet, somit sind keine Verhaltensänderungen zu erwarten.
          </Alert>
          <Group justify="flex-end">
            <Button variant="light" color="secondary" radius="md" onClick={closeDelete}>
              Abbrechen
            </Button>
            <Button
              color="red"
              radius="md"
              loading={deleteLoading}
              leftSection={<IconTrash size={16} />}
              onClick={handleDeleteConfirm}
            >
              Endgültig löschen
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}