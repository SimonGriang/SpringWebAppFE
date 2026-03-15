import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Stack, Group, Box, Text, Title, Paper, ThemeIcon, Badge,
  ActionIcon, Alert, Loader, Divider, Table, ScrollArea,
  TextInput, Button, Modal,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconLock, IconArrowLeft, IconAlertCircle, IconBuilding,
  IconUser, IconShield, IconSearch, IconPlus, IconInfoCircle,
  IconShieldOff,
} from "@tabler/icons-react";
import { useApiClient } from "../../api/useApiClient";
import { useAuth } from "../../auth/AuthContext";
import { ScopeBadge } from "./ListPermissions";
import { ModuleContentShell } from "../../components/layout/ModuleContentShell";

// ─── Types ────────────────────────────────────────────────────────────────────

type PermissionScope = "COMPANY" | "EMPLOYEE";

interface RoleSlimDTO {
  uniqueName: string;
  displayName: string;
  description: string;
}

interface PermissionDetailDTO {
  id: number;
  permissionKey: string;
  displayName: string;
  resolvedLabel: string;
  description: string | null;
  scope: PermissionScope;
  usedInRoles: RoleSlimDTO[];
}

interface RoleDto {
  uniqueName: string;
  displayName: string;
  description: string;
  permissions: { id: number }[];
}

// ─── API Hook ─────────────────────────────────────────────────────────────────

function useDetailApi() {
  const api = useApiClient();

  const getPermissionDetail = useCallback(
    (id: number): Promise<PermissionDetailDTO> =>
      api(`/backend/api/roles/permissions/${id}`),
    [api]
  );

  const getRoles = useCallback(
    (): Promise<RoleDto[]> => api("/backend/api/roles"),
    [api]
  );

  const assignToRole = useCallback(
    (roleName: string, currentPermIds: number[], newPermId: number): Promise<void> =>
      api(`/backend/api/roles/${encodeURIComponent(roleName)}/permissions`, {
        method: "PUT",
        body: JSON.stringify([...currentPermIds, newPermId]),
      }),
    [api]
  );

  return { getPermissionDetail, getRoles, assignToRole };
}

// ─── Sub-Component: InfoRow ───────────────────────────────────────────────────

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Group gap={0} align="flex-start" wrap="nowrap">
      <Text size="sm" fw={600} c="dimmed" style={{ width: 160, flexShrink: 0 }}>
        {label}
      </Text>
      <Box style={{ flex: 1, minWidth: 0 }}>{children}</Box>
    </Group>
  );
}

// ─── Sub-Component: AssignToRoleModal ────────────────────────────────────────

