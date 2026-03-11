import { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Stack, Group, Box, Text, Title, Button, Paper, ThemeIcon,
  Badge, ActionIcon, Alert, Loader, Divider, Table, TextInput,
  ScrollArea, Tooltip,
} from "@mantine/core";
import {
  IconLock, IconArrowLeft, IconAlertCircle, IconBuilding, IconUser,
  IconShield, IconSearch, IconPlus, IconCheck, IconInfoCircle,
} from "@tabler/icons-react";
import { AuthContext } from "../../auth/AuthContext";
import { createApiClient } from "../../api/apiClient";
import { ScopeBadge } from "./ListPermissions";

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
  const { token } = useContext(AuthContext);
  const api = createApiClient(() => token);

  const getPermissionDetail = useCallback(
    (id: number): Promise<PermissionDetailDTO> =>
      api(`/backend/api/roles/permissions/${id}`),
    [token]
  );

  const getRoles = useCallback(
    (): Promise<RoleDto[]> => api("/backend/api/roles"),
    [token]
  );

  const assignPermissionToRole = useCallback(
    (roleName: string, currentPermIds: number[], newPermId: number): Promise<void> =>
      api(`/backend/api/roles/${encodeURIComponent(roleName)}/permissions`, {
        method: "PUT",
        body: JSON.stringify([...currentPermIds, newPermId]),
      }),
    [token]
  );

  return { getPermissionDetail, getRoles, assignPermissionToRole };
}

// ─── Sub-Component: InfoRow ───────────────────────────────────────────────────

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Group gap={0} align="flex-start" wrap="nowrap">
      <Text
        size="sm"
        fw={600}
        c="dimmed"
        style={{ width: 160, flexShrink: 0 }}
      >
        {label}
      </Text>
      <Box style={{ flex: 1, minWidth: 0 }}>
        {children}
      </Box>
    </Group>
  );
}

// ─── Sub-Component: RoleAssignPanel ──────────────────────────────────────────

