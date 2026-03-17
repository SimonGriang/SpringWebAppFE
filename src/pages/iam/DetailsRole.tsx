import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Stack, Group, Box, Text, Title, Button, Paper, ThemeIcon,
  Badge, ActionIcon, Alert, Loader, Divider, Table, ScrollArea,
  TextInput, Modal, Checkbox,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconShield, IconShieldOff, IconArrowLeft, IconAlertCircle,
  IconTrash, IconSearch, IconPlus, IconLock, IconUsers,
  IconUserMinus, IconUserPlus, IconX,
} from "@tabler/icons-react";
import { useApiClient } from "../../api/useApiClient";
import { useAuth } from "../../auth/AuthContext";
import { ModuleContentShell } from "../../components/layout/ModuleContentShell";

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
  assignedEmployeeCount: number;
}

interface EmployeeDto {
  id: number;
  firstname: string;
  surname: string;
  employeeNumber: string;
  active: boolean;
  contractedWeeklyHours: number;
  vacationDays: number;
  totalOvertimeMinutes: number;
  lastUpdated: string | null;
  company: { id: number; companyName: string; companyUniqueIdentifier: string } | null;
  roles: { uniqueName: string; displayName: string; description: string }[];
  teams: { id: number; teamName: string; teamDescription: string }[];
}

function useRoleDetailApi() {
  const api = useApiClient();
  const getRoles = useCallback((): Promise<RoleDto[]> => api("/backend/api/roles"), [api]);
  const getPermissions = useCallback((): Promise<PermissionDTO[]> => api("/backend/api/roles/permissions"), [api]);
  const getEmployees = useCallback((roleName: string): Promise<EmployeeDto[]> => api(`/backend/api/roles/${encodeURIComponent(roleName)}/employees`), [api]);
  const getCompanyEmployees = useCallback((): Promise<EmployeeDto[]> => api("/backend/api/employees"), [api]);
  const setPermissions = useCallback((roleName: string, ids: number[]): Promise<void> => api(`/backend/api/roles/${encodeURIComponent(roleName)}/permissions`, { method: "PUT", body: JSON.stringify(ids) }), [api]);
  const assignEmployee = useCallback((roleName: string, employeeId: number): Promise<void> => api(`/backend/api/roles/${encodeURIComponent(roleName)}/employees`, { method: "POST", body: JSON.stringify({ employeeId }) }), [api]);
  const removeEmployee = useCallback((roleName: string, employeeId: number): Promise<void> => api(`/backend/api/roles/${encodeURIComponent(roleName)}/employees/${employeeId}`, { method: "DELETE" }), [api]);
  const deleteRole = useCallback((roleName: string): Promise<void> => api(`/backend/api/roles/${encodeURIComponent(roleName)}`, { method: "DELETE" }), [api]);
  return { getRoles, getPermissions, getEmployees, getCompanyEmployees, setPermissions, assignEmployee, removeEmployee, deleteRole };
}

const TH_STYLE = {
  fontSize: "11px",
  fontWeight: 600,
  color: "var(--mantine-color-dimmed)",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
};

function PermissionMobileCard({ p, canManage, onRemove, onClick }: { p: PermissionDTO; canManage: boolean; onRemove: () => void; onClick: () => void }) {
  return (
    <Paper withBorder radius="md" p="sm" style={{ cursor: "pointer", userSelect: "none" }} onClick={onClick}>
      <Group justify="space-between" wrap="nowrap">
        <Box style={{ minWidth: 0, flex: 1 }}>
          <Text size="sm" fw={500} truncate>{p.resolvedLabel}</Text>
          <Text size="xs" c="dimmed" ff="monospace" truncate>{p.permissionKey}</Text>
          <Badge size="xs" variant="light" color={p.scope === "COMPANY" ? "secondary" : "primary"} mt={4}>
            {p.scope === "COMPANY" ? "Company" : "Employee"}
          </Badge>
        </Box>
        {canManage && (
          <ActionIcon size="sm" color="red" variant="subtle" radius="md" onClick={(e) => { e.stopPropagation(); onRemove(); }}>
            <IconX size={13} />
          </ActionIcon>
        )}
      </Group>
    </Paper>
  );
}

