import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Stack, Group, Box, Text, Title, TextInput, Paper,
  ThemeIcon, Badge, Loader, Alert, Button,
  ActionIcon, Tooltip,
} from "@mantine/core";
import {
  IconUsers, IconUserOff, IconChevronRight, IconAlertCircle,
  IconSearch, IconShieldOff, IconArrowLeft, IconUserCheck,
  IconUserX, IconUserPlus,
} from "@tabler/icons-react";
import { useApiClient } from "../../api/useApiClient";
import { useAuth } from "../../auth/AuthContext";
import { ModuleContentShell } from "../../components/layout/ModuleContentShell";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RoleSlimRef {
  uniqueName: string;
  displayName: string;
  description: string;
}

interface EmployeeDTO {
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
  roles: RoleSlimRef[];
  teams: { id: number; teamName: string; teamDescription: string }[];
}

// ─── API Hook ─────────────────────────────────────────────────────────────────

function useEmployeeListApi() {
  const api = useApiClient();

  const getEmployees = useCallback(
    (): Promise<EmployeeDTO[]> => api("/backend/api/employees"),
    [api]
  );

  return { getEmployees };
}

// ─── Sub-Component: EmployeeCard ─────────────────────────────────────────────

function EmployeeCard({
  employee,
  onClick,
}: {
  employee: EmployeeDTO;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

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
        boxShadow: hovered ? "0 2px 8px rgba(0,0,0,0.07)" : undefined,
        userSelect: "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <Group p="md" justify="space-between" wrap="nowrap">

        {/* Left: Avatar + Name + Number */}
        <Group gap="md" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
          <ThemeIcon
            size={40}
            variant="light"
            color={employee.active ? "primary" : "gray"}
            radius="xl"
            style={{ flexShrink: 0 }}
          >
            <Text size="xs" fw={700}>
              {employee.firstname[0]}{employee.surname[0]}
            </Text>
          </ThemeIcon>

          <Box style={{ minWidth: 0 }}>
            <Group gap="xs" wrap="nowrap">
              <Text fw={600} size="sm" truncate>
                {employee.surname}, {employee.firstname}
              </Text>
              {!employee.active && (
                <Badge size="xs" color="red" variant="light" style={{ flexShrink: 0 }}>
                  Inaktiv
                </Badge>
              )}
            </Group>
            <Text size="xs" c="dimmed" ff="monospace">{employee.employeeNumber}</Text>
          </Box>
        </Group>

        {/* Middle: Roles */}
        <Group gap="xs" wrap="wrap" style={{ flex: 1, justifyContent: "flex-start" }} visibleFrom="md">
          {employee.roles.length === 0 ? (
            <Text size="xs" c="dimmed" fs="italic">Keine Rollen</Text>
          ) : (
            employee.roles.slice(0, 3).map((r) => (
              <Badge key={r.uniqueName} size="xs" variant="light" color="secondary" radius="sm">
                {r.displayName}
              </Badge>
            ))
          )}
          {employee.roles.length > 3 && (
            <Badge size="xs" variant="light" color="gray" radius="sm">
              +{employee.roles.length - 3}
            </Badge>
          )}
        </Group>

        {/* Right: Arrow */}
        <IconChevronRight
          size={16}
          color="var(--mantine-color-dimmed)"
          style={{
            flexShrink: 0,
            transition: "transform 0.15s",
            transform: hovered ? "translateX(2px)" : "none",
          }}
        />
      </Group>
    </Paper>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ListEmployeesPage() {
  const navigate = useNavigate();
  const { permissionProfile } = useAuth();
  const { getEmployees } = useEmployeeListApi();

  // All hooks before any early return
  const [employees, setEmployees] = useState<EmployeeDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");

  // ── Access control ────────────────────────────────────────────────────────
  //
  // canCreate: EMPLOYEE_CREATE ist eine company-weite Permission
  //
  // visibleEmployeeIds: Sammlung aller Employee-IDs aus den employee-scoped
  // Permissions (z.B. EMPLOYEE_EDIT, EMPLOYEE_DEACTIVATE, WORKTIME_USER_READ).
  // Ein Benutzer darf nur jene Mitarbeiter sehen zu denen er mindestens
  // eine employee-scoped Permission hat.
  //
  // Exception: Wer EMPLOYEE_CREATE hat sieht alle Mitarbeiter (Admin-Kontext).

  const canCreate = permissionProfile?.companyPermissions.includes("EMPLOYEE_CREATE") ?? false;

  // Sichtbar sind nur Mitarbeiter zu denen EMPLOYEE_EDIT oder
  // EMPLOYEE_DEACTIVATE explizit vergeben ist.
  // WORKTIME_* und andere employee-scoped Permissions berechtigen
  // nicht zur Sichtbarkeit in der Mitarbeiterliste.
  const EMPLOYEE_LIST_PERMISSIONS = ["EMPLOYEE_EDIT", "EMPLOYEE_DEACTIVATE"];

  const visibleEmployeeNumbers: Set<string> = (() => {
    const emp = permissionProfile?.employeePermissions ?? {};
    const numbers = new Set<string>();
    Object.entries(emp)
      .filter(([key]) => EMPLOYEE_LIST_PERMISSIONS.includes(key))
      .forEach(([, idList]) => idList.forEach((val) => numbers.add(String(val))));
    return numbers;
  })();

  const canViewAll = canCreate;
  const canView = canViewAll || visibleEmployeeNumbers.size > 0;

  useEffect(() => {
    if (!canView) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        setEmployees(await getEmployees());
      } catch (e: any) {
        setError(e?.message ?? "Mitarbeiter konnten nicht geladen werden");
      } finally {
        setLoading(false);
      }
    })();
  }, [canView]);

  // ── Permission guard ──────────────────────────────────────────────────────
  if (!canView) {
    return (
      <Box p="xl" maw={580} mx="auto">
        <Alert color="red" icon={<IconShieldOff size={18} />} radius="md" title="Keine Berechtigung">
          Du hast keine Berechtigung, Mitarbeiter einzusehen. Wende dich an einen Administrator.
        </Alert>
        <Button mt="md" variant="light" color="secondary" radius="md"
          leftSection={<IconArrowLeft size={16} />} onClick={() => navigate("/dashboard")}>
          Zum Dashboard
        </Button>
      </Box>
    );
  }

  // ── Filter + Sort alphabetically by surname ───────────────────────────────
  const filtered = employees
    .filter((e) => {
      if (!canViewAll && !visibleEmployeeNumbers.has(e.employeeNumber)) return false;

      const matchesSearch =
        `${e.firstname} ${e.surname} ${e.employeeNumber}`
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        e.roles.some((r) => r.displayName.toLowerCase().includes(search.toLowerCase()));

      const matchesActive =
        activeFilter === "all" ||
        (activeFilter === "active" && e.active) ||
        (activeFilter === "inactive" && !e.active);

      return matchesSearch && matchesActive;
    })
    .sort((a, b) =>
      a.surname.localeCompare(b.surname, "de") ||
      a.firstname.localeCompare(b.firstname, "de")
    );

  const activeCount = filtered.filter((e) => e.active).length;
  const inactiveCount = filtered.filter((e) => !e.active).length;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <ModuleContentShell>
      <Stack p="xl">

        {/* Header */}
        <Group gap="sm">
          <ThemeIcon size={40} variant="light" color="primary" radius="md" style={{ flexShrink: 0 }}>
            <IconUsers size={22} />
          </ThemeIcon>
          <Box style={{ minWidth: 0 }}>
            <Title order={3} fw={600}>Mitarbeiter</Title>
            <Text size="sm" c="dimmed">
              {filtered.length} {filtered.length === 1 ? "Mitarbeiter" : "Mitarbeiter"} sichtbar
            </Text>
          </Box>
        </Group>

        {/* Error */}
        {error && (
          <Alert color="red" icon={<IconAlertCircle size={16} />} radius="md"
            withCloseButton onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Search + Filter + Create */}
        <Group gap="sm" wrap="nowrap">
          <TextInput
            placeholder="Name, Personalnummer oder Rolle suchen..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            radius="md"
            style={{ flex: 1 }}
          />
          <Group gap="xs" wrap="nowrap" style={{ flexShrink: 0 }}>
            <Tooltip label="Alle anzeigen" withArrow>
              <ActionIcon
                variant={activeFilter === "all" ? "filled" : "light"}
                color="primary"
                radius="md"
                size="lg"
                onClick={() => setActiveFilter("all")}
              >
                <IconUsers size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Nur aktive" withArrow>
              <ActionIcon
                variant={activeFilter === "active" ? "filled" : "light"}
                color="green"
                radius="md"
                size="lg"
                onClick={() => setActiveFilter("active")}
              >
                <IconUserCheck size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Nur inaktive" withArrow>
              <ActionIcon
                variant={activeFilter === "inactive" ? "filled" : "light"}
                color="red"
                radius="md"
                size="lg"
                onClick={() => setActiveFilter("inactive")}
              >
                <IconUserX size={16} />
              </ActionIcon>
            </Tooltip>
            {canCreate && (
              <Button
                leftSection={<IconUserPlus size={16} />}
                color="primary"
                radius="md"
                onClick={() => navigate("/iam/employees/create")}
                style={{ flexShrink: 0 }}
              >
                <Box visibleFrom="sm">Neuer Mitarbeiter</Box>
                <Box hiddenFrom="sm"><IconUserPlus size={16} /></Box>
              </Button>
            )}
          </Group>
        </Group>

        {/* Status Summary */}
        {!loading && (
          <Group gap="xs">
            <Badge variant="light" color="primary" size="sm" radius="sm">
              {filtered.length} Treffer
            </Badge>
            {activeCount > 0 && (
              <Badge variant="light" color="green" size="sm" radius="sm">
                {activeCount} aktiv
              </Badge>
            )}
            {inactiveCount > 0 && (
              <Badge variant="light" color="red" size="sm" radius="sm">
                {inactiveCount} inaktiv
              </Badge>
            )}
          </Group>
        )}

        {/* Content */}
        {loading ? (
          <Group justify="center" py="xl">
            <Loader size="sm" color="primary" />
            <Text size="sm" c="dimmed">Mitarbeiter werden geladen...</Text>
          </Group>
        ) : filtered.length === 0 ? (
          <Paper withBorder p="xl" ta="center" radius="md">
            <ThemeIcon size={48} variant="light" color="gray" mx="auto" mb="sm">
              <IconUserOff size={24} />
            </ThemeIcon>
            <Text fw={500} mb={4}>Keine Mitarbeiter gefunden</Text>
            <Text size="sm" c="dimmed">
              {search || activeFilter !== "all"
                ? "Versuche einen anderen Suchbegriff oder Filter"
                : "Das Unternehmen hat noch keine Mitarbeiter"}
            </Text>
          </Paper>
        ) : (
          <Stack gap="xs">
            {filtered.map((emp) => (
              <EmployeeCard
                key={emp.id}
                employee={emp}
                onClick={() => navigate(`/iam/employees/${emp.employeeNumber}`)}
              />
            ))}
          </Stack>
        )}

      </Stack>
    </ModuleContentShell>
  );
}