function RoleAssignPanel({
  permissionId,
  alreadyAssignedNames,
  onAssigned,
}: {
  permissionId: number;
  alreadyAssignedNames: Set<string>;
  onAssigned: () => void;
}) {
  const { getRoles, assignPermissionToRole } = useDetailApi();

  const [allRoles, setAllRoles] = useState<RoleDto[]>([]);
  const [search, setSearch] = useState("");
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [assigningName, setAssigningName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoadingRoles(true);
      try {
        setAllRoles(await getRoles());
      } catch (e: any) {
        setError(e?.message ?? "Rollen konnten nicht geladen werden");
      } finally {
        setLoadingRoles(false);
      }
    })();
  }, []);

  // Nur Rollen die diese Permission noch NICHT haben
  const assignable = allRoles.filter(
    (r) =>
      !alreadyAssignedNames.has(r.uniqueName) &&
      (r.displayName.toLowerCase().includes(search.toLowerCase()) ||
        r.description?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAssign = async (role: RoleDto) => {
    setAssigningName(role.uniqueName);
    setError(null);
    try {
      const currentIds = role.permissions.map((p) => p.id);
      await assignPermissionToRole(role.uniqueName, currentIds, permissionId);
      onAssigned();
    } catch (e: any) {
      setError(e?.message ?? "Zuweisung fehlgeschlagen");
    } finally {
      setAssigningName(null);
    }
  };

  return (
    <Stack gap="sm">
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

      {loadingRoles ? (
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
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function DetailPermissionPage() {
  const { permissionId } = useParams<{ permissionId: string }>();
  const navigate = useNavigate();
  const { getPermissionDetail } = useDetailApi();

  const [permission, setPermission] = useState<PermissionDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Laden ─────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    if (!permissionId) return;
    setLoading(true);
    setError(null);
    try {
      setPermission(await getPermissionDetail(Number(permissionId)));
    } catch (e: any) {
      setError(e?.message ?? "Berechtigung konnte nicht geladen werden");
    } finally {
      setLoading(false);
    }
  }, [permissionId]);

  useEffect(() => { load(); }, [load]);

  // ── Loading / Error ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <Group justify="center" align="center" p="xl" style={{ height: "100%" }}>
        <Loader size="sm" color="secondary" />
        <Text size="sm" c="dimmed">Berechtigung wird geladen...</Text>
      </Group>
    );
  }

  if (error || !permission) {
    return (
      <Box p="xl" maw={580} mx="auto">
        <Alert color="red" icon={<IconAlertCircle size={16} />} radius="md">
          {error ?? "Berechtigung konnte nicht geladen werden"}
        </Alert>
        <Button mt="md" variant="light" color="secondary" radius="md"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate("/rollen/berechtigungen")}
        >
          Zurück zur Übersicht
        </Button>
      </Box>
    );
  }

  const alreadyAssignedNames = new Set(permission.usedInRoles.map((r) => r.uniqueName));

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Box p="xl" maw={860} mx="auto">
      <Stack gap="lg">

        {/* ── Header ── */}
        <Group gap="sm" wrap="nowrap">
          <ActionIcon
            variant="light"
            color="secondary"
            size="lg"
            radius="md"
            onClick={() => navigate("/rollen/berechtigungen")}
            style={{ flexShrink: 0 }}
          >
            <IconArrowLeft size={18} />
          </ActionIcon>
          <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
            <ThemeIcon
              size={40}
              variant="light"
              color={permission.scope === "COMPANY" ? "secondary" : "accent"}
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
        </Group>

        <Divider />

        {/* ── Zwei-Spalten-Layout ab md ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 24,
            alignItems: "start",
          }}
        >
          {/* ── Linke Spalte: Informationen ── */}
          <Stack gap="lg">

            {/* Details-Card */}
            <Paper withBorder radius="md" p="lg">
              <Group gap="xs" mb="md">
                <ThemeIcon size="sm" variant="transparent" color="dimmed">
                  <IconInfoCircle size={14} />
                </ThemeIcon>
                <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: 1 }}>
                  Details
                </Text>
              </Group>
              <Stack gap="sm">
                <InfoRow label="Permission Key">
                  <Text size="sm" ff="monospace" style={{ wordBreak: "break-all" }}>
                    {permission.permissionKey}
                  </Text>
                </InfoRow>
                <InfoRow label="Anzeigename">
                  <Text size="sm">{permission.displayName}</Text>
                </InfoRow>
                <InfoRow label="Scope">
                  <ScopeBadge scope={permission.scope} />
                </InfoRow>
                <InfoRow label="Beschreibung">
                  {permission.description ? (
                    <Text size="sm">{permission.description}</Text>
                  ) : (
                    <Text size="sm" c="dimmed" fs="italic">Keine Beschreibung</Text>
                  )}
                </InfoRow>
              </Stack>
            </Paper>

            {/* Verwendete Rollen */}
            <Paper withBorder radius="md" p="lg">
              <Group gap="xs" mb="md" justify="space-between">
                <Group gap="xs">
                  <ThemeIcon size="sm" variant="transparent" color="dimmed">
                    <IconShield size={14} />
                  </ThemeIcon>
                  <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: 1 }}>
                    Verwendet in Rollen
                  </Text>
                </Group>
                <Badge variant="light" color="primary" size="sm" radius="sm">
                  {permission.usedInRoles.length}
                </Badge>
              </Group>

              {permission.usedInRoles.length === 0 ? (
                <Text size="sm" c="dimmed" ta="center" py="sm">
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
                    style={{ borderRadius: 8, overflow: "hidden" }}
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
                          style={{ cursor: "pointer" }}
                          onClick={() => navigate(`/rollen/${encodeURIComponent(r.uniqueName)}`)}
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
                            <Text size="sm" c="dimmed" truncate>
                              {r.description || "–"}
                            </Text>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </ScrollArea>
              )}
            </Paper>
          </Stack>

          {/* ── Rechte Spalte: Rollen zuweisen ── */}
          <Paper withBorder radius="md" p="lg">
            <Group gap="xs" mb="md">
              <ThemeIcon size="sm" variant="transparent" color="dimmed">
                <IconPlus size={14} />
              </ThemeIcon>
              <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: 1 }}>
                Berechtigung einer Rolle zuweisen
              </Text>
            </Group>

            <Text size="xs" c="dimmed" mb="md">
              Nur Rollen die diese Berechtigung noch nicht besitzen werden angezeigt.
            </Text>

            <RoleAssignPanel
              permissionId={permission.id}
              alreadyAssignedNames={alreadyAssignedNames}
              onAssigned={load}
            />
          </Paper>
        </div>

      </Stack>
    </Box>
  );
}