function EmployeeMobileCard({ emp, canManage, removing, onRemove }: { emp: EmployeeDto; canManage: boolean; removing: boolean; onRemove: () => void }) {
  return (
    <Paper withBorder radius="md" p="sm" style={{ userSelect: "none" }}>
      <Group justify="space-between" wrap="nowrap">
        <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
          <ThemeIcon size={32} variant="light" color="primary" radius="sm" style={{ flexShrink: 0 }}>
            <Text size="xs" fw={700}>{emp.firstname[0]}{emp.surname[0]}</Text>
          </ThemeIcon>
          <Box style={{ minWidth: 0 }}>
            <Text size="sm" fw={500} truncate>{emp.firstname} {emp.surname}</Text>
            <Text size="xs" c="dimmed" ff="monospace">{emp.employeeNumber}</Text>
          </Box>
        </Group>
        {canManage && (
          <ActionIcon size="sm" color="red" variant="subtle" radius="md" loading={removing} onClick={onRemove}>
            <IconUserMinus size={13} />
          </ActionIcon>
        )}
      </Group>
    </Paper>
  );
}

// ─── Manage Permissions Modal ─────────────────────────────────────────────────
// Changes vs previous version:
// 1. Modal size="xl" + styles for proper flex scrolling (content + body)
// 2. PermGroup: scope-based colors matching ListPermissions
//    COMPANY → secondary (border, background, checkbox)
//    EMPLOYEE → primary  (border, background, checkbox)

