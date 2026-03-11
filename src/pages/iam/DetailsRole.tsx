import { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Stack, Group, Box, Text, Title, Button, Paper, ThemeIcon,
  Badge, ActionIcon, Alert, Loader, Divider, Tabs, Checkbox,
  Modal, Avatar, TextInput, Tooltip, ScrollArea,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconShieldCheck, IconShieldOff, IconArrowLeft, IconAlertCircle,
  IconLock, IconBuilding, IconUser, IconUsers, IconCheck,
  IconTrash, IconSearch, IconPlus, IconDeviceFloppy,
} from "@tabler/icons-react";
import { AuthContext } from "../../auth/AuthContext";
import { createApiClient } from "../../api/apiClient";

// ─── Types ────────────────────────────────────────────────────────────────────

type PermissionScope = "COMPANY" | "EMPLOYEE";

interface PermissionDTO {
  id: number;
  permissionKey: string;
  displayName: string;
  resolvedLabel: string;
  scope: PermissionScope;
}

interface RoleDto {
  uniqueName: string;
  displayName: string;
  description: string;
  permissions: PermissionDTO[];
}

interface EmployeeDto {
  id: number;
  firstname: string;
  surname: string;
  employeeNumber: string;
}

// ─── API Hook ─────────────────────────────────────────────────────────────────

function useDetailApi() {
  const { token } = useContext(AuthContext);
  const api = createApiClient(() => token);

  const getRoles = useCallback(
    (): Promise<RoleDto[]> => api("/backend/api/roles"),
    [token]
  );

  const getPermissions = useCallback(
    (): Promise<PermissionDTO[]> => api("/backend/api/roles/permissions"),
    [token]
  );

  const getEmployees = useCallback(
    (): Promise<EmployeeDto[]> => api("/backend/api/employees"),
    [token]
  );

  const setPermissions = useCallback(
    (roleName: string, ids: number[]): Promise<void> =>
      api(`/backend/api/roles/${encodeURIComponent(roleName)}/permissions`, {
        method: "PUT",
        body: JSON.stringify(ids),
      }),
    [token]
  );

  const assignEmployee = useCallback(
    (roleName: string, employeeId: number): Promise<void> =>
      api(`/backend/api/roles/${encodeURIComponent(roleName)}/employees`, {
        method: "POST",
        body: JSON.stringify({ employeeId }),
      }),
    [token]
  );

  const removeEmployee = useCallback(
    (roleName: string, employeeId: number): Promise<void> =>
      api(`/backend/api/roles/${encodeURIComponent(roleName)}/employees/${employeeId}`, {
        method: "DELETE",
      }),
    [token]
  );

  const deleteRole = useCallback(
    (roleName: string): Promise<void> =>
      api(`/backend/api/roles/${encodeURIComponent(roleName)}`, {
        method: "DELETE",
      }),
    [token]
  );

  return { getRoles, getPermissions, getEmployees, setPermissions, assignEmployee, removeEmployee, deleteRole };
}

// ─── Shared: ScopeBadge ───────────────────────────────────────────────────────

function ScopeBadge({ scope }: { scope: PermissionScope }) {
  return scope === "COMPANY" ? (
    <Badge color="secondary" variant="light" size="xs" leftSection={<IconBuilding size={9} />}>
      Unternehmen
    </Badge>
  ) : (
    <Badge color="accent" variant="light" size="xs" leftSection={<IconUser size={9} />}>
      Mitarbeiter
    </Badge>
  );
}

// ─── Tab: Berechtigungen ──────────────────────────────────────────────────────