function AssignToRoleModal({
  opened,
  onClose,
  permission,
  onAssigned,
}: {
  opened: boolean;
  onClose: () => void;
  permission: PermissionDetailDTO;
  onAssigned: () => void;
}) {
  const { getRoles, assignToRole } = useDetailApi();
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [assigningName, setAssigningName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // IDs of roles that already have this permission
  const assignedNames = new Set(permission.usedInRoles.map((r) => r.uniqueName));

  useEffect(() => {
    if (!opened) return;
    setLoading(true);
    setError(null);
    getRoles()
      .then(setRoles)
      .catch((e) => setError(e?.message ?? "Rollen konnten nicht geladen werden"))
      .finally(() => setLoading(false));
  }, [opened]);

  const assignable = roles.filter(
    (r) =>
      !assignedNames.has(r.uniqueName) &&
      (r.displayName.toLowerCase().includes(search.toLowerCase()) ||
        r.description?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAssign = async (role: RoleDto) => {
    setAssigningName(role.uniqueName);
    setError(null);
    try {
      const currentIds = role.permissions.map((p) => p.id);
      await assignToRole(role.uniqueName, currentIds, permission.id);
      onAssigned();
      onClose();
    } catch (e: any) {
      setError(e?.message ?? "Zuweisung fehlgeschlagen");
    } finally {
      setAssigningName(null);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <ThemeIcon size="md" variant="light" color="primary" radius="md">
            <IconPlus size={15} />
          </ThemeIcon>
          <Text fw={600}>Berechtigung einer Rolle zuweisen</Text>
        </Group>
      }
      centered
      size="md"
      radius="md"
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Nur Rollen ohne diese Berechtigung werden angezeigt.
        </Text>

        <TextInput
          placeholder="Rolle suchen..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          radius="md"
        />

        {error && (
          <Alert color="red" icon={<IconAlertCircle size={14} />} radius="md" py="xs">
            {error}
          </Alert>
        )}

        {loading ? (
          <Group justify="center" py="md">
            <Loader size="xs" color="primary" />
          </Group>
        ) : assignable.length === 0 ? (
          <Paper withBorder p="md" ta="center" radius="md">
            <Text size="sm" c="dimmed">
              {search
                ? "Keine passenden Rollen gefunden"
                : "Alle Rollen haben diese Berechtigung bereits"}
            </Text>
          </Paper>
        ) : (
          <ScrollArea mah={320} offsetScrollbars>
            <Stack gap="xs">
              {assignable.map((role) => (
                <Paper key={role.uniqueName} withBorder p="sm" radius="md">
                  <Group justify="space-between" wrap="nowrap">
                    <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                      <ThemeIcon size={30} variant="light" color="primary" radius="md" style={{ flexShrink: 0 }}>
                        <IconShield size={15} />
                      </ThemeIcon>
                      <Box style={{ minWidth: 0 }}>
                        <Text size="sm" fw={500} truncate>{role.displayName}</Text>
                        {role.description && (
                          <Text size="xs" c="dimmed" truncate>{role.description}</Text>
                        )}
                      </Box>
                    </Group>
                    <Button
                      size="xs"
                      variant="light"
                      color="primary"
                      radius="md"
                      loading={assigningName === role.uniqueName}
                      leftSection={<IconPlus size={12} />}
                      onClick={() => handleAssign(role)}
                      style={{ flexShrink: 0 }}
                    >
                      Zuweisen
                    </Button>
                  </Group>
                </Paper>
              ))}
            </Stack>
          </ScrollArea>
        )}
      </Stack>
    </Modal>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function DetailsPermissionPage() {
  const { permissionId } = useParams<{ permissionId: string }>();
  const navigate = useNavigate();
  const { token, permissionProfile } = useAuth();
  const { getPermissionDetail } = useDetailApi();

  const [permission, setPermission] = useState<PermissionDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [assignOpened, { open: openAssign, close: closeAssign }] = useDisclosure(false);

  // ── Permission guard ──────────────────────────────────────────────────────
  const canView =
    permissionProfile?.companyPermissions.includes("ROLE_MANAGE") ||
    permissionProfile?.companyPermissions.includes("ROLE_VIEW");

  // ── Load ──────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    if (!permissionId || !canView) return;
    setLoading(true);
    setError(null);
    try {
      setPermission(await getPermissionDetail(Number(permissionId)));
    } catch (e: any) {
      setError(e?.message ?? "Berechtigung konnte nicht geladen werden");
    } finally {
      setLoading(false);
    }
  }, [permissionId, canView]);

  useEffect(() => { load(); }, [load]);

  // ── Not authorized ────────────────────────────────────────────────────────

  if (!canView) {
    return (
      <Box p="xl" maw={580} mx="auto">
        <Alert
          color="red"
          icon={<IconShieldOff size={18} />}
          radius="md"
          title="Keine Berechtigung"
        >
          Du hast keine Berechtigung, Berechtigungen einzusehen. Wende dich an einen Administrator.
        </Alert>
        <Button
          mt="md"
          variant="light"
          color="secondary"
          radius="md"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate("/dashboard")}
        >
          Zum Dashboard
        </Button>
      </Box>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <Group justify="center" align="center" p="xl" style={{ height: "100%" }}>
        <Loader size="sm" color="secondary" />
        <Text size="sm" c="dimmed">Berechtigung wird geladen...</Text>
      </Group>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────

  if (error || !permission) {
    return (
      <Box p="xl" maw={580} mx="auto">
        <Alert color="red" icon={<IconAlertCircle size={16} />} radius="md">
          {error ?? "Berechtigung konnte nicht geladen werden"}
        </Alert>
        <Button
          mt="md"
          variant="light"
          color="secondary"
          radius="md"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate("/rollen/berechtigungen")}
        >
          Zurück zur Übersicht
        </Button>
      </Box>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <ModuleContentShell p="xl">
        <Stack gap="lg">

          {/* Header */}
          <Group gap="sm" wrap="nowrap">
            <ActionIcon
              variant="light"
              color="secondary"
              size="lg"
              radius="md"
              onClick={() => navigate("/iam/permissions")}
              style={{ flexShrink: 0 }}
            >
              <IconArrowLeft size={18} />
            </ActionIcon>
            <ThemeIcon
              size={40}
              variant="light"
              color={permission.scope === "COMPANY" ? "secondary" : "primary"}
              radius="md"
              style={{ flexShrink: 0 }}
            >
              <IconLock size={22} />
            </ThemeIcon>
            <Box style={{ minWidth: 0 }}>
              <Title
                order={3}
                fw={600}
                style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
                {permission.resolvedLabel}
              </Title>
              <Text size="xs" c="dimmed" ff="monospace" truncate>
                {permission.permissionKey}
              </Text>
            </Box>
          </Group>

          <Divider />


          {/* Details Card */}
          <Paper withBorder radius="md" p="lg">
            <Group gap="xs" mb="md">
              <ThemeIcon size="sm" variant="transparent" color="dimmed">
                <IconInfoCircle size={14} />
              </ThemeIcon>
              <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: 1 }}>
                Details
              </Text>
            </Group>
            <Table verticalSpacing="sm" horizontalSpacing="md">
              <Table.Tbody>
                <Table.Tr>
                  <Table.Td w={180}>
                    <Text size="sm" fw={600} c="dimmed">Permission Key</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" ff="monospace" style={{ wordBreak: "break-all" }}>
                      {permission.permissionKey}
                    </Text>
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>
                    <Text size="sm" fw={600} c="dimmed">Anzeigename</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{permission.displayName}</Text>
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>
                    <Text size="sm" fw={600} c="dimmed">Scope</Text>
                  </Table.Td>
                  <Table.Td>
                    <ScopeBadge scope={permission.scope} />
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>
                    <Text size="sm" fw={600} c="dimmed">Beschreibung</Text>
                  </Table.Td>
                  <Table.Td>
                    {permission.description ? (
                      <Text size="sm">{permission.description}</Text>
                    ) : (
                      <Text size="sm" c="dimmed" fs="italic">Keine Beschreibung</Text>
                    )}
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
          </Paper>

          {/* Used in roles Card */}
          <Paper withBorder radius="md" p="lg">
            <Group mb="md" justify="space-between" align="center">
              <Group gap="xs">
                <ThemeIcon size="sm" variant="transparent" color="dimmed">
                  <IconShield size={14} />
                </ThemeIcon>
                <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: 1 }}>
                  Verwendet in Rollen
                </Text>
                <Badge variant="light" color="primary" size="sm" radius="sm">
                  {permission.usedInRoles.length}
                </Badge>
              </Group>
              <Button
                size="xs"
                variant="light"
                color="primary"
                radius="md"
                leftSection={<IconPlus size={12} />}
                onClick={openAssign}
              >
                Rolle zuweisen
              </Button>
            </Group>

            {permission.usedInRoles.length === 0 ? (
              <Text size="sm" c="dimmed" ta="center" py="md">
                Noch keiner Rolle zugewiesen
              </Text>
            ) : (
              <ScrollArea>
                <Table
                  striped
                  highlightOnHover
                  withTableBorder
                  withColumnBorders
                  verticalSpacing="sm"
                  horizontalSpacing="sm"
                >
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>
                        <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: 0.5 }}>
                          Rolle
                        </Text>
                      </Table.Th>
                      <Table.Th>
                        <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: 0.5 }}>
                          Beschreibung
                        </Text>
                      </Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {permission.usedInRoles.map((r) => (
                      <Table.Tr
                        key={r.uniqueName}
                        style={{ cursor: "pointer", userSelect: "none" }}
                        onClick={() => navigate(`/iam/roles/${encodeURIComponent(r.uniqueName)}`)}
                      >
                        <Table.Td>
                          <Group gap="xs" wrap="nowrap">
                            <ThemeIcon size={22} variant="light" color="primary" radius="sm" style={{ flexShrink: 0 }}>
                              <IconShield size={12} />
                            </ThemeIcon>
                            <Box style={{ minWidth: 0 }}>
                              <Text size="sm" fw={500} truncate>{r.displayName}</Text>
                              <Text size="xs" c="dimmed" ff="monospace" truncate>{r.uniqueName}</Text>
                            </Box>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" c="dimmed" truncate>{r.description || "–"}</Text>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            )}
          </Paper>

        </Stack>
      </ModuleContentShell>

      <AssignToRoleModal
        opened={assignOpened}
        onClose={closeAssign}
        permission={permission}
        onAssigned={load}
      />
    </>
  );
}