function ManagePermissionsModal({
  opened, onClose, role, allPermissions, onSaved,
}: {
  opened: boolean; onClose: () => void; role: RoleDto; allPermissions: PermissionDTO[]; onSaved: () => void;
}) {
  const { setPermissions } = useRoleDetailApi();
  const [selected, setSelected] = useState<Set<number>>(new Set(role.permissions.map((p) => p.id)));
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (opened) {
      setSelected(new Set(role.permissions.map((p) => p.id)));
      setSearch("");
      setError(null);
    }
  }, [opened, role]);

  const filtered = allPermissions.filter(
    (p) =>
      p.resolvedLabel.toLowerCase().includes(search.toLowerCase()) ||
      p.permissionKey.toLowerCase().includes(search.toLowerCase())
  );

  const companyPerms = filtered.filter((p) => p.scope === "COMPANY");
  const employeePerms = filtered.filter((p) => p.scope === "EMPLOYEE");

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await setPermissions(role.uniqueName, Array.from(selected));
      onSaved();
      onClose();
    } catch (e: any) {
      setError(e?.message ?? "Permissions could not be saved");
    } finally {
      setSaving(false);
    }
  };

  const changedCount = (() => {
    const original = new Set(role.permissions.map((p) => p.id));
    return [...selected].filter((id) => !original.has(id)).length +
           [...original].filter((id) => !selected.has(id)).length;
  })();

  const PermGroup = ({ perms, label }: { perms: PermissionDTO[]; label: string }) =>
    perms.length === 0 ? null : (
      <Box>
        <Text size="xs" fw={600} c="dimmed" tt="uppercase" mb="xs" style={{ letterSpacing: 1 }}>
          {label}
        </Text>
        <Stack gap="xs">
          {perms.map((p) => {
            const color = p.scope === "COMPANY" ? "secondary" : "primary";
            const isSelected = selected.has(p.id);
            return (
              <Paper
                key={p.id}
                withBorder
                p="sm"
                radius="md"
                style={{
                  cursor: "pointer",
                  // Subtle: nur Border-Farbe ändert sich, kein voller Hintergrund
                  borderColor: isSelected
                    ? `var(--mantine-color-${color}-5)`
                    : "var(--mantine-color-default-border)",
                  boxShadow: isSelected
                    ? `inset 3px 0 0 var(--mantine-color-${color}-5)`
                    : undefined,
                  transition: "all 0.12s",
                }}
                onClick={() => toggle(p.id)}
              >
                <Group gap="sm" wrap="nowrap">
                  <Checkbox
                    checked={isSelected}
                    onChange={() => toggle(p.id)}
                    onClick={(e) => e.stopPropagation()}
                    radius="sm"
                    color={color}
                  />
                  <Box style={{ minWidth: 0, flex: 1 }}>
                    <Text size="sm" fw={500} truncate>{p.resolvedLabel}</Text>
                    <Text size="xs" c="dimmed" ff="monospace" truncate>{p.permissionKey}</Text>
                  </Box>
                  <Badge size="xs" variant="light" color={color} style={{ flexShrink: 0 }}>
                    {p.scope === "COMPANY" ? "Company" : "Employee"}
                  </Badge>
                </Group>
              </Paper>
            );
          })}
        </Stack>
      </Box>
    );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <ThemeIcon size="md" variant="light" color="secondary" radius="md">
            <IconLock size={15} />
          </ThemeIcon>
          <Text fw={600}>Berechtigungen verwalten</Text>
        </Group>
      }
      centered
      size="xl"
      radius="md"
      styles={{
        content: { display: "flex", flexDirection: "column", maxHeight: "85vh" },
        body: { display: "flex", flexDirection: "column", flex: 1, minHeight: 0 },
      }}
    >
      <Stack gap="md" style={{ flex: 1, minHeight: 0 }}>
        {error && <Alert color="red" icon={<IconAlertCircle size={14} />} radius="md">{error}</Alert>}

        <TextInput
          placeholder="Berechtigungen suchen..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          radius="md"
        />

        {/* mah kombiniert mit overflowY auto — zuverlässiger als flex in Mantine Modals */}
        <ScrollArea mah="calc(85vh - 200px)" offsetScrollbars>
          <Stack gap="lg" pr={4}>
            <PermGroup perms={companyPerms} label="Unternehmensweite Berechtigungen" />
            <PermGroup perms={employeePerms} label="Mitarbeiterbezogene Berechtigungen" />
            {filtered.length === 0 && (
              <Text size="sm" c="dimmed" ta="center" py="md">Keine Berechtigungen gefunden</Text>
            )}
          </Stack>
        </ScrollArea>

        <Divider />

        <Group justify="space-between" align="center">
          <Text size="xs" c="dimmed">
            {changedCount > 0
              ? `${changedCount} ungespeicherte Änderung${changedCount > 1 ? "en" : ""}`
              : "Keine Änderungen"}
          </Text>
          <Group>
            <Button variant="light" color="secondary" radius="md" onClick={onClose}>Abbrechen</Button>
            <Button color="secondary" radius="md" loading={saving} disabled={changedCount === 0} onClick={handleSave}>
              Speichern
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}