function PermissionsTab({
  role,
  allPermissions,
  onSave,
}: {
  role: RoleDto;
  allPermissions: PermissionDTO[];
  onSave: (ids: number[]) => Promise<void>;
}) {
  const [selected, setSelected] = useState<Set<number>>(
    new Set(role.permissions.map((p) => p.id))
  );
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [search, setSearch] = useState("");

  const toggle = (id: number, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      checked ? next.add(id) : next.delete(id);
      return next;
    });
    setSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(Array.from(selected));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const companyPerms = allPermissions.filter(
    (p) => p.scope === "COMPANY" &&
      (p.resolvedLabel.toLowerCase().includes(search.toLowerCase()) ||
        p.permissionKey.toLowerCase().includes(search.toLowerCase()))
  );
  const employeePerms = allPermissions.filter(
    (p) => p.scope === "EMPLOYEE" &&
      (p.resolvedLabel.toLowerCase().includes(search.toLowerCase()) ||
        p.permissionKey.toLowerCase().includes(search.toLowerCase()))
  );

  const changedCount = (() => {
    const original = new Set(role.permissions.map((p) => p.id));
    const added = [...selected].filter((id) => !original.has(id)).length;
    const removed = [...original].filter((id) => !selected.has(id)).length;
    return added + removed;
  })();

  return (
    <Stack gap="md">
      <TextInput
        placeholder="Berechtigungen durchsuchen..."
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        radius="md"
      />

      <ScrollArea mah={480} offsetScrollbars>
        <Stack gap="xl">
          {companyPerms.length > 0 && (
            <Box>
              <Group gap="xs" mb="sm">
                <IconBuilding size={13} color="var(--mantine-color-dimmed)" />
                <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: 1 }}>
                  Unternehmensweite Berechtigungen
                </Text>
              </Group>
              <Stack gap="xs">
                {companyPerms.map((p) => (
                  <Paper
                    key={p.id}
                    withBorder
                    p="sm"
                    radius="md"
                    style={{
                      borderColor: selected.has(p.id)
                        ? "var(--mantine-color-primary-4)"
                        : "var(--mantine-color-default-border)",
                      backgroundColor: selected.has(p.id)
                        ? "var(--mantine-color-primary-0)"
                        : undefined,
                      cursor: "pointer",
                      transition: "all 0.12s",
                    }}
                    onClick={() => toggle(p.id, !selected.has(p.id))}
                  >
                    <Group gap="sm" wrap="nowrap">
                      <Checkbox
                        checked={selected.has(p.id)}
                        onChange={(e) => toggle(p.id, e.currentTarget.checked)}
                        onClick={(e) => e.stopPropagation()}
                        radius="sm"
                        color="primary"
                      />
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Text size="sm" fw={500} truncate>{p.resolvedLabel}</Text>
                        <Text size="xs" c="dimmed" ff="monospace" truncate>{p.permissionKey}</Text>
                      </Box>
                      <ScopeBadge scope={p.scope} />
                    </Group>
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}

          {employeePerms.length > 0 && (
            <Box>
              <Group gap="xs" mb="sm">
                <IconUser size={13} color="var(--mantine-color-dimmed)" />
                <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: 1 }}>
                  Mitarbeiterbezogene Berechtigungen
                </Text>
              </Group>
              <Stack gap="xs">
                {employeePerms.map((p) => (
                  <Paper
                    key={p.id}
                    withBorder
                    p="sm"
                    radius="md"
                    style={{
                      borderColor: selected.has(p.id)
                        ? "var(--mantine-color-primary-4)"
                        : "var(--mantine-color-default-border)",
                      backgroundColor: selected.has(p.id)
                        ? "var(--mantine-color-primary-0)"
                        : undefined,
                      cursor: "pointer",
                      transition: "all 0.12s",
                    }}
                    onClick={() => toggle(p.id, !selected.has(p.id))}
                  >
                    <Group gap="sm" wrap="nowrap">
                      <Checkbox
                        checked={selected.has(p.id)}
                        onChange={(e) => toggle(p.id, e.currentTarget.checked)}
                        onClick={(e) => e.stopPropagation()}
                        radius="sm"
                        color="primary"
                      />
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Text size="sm" fw={500} truncate>{p.resolvedLabel}</Text>
                        <Text size="xs" c="dimmed" ff="monospace" truncate>{p.permissionKey}</Text>
                      </Box>
                      <ScopeBadge scope={p.scope} />
                    </Group>
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}

          {companyPerms.length === 0 && employeePerms.length === 0 && (
            <Text c="dimmed" size="sm" ta="center" py="xl">
              Keine Berechtigungen gefunden
            </Text>
          )}
        </Stack>
      </ScrollArea>

      {/* Speichern */}
      <Divider />
      <Group>
        <Button
          onClick={handleSave}
          loading={saving}
          leftSection={success ? <IconCheck size={16} /> : <IconDeviceFloppy size={16} />}
          radius="md"
          color={success ? "green" : "primary"}
          disabled={changedCount === 0}
        >
          {success
            ? "Gespeichert"
            : changedCount > 0
            ? `${changedCount} Änderung${changedCount > 1 ? "en" : ""} speichern`
            : "Keine Änderungen"}
        </Button>
      </Group>
    </Stack>
  );
}

// ─── Tab: Mitarbeiter ─────────────────────────────────────────────────────────

function EmployeesTab({
  role,
  allEmployees,
  onAssign,
  onRemove,
}: {
  role: RoleDto;
  allEmployees: EmployeeDto[];
  onAssign: (employeeId: number) => Promise<void>;
  onRemove: (employeeId: number) => Promise<void>;
}) {
  // Vereinfacht: "zugewiesen" tracken wir lokal bis zum nächsten Reload
  // In Produktion: Employee-Liste aus der Rolle selbst wenn das Backend sie liefert
  const [assignedIds, setAssignedIds] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const filtered = allEmployees.filter((e) =>
    `${e.firstname} ${e.surname} ${e.employeeNumber}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleAssign = async (emp: EmployeeDto) => {
    setLoadingId(emp.id);
    try {
      await onAssign(emp.id);
      setAssignedIds((prev) => new Set(prev).add(emp.id));
    } finally {
      setLoadingId(null);
    }
  };

  const handleRemove = async (emp: EmployeeDto) => {
    setLoadingId(emp.id);
    try {
      await onRemove(emp.id);
      setAssignedIds((prev) => {
        const next = new Set(prev);
        next.delete(emp.id);
        return next;
      });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Stack gap="md">
      <TextInput
        placeholder="Mitarbeiter suchen..."
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        radius="md"
      />

      <ScrollArea mah={480} offsetScrollbars>
        <Stack gap="xs">
          {filtered.length === 0 ? (
            <Text c="dimmed" size="sm" ta="center" py="xl">
              Keine Mitarbeiter gefunden
            </Text>
          ) : (
            filtered.map((emp) => {
              const isAssigned = assignedIds.has(emp.id);
              const isLoading = loadingId === emp.id;
              return (
                <Paper key={emp.id} withBorder p="sm" radius="md">
                  <Group justify="space-between" wrap="nowrap">
                    <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                      <Avatar
                        size="sm"
                        radius="xl"
                        color="primary"
                        variant="light"
                      >
                        {emp.firstname[0]}{emp.surname[0]}
                      </Avatar>
                      <Box style={{ minWidth: 0 }}>
                        <Text size="sm" fw={500} truncate>
                          {emp.firstname} {emp.surname}
                        </Text>
                        <Text size="xs" c="dimmed">{emp.employeeNumber}</Text>
                      </Box>
                    </Group>
                    {isAssigned ? (
                      <Button
                        size="xs"
                        variant="light"
                        color="red"
                        radius="md"
                        loading={isLoading}
                        leftSection={<IconTrash size={12} />}
                        onClick={() => handleRemove(emp)}
                      >
                        Entfernen
                      </Button>
                    ) : (
                      <Button
                        size="xs"
                        variant="light"
                        color="primary"
                        radius="md"
                        loading={isLoading}
                        leftSection={<IconPlus size={12} />}
                        onClick={() => handleAssign(emp)}
                      >
                        Zuweisen
                      </Button>
                    )}
                  </Group>
                </Paper>
              );
            })
          )}
        </Stack>
      </ScrollArea>
    </Stack>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function DetailRolePage() {
  const { roleName } = useParams<{ roleName: string }>();
  const navigate = useNavigate();
  const { getRoles, getPermissions, getEmployees, setPermissions, assignEmployee, removeEmployee, deleteRole } =
    useDetailApi();

  const [role, setRole] = useState<RoleDto | null>(null);
  const [allPermissions, setAllPermissions] = useState<PermissionDTO[]>([]);
  const [allEmployees, setAllEmployees] = useState<EmployeeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Laden ─────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    if (!roleName) return;
    setLoading(true);
    setError(null);
    try {
      const [roles, perms, emps] = await Promise.all([
        getRoles(),
        getPermissions(),
        getEmployees(),
      ]);
      const found = roles.find((r) => r.uniqueName === decodeURIComponent(roleName));
      if (!found) throw new Error("Rolle nicht gefunden");
      setRole(found);
      setAllPermissions(perms);
      setAllEmployees(emps);
    } catch (e: any) {
      setError(e?.message ?? "Daten konnten nicht geladen werden");
    } finally {
      setLoading(false);
    }
  }, [roleName]);

  useEffect(() => { load(); }, [load]);

  // ── Aktionen ──────────────────────────────────────────────────────────────

  const handleSavePermissions = async (ids: number[]) => {
    if (!role) return;
    await setPermissions(role.uniqueName, ids);
    await load(); // Rolle neu laden damit Permissions aktuell sind
  };

  const handleDeleteConfirm = async () => {
    if (!role) return;
    setDeleteLoading(true);
    try {
      await deleteRole(role.uniqueName);
      navigate("/rollen");
    } catch (e: any) {
      setError(e?.message ?? "Löschen fehlgeschlagen");
      setDeleteLoading(false);
      closeDelete();
    }
  };

  // ── Render: Loading / Error ───────────────────────────────────────────────

  if (loading) {
    return (
      <Group justify="center" align="center" style={{ height: "100%" }} p="xl">
        <Loader size="sm" color="primary" />
        <Text size="sm" c="dimmed">Rolle wird geladen...</Text>
      </Group>
    );
  }

  if (error || !role) {
    return (
      <Box p="xl" maw={580} mx="auto">
        <Alert color="red" icon={<IconAlertCircle size={16} />} radius="md">
          {error ?? "Rolle konnte nicht geladen werden"}
        </Alert>
        <Button
          mt="md"
          variant="light"
          color="secondary"
          radius="md"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate("/rollen")}
        >
          Zurück zur Übersicht
        </Button>
      </Box>
    );
  }

  // ── Render: Detail ────────────────────────────────────────────────────────

  return (
    <>
      <Box p="xl" maw={780} mx="auto">
        <Stack gap="lg">

          {/* ── Header ── */}
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
              <ActionIcon
                variant="light"
                color="secondary"
                size="lg"
                radius="md"
                onClick={() => navigate("/rollen")}
                style={{ flexShrink: 0 }}
              >
                <IconArrowLeft size={18} />
              </ActionIcon>
              <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                <ThemeIcon size={40} variant="light" color="primary" radius="md" style={{ flexShrink: 0 }}>
                  <IconShieldCheck size={22} />
                </ThemeIcon>
                <Box style={{ minWidth: 0, overflow: "hidden" }}>
                  <Title order={3} fw={600} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {role.displayName}
                  </Title>
                  <Text size="xs" c="dimmed" ff="monospace" truncate>{role.uniqueName}</Text>
                </Box>
              </Group>
            </Group>
            <Tooltip label="Rolle löschen" withArrow>
              <ActionIcon
                color="red"
                variant="light"
                size="lg"
                radius="md"
                onClick={openDelete}
                style={{ flexShrink: 0 }}
              >
                <IconTrash size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>

          {/* ── Beschreibung ── */}
          {role.description && (
            <Paper withBorder p="md" radius="md" bg="var(--mantine-color-default-hover)">
              <Text size="sm">{role.description}</Text>
            </Paper>
          )}

          <Divider />

          {/* ── Tabs ── */}
          <Tabs defaultValue="permissions" radius="md">
            <Tabs.List>
              <Tabs.Tab
                value="permissions"
                leftSection={<IconLock size={15} />}
              >
                Berechtigungen
                <Badge ml="xs" size="xs" variant="light" color="primary" radius="sm">
                  {role.permissions.length}
                </Badge>
              </Tabs.Tab>
              <Tabs.Tab
                value="employees"
                leftSection={<IconUsers size={15} />}
              >
                Mitarbeiter zuweisen
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="permissions" pt="md">
              <PermissionsTab
                role={role}
                allPermissions={allPermissions}
                onSave={handleSavePermissions}
              />
            </Tabs.Panel>

            <Tabs.Panel value="employees" pt="md">
              <EmployeesTab
                role={role}
                allEmployees={allEmployees}
                onAssign={(id) => assignEmployee(role.uniqueName, id)}
                onRemove={(id) => removeEmployee(role.uniqueName, id)}
              />
            </Tabs.Panel>
          </Tabs>

        </Stack>
      </Box>

      {/* ── Delete Modal ── */}
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
            Die Rolle <strong>{role.displayName}</strong> wird unwiderruflich gelöscht.
            Alle Zuweisungen an Mitarbeiter gehen dabei verloren.
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