function AssignEmployeeModal({
  opened, onClose, role, allEmployees, assignedIds, onAssigned,
}: {
  opened: boolean; onClose: () => void; role: RoleDto; allEmployees: EmployeeDto[]; assignedIds: Set<number>; onAssigned: () => void;
}) {
  const { assignEmployee } = useRoleDetailApi();
  const [search, setSearch] = useState("");
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (opened) { setSearch(""); setError(null); } }, [opened]);

  const assignable = allEmployees.filter(
    (e) => !assignedIds.has(e.id) &&
      `${e.firstname} ${e.surname} ${e.employeeNumber}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleAssign = async (emp: EmployeeDto) => {
    setAssigningId(emp.id);
    setError(null);
    try {
      await assignEmployee(role.uniqueName, emp.id);
      onAssigned();
      onClose();
    } catch (e: any) {
      setError(e?.message ?? "Assignment failed");
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <Modal
      opened={opened} onClose={onClose}
      title={
        <Group gap="sm">
          <ThemeIcon size="md" variant="light" color="primary" radius="md"><IconUserPlus size={15} /></ThemeIcon>
          <Text fw={600}>Mitarbeiter zuweisen</Text>
        </Group>
      }
      centered size="md" radius="md"
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">Nur Mitarbeiter ohne diese Rolle werden angezeigt.</Text>
        <TextInput placeholder="Mitarbeiter suchen..." leftSection={<IconSearch size={16} />} value={search} onChange={(e) => setSearch(e.currentTarget.value)} radius="md" />
        {error && <Alert color="red" icon={<IconAlertCircle size={14} />} radius="md">{error}</Alert>}
        <ScrollArea mah={320} offsetScrollbars>
          {assignable.length === 0 ? (
            <Text size="sm" c="dimmed" ta="center" py="md">
              {search ? "Keine Treffer" : "Alle Mitarbeiter haben diese Rolle bereits"}
            </Text>
          ) : (
            <Stack gap="xs">
              {assignable.map((emp) => (
                <Paper key={emp.id} withBorder p="sm" radius="md">
                  <Group justify="space-between" wrap="nowrap">
                    <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                      <ThemeIcon size={30} variant="light" color="primary" radius="md" style={{ flexShrink: 0 }}>
                        <Text size="xs" fw={700}>{emp.firstname[0]}{emp.surname[0]}</Text>
                      </ThemeIcon>
                      <Box style={{ minWidth: 0 }}>
                        <Text size="sm" fw={500} truncate>{emp.firstname} {emp.surname}</Text>
                        <Text size="xs" c="dimmed">{emp.employeeNumber}</Text>
                      </Box>
                    </Group>
                    <Button size="xs" variant="light" color="primary" radius="md" loading={assigningId === emp.id} leftSection={<IconPlus size={12} />} onClick={() => handleAssign(emp)} style={{ flexShrink: 0 }}>
                      Zuweisen
                    </Button>
                  </Group>
                </Paper>
              ))}
            </Stack>
          )}
        </ScrollArea>
      </Stack>
    </Modal>
  );
}

export function DetailRolePage() {
  const { roleName } = useParams<{ roleName: string }>();
  const navigate = useNavigate();
  const { permissionProfile } = useAuth();
  const { getRoles, getPermissions, getEmployees, getCompanyEmployees, removeEmployee, deleteRole, setPermissions } = useRoleDetailApi();

  const [role, setRole] = useState<RoleDto | null>(null);
  const [allPermissions, setAllPermissions] = useState<PermissionDTO[]>([]);
  const [allEmployees, setAllEmployees] = useState<EmployeeDto[]>([]);
  const [assignedEmployees, setAssignedEmployees] = useState<EmployeeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [permModalOpened, { open: openPermModal, close: closePermModal }] = useDisclosure(false);
  const [assignModalOpened, { open: openAssignModal, close: closeAssignModal }] = useDisclosure(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const canManage = permissionProfile?.companyPermissions.includes("ROLE_MANAGE");
  const canView = canManage || permissionProfile?.companyPermissions.includes("ROLE_VIEW");

  const load = useCallback(async () => {
    if (!roleName || !canView) return;
    setLoading(true);
    setError(null);
    try {
      const decodedName = decodeURIComponent(roleName);
      const [roles, perms, assignedEmps, companyEmps] = await Promise.all([
        getRoles(), getPermissions(), getEmployees(decodedName), getCompanyEmployees(),
      ]);
      const found = roles.find((r) => r.uniqueName === decodedName);
      if (!found) throw new Error("Role not found");
      setRole(found);
      setAllPermissions(perms);
      setAssignedEmployees(assignedEmps);
      setAllEmployees(companyEmps);
    } catch (e: any) {
      setError(e?.message ?? "Role could not be loaded");
    } finally {
      setLoading(false);
    }
  }, [roleName, canView]);

  useEffect(() => { load(); }, [load]);

  const handleRemoveEmployee = async (emp: EmployeeDto) => {
    if (!role) return;
    setRemovingId(emp.id);
    try { await removeEmployee(role.uniqueName, emp.id); await load(); }
    catch (e: any) { setError(e?.message ?? "Could not remove employee"); }
    finally { setRemovingId(null); }
  };

  const handleDeleteRole = async () => {
    if (!role) return;
    setDeleteLoading(true);
    try { await deleteRole(role.uniqueName); navigate("/iam/roles"); }
    catch (e: any) { setError(e?.message ?? "Role could not be deleted"); setDeleteLoading(false); closeDeleteModal(); }
  };

  if (!canView) {
    return (
      <Box p="xl" maw={580} mx="auto">
        <Alert color="red" icon={<IconShieldOff size={18} />} radius="md" title="Keine Berechtigung">
          Du hast keine Berechtigung, Rollen einzusehen.
        </Alert>
        <Button mt="md" variant="light" color="secondary" radius="md" leftSection={<IconArrowLeft size={16} />} onClick={() => navigate("/dashboard")}>
          Zum Dashboard
        </Button>
      </Box>
    );
  }

  if (loading) {
    return (
      <Group justify="center" align="center" p="xl" style={{ height: "100%" }}>
        <Loader size="sm" color="primary" />
        <Text size="sm" c="dimmed">Rolle wird geladen...</Text>
      </Group>
    );
  }

  if (error || !role) {
    return (
      <Box p="xl" maw={580} mx="auto">
        <Alert color="red" icon={<IconAlertCircle size={16} />} radius="md">{error ?? "Role could not be loaded"}</Alert>
        <Button mt="md" variant="light" color="secondary" radius="md" leftSection={<IconArrowLeft size={16} />} onClick={() => navigate("/iam/roles")}>
          Zurück zur Übersicht
        </Button>
      </Box>
    );
  }

  const isDeletable = role.assignedEmployeeCount === 0;
  const assignedIds = new Set(assignedEmployees.map((e) => e.id));

  return (
    <>
      <ModuleContentShell p="xl">
        <Stack gap="lg">

          <Group gap="sm" wrap="nowrap">
            <ActionIcon variant="light" color="secondary" size="lg" radius="md" onClick={() => navigate("/iam/roles")} style={{ flexShrink: 0 }}>
              <IconArrowLeft size={18} />
            </ActionIcon>
            <ThemeIcon size={40} variant="light" color="primary" radius="md" style={{ flexShrink: 0 }}>
              <IconShield size={22} />
            </ThemeIcon>
            <Box style={{ minWidth: 0 }}>
              <Title order={3} fw={600} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {role.displayName}
              </Title>
              <Text size="xs" c="dimmed" ff="monospace" truncate>{role.uniqueName}</Text>
            </Box>
          </Group>

          <Divider />

          {error && (
            <Alert color="red" icon={<IconAlertCircle size={16} />} radius="md" withCloseButton onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Details */}
          <Paper withBorder radius="md" p="lg">
            <Table verticalSpacing="sm" horizontalSpacing="md">
              <Table.Tbody>
                <Table.Tr>
                  <Table.Td w={160}><Text size="sm" fw={600} c="dimmed">Name</Text></Table.Td>
                  <Table.Td><Text size="sm">{role.displayName}</Text></Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td><Text size="sm" fw={600} c="dimmed">Unique Name</Text></Table.Td>
                  <Table.Td><Text size="sm" ff="monospace">{role.uniqueName}</Text></Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td><Text size="sm" fw={600} c="dimmed">Beschreibung</Text></Table.Td>
                  <Table.Td>
                    {role.description
                      ? <Text size="sm">{role.description}</Text>
                      : <Text size="sm" c="dimmed" fs="italic">Keine Beschreibung</Text>}
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td><Text size="sm" fw={600} c="dimmed">Status</Text></Table.Td>
                  <Table.Td>
                    {isDeletable
                      ? <Badge color="gray" variant="light" size="sm">Nicht zugewiesen</Badge>
                      : <Badge color="primary" variant="light" size="sm">
                          {role.assignedEmployeeCount} {role.assignedEmployeeCount === 1 ? "Mitarbeiter" : "Mitarbeitern"} zugewiesen
                        </Badge>}
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
            {canManage && (
              <Box mt="md" pt="md" style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}>
                {isDeletable ? (
                  <Button size="xs" color="red" variant="subtle" radius="md" leftSection={<IconTrash size={13} />} onClick={openDeleteModal}>
                    Rolle löschen
                  </Button>
                ) : (
                  <Text size="xs" c="dimmed">
                    Rolle kann nicht gelöscht werden, da sie noch {role.assignedEmployeeCount} {role.assignedEmployeeCount === 1 ? "Mitarbeiter" : "Mitarbeitern"} zugewiesen ist.
                  </Text>
                )}
              </Box>
            )}
          </Paper>

          {/* Permissions */}
          <Paper withBorder radius="md" p="lg">
            <Group mb="md" justify="space-between" align="center">
              <Group gap="xs">
                <ThemeIcon size="sm" variant="transparent" color="dimmed"><IconLock size={14} /></ThemeIcon>
                <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: 1 }}>Berechtigungen</Text>
                <Badge variant="light" color="primary" size="sm" radius="sm">{role.permissions.length}</Badge>
              </Group>
              {canManage && (
                <Button size="xs" variant="light" color="secondary" radius="md" leftSection={<IconLock size={12} />} onClick={openPermModal}>
                  Berechtigungen verwalten
                </Button>
              )}
            </Group>

            {role.permissions.length === 0 ? (
              <Text size="sm" c="dimmed" ta="center" py="md">Keine Berechtigungen zugewiesen</Text>
            ) : (
              <>
                <Box visibleFrom="sm">
                  <ScrollArea>
                    <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th style={TH_STYLE}>Berechtigung</Table.Th>
                          <Table.Th style={TH_STYLE}>Scope</Table.Th>
                          {canManage && <Table.Th w={50} />}
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {role.permissions.map((p) => (
                          <Table.Tr key={p.id} style={{ cursor: "pointer", userSelect: "none" }} onClick={() => navigate(`/iam/permissions/${p.id}`)}>
                            <Table.Td>
                              <Box>
                                <Text size="sm" fw={500}>{p.resolvedLabel}</Text>
                                <Text size="xs" c="dimmed" ff="monospace">{p.permissionKey}</Text>
                              </Box>
                            </Table.Td>
                            <Table.Td>
                              <Badge size="xs" variant="light" color={p.scope === "COMPANY" ? "secondary" : "primary"}>
                                {p.scope === "COMPANY" ? "Company" : "Employee"}
                              </Badge>
                            </Table.Td>
                            {canManage && (
                              <Table.Td>
                                <ActionIcon size="sm" color="red" variant="subtle" radius="md"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newIds = role.permissions.filter((x) => x.id !== p.id).map((x) => x.id);
                                    setPermissions(role.uniqueName, newIds).then(load);
                                  }}>
                                  <IconX size={13} />
                                </ActionIcon>
                              </Table.Td>
                            )}
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </ScrollArea>
                </Box>
                <Stack gap="xs" hiddenFrom="sm">
                  {role.permissions.map((p) => (
                    <PermissionMobileCard key={p.id} p={p} canManage={!!canManage}
                      onClick={() => navigate(`/iam/permissions/${p.id}`)}
                      onRemove={() => {
                        const newIds = role.permissions.filter((x) => x.id !== p.id).map((x) => x.id);
                        setPermissions(role.uniqueName, newIds).then(load);
                      }} />
                  ))}
                </Stack>
              </>
            )}
          </Paper>

          {/* Employees */}
          <Paper withBorder radius="md" p="lg">
            <Group mb="md" justify="space-between" align="center">
              <Group gap="xs">
                <ThemeIcon size="sm" variant="transparent" color="dimmed"><IconUsers size={14} /></ThemeIcon>
                <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: 1 }}>Zugewiesene Mitarbeiter</Text>
                <Badge variant="light" color="primary" size="sm" radius="sm">{role.assignedEmployeeCount}</Badge>
              </Group>
              {canManage && (
                <Button size="xs" variant="light" color="primary" radius="md" leftSection={<IconUserPlus size={12} />} onClick={openAssignModal}>
                  Mitarbeiter zuweisen
                </Button>
              )}
            </Group>

            {role.assignedEmployeeCount === 0 ? (
              <Text size="sm" c="dimmed" ta="center" py="md">Kein Mitarbeiter hat diese Rolle</Text>
            ) : (
              <>
                <Box visibleFrom="sm">
                  <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th style={TH_STYLE}>Mitarbeiter</Table.Th>
                        <Table.Th style={TH_STYLE}>Personalnummer</Table.Th>
                        {canManage && <Table.Th w={50} />}
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {assignedEmployees.map((emp) => (
                        <Table.Tr key={emp.id} style={{ userSelect: "none" }}>
                          <Table.Td>
                            <Group gap="sm" wrap="nowrap">
                              <ThemeIcon size={26} variant="light" color="primary" radius="sm" style={{ flexShrink: 0 }}>
                                <Text size="xs" fw={700}>{emp.firstname[0]}{emp.surname[0]}</Text>
                              </ThemeIcon>
                              <Text size="sm" fw={500}>{emp.firstname} {emp.surname}</Text>
                            </Group>
                          </Table.Td>
                          <Table.Td><Text size="sm" c="dimmed" ff="monospace">{emp.employeeNumber}</Text></Table.Td>
                          {canManage && (
                            <Table.Td>
                              <ActionIcon size="sm" color="red" variant="subtle" radius="md" loading={removingId === emp.id} onClick={() => handleRemoveEmployee(emp)}>
                                <IconUserMinus size={13} />
                              </ActionIcon>
                            </Table.Td>
                          )}
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Box>
                <Stack gap="xs" hiddenFrom="sm">
                  {assignedEmployees.map((emp) => (
                    <EmployeeMobileCard key={emp.id} emp={emp} canManage={!!canManage} removing={removingId === emp.id} onRemove={() => handleRemoveEmployee(emp)} />
                  ))}
                </Stack>
              </>
            )}
          </Paper>

        </Stack>
      </ModuleContentShell>

      {role && <ManagePermissionsModal opened={permModalOpened} onClose={closePermModal} role={role} allPermissions={allPermissions} onSaved={load} />}
      {role && <AssignEmployeeModal opened={assignModalOpened} onClose={closeAssignModal} role={role} allEmployees={allEmployees} assignedIds={assignedIds} onAssigned={load} />}

      <Modal
        opened={deleteModalOpened} onClose={closeDeleteModal}
        title={<Group gap="sm"><ThemeIcon color="red" variant="light" size="md" radius="md"><IconTrash size={16} /></ThemeIcon><Text fw={600}>Rolle löschen</Text></Group>}
        centered size="sm" radius="md"
      >
        <Stack gap="md">
          <Alert color="red" radius="md" icon={<IconAlertCircle size={16} />}>
            Die Rolle <strong>{role.displayName}</strong> wird unwiderruflich gelöscht.
          </Alert>
          <Group justify="flex-end">
            <Button variant="light" color="secondary" radius="md" onClick={closeDeleteModal}>Abbrechen</Button>
            <Button color="red" radius="md" loading={deleteLoading} leftSection={<IconTrash size={16} />} onClick={handleDeleteRole}>
              Endgültig löschen
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}