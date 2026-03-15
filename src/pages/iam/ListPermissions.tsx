import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Stack, Group, Box, Text, Title, TextInput, Paper,
  ThemeIcon, Badge, Loader, Alert, Select, Button,
} from "@mantine/core";
import {
  IconLock, IconLockOff, IconChevronRight, IconAlertCircle,
  IconSearch, IconBuilding, IconUser, IconShieldOff, IconArrowLeft,
} from "@tabler/icons-react";
import { useApiClient } from "../../api/useApiClient";
import { useAuth } from "../../auth/AuthContext";
import { ModuleContentShell } from "../../components/layout/ModuleContentShell";

// ─── Types ────────────────────────────────────────────────────────────────────

type PermissionScope = "COMPANY" | "EMPLOYEE";

interface PermissionDTO {
  id: number;
  permissionKey: string;
  displayName: string;
  resolvedLabel: string;
  scope: PermissionScope;
}

// ─── API Hook ─────────────────────────────────────────────────────────────────

function usePermissionListApi() {
  const api = useApiClient();

  const getPermissions = useCallback(
    (): Promise<PermissionDTO[]> => api("/backend/api/roles/permissions"),
    [api]
  );

  return { getPermissions };
}

// ─── Shared: ScopeBadge ───────────────────────────────────────────────────────

export function ScopeBadge({ scope }: { scope: PermissionScope }) {
  return scope === "COMPANY" ? (
    <Badge color="secondary" variant="light" size="sm" leftSection={<IconBuilding size={10} />} style={{ flexShrink: 0 }}>
      Unternehmen
    </Badge>
  ) : (
    <Badge color="primary" variant="light" size="sm" leftSection={<IconUser size={10} />} style={{ flexShrink: 0 }}>
      Mitarbeiter
    </Badge>
  );
}

// ─── Sub-Component: PermissionCard ───────────────────────────────────────────

function PermissionCard({ permission, onClick }: { permission: PermissionDTO; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Paper
      withBorder radius="md"
      style={{
        cursor: "pointer",
        borderColor: hovered ? "var(--mantine-color-secondary-4)" : "var(--mantine-color-default-border)",
        transition: "border-color 0.15s, box-shadow 0.15s",
        boxShadow: hovered ? "0 2px 8px rgba(0,0,0,0.07)" : undefined,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <Group p="md" justify="space-between" wrap="nowrap">
        <Group gap="md" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
          <ThemeIcon size={36} variant="light" color={permission.scope === "COMPANY" ? "secondary" : "primary"} radius="md" style={{ flexShrink: 0 }}>
            <IconLock size={18} />
          </ThemeIcon>
          <Box style={{ minWidth: 0 }}>
            <Text fw={500} size="sm" truncate>{permission.resolvedLabel}</Text>
            <Text size="xs" c="dimmed" ff="monospace" truncate>{permission.permissionKey}</Text>
          </Box>
        </Group>
        <Group gap="xs" wrap="nowrap" style={{ flexShrink: 0 }}>
          <ScopeBadge scope={permission.scope} />
          <IconChevronRight size={15} color="var(--mantine-color-dimmed)" style={{ transition: "transform 0.15s", transform: hovered ? "translateX(2px)" : "none" }} />
        </Group>
      </Group>
    </Paper>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function PermissionListPage() {
  const navigate = useNavigate();
  const { permissionProfile } = useAuth();
  const { getPermissions } = usePermissionListApi();

  // All hooks must be declared before any conditional return (React rules of hooks)
  const [permissions, setPermissions] = useState<PermissionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [scopeFilter, setScopeFilter] = useState<string | null>(null);

  const canView =
    permissionProfile?.companyPermissions.includes("ROLE_MANAGE") ||
    permissionProfile?.companyPermissions.includes("ROLE_VIEW");

  useEffect(() => {
    if (!canView) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        setPermissions(await getPermissions());
      } catch (e: any) {
        setError(e?.message ?? "Permissions could not be loaded");
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
          Du hast keine Berechtigung, Berechtigungen einzusehen. Wende dich an einen Administrator.
        </Alert>
        <Button mt="md" variant="light" color="secondary" radius="md" leftSection={<IconArrowLeft size={16} />} onClick={() => navigate("/dashboard")}>
          Zum Dashboard
        </Button>
      </Box>
    );
  }

  const filtered = permissions.filter((p) => {
    const matchesSearch =
      p.resolvedLabel.toLowerCase().includes(search.toLowerCase()) ||
      p.permissionKey.toLowerCase().includes(search.toLowerCase());
    const matchesScope = !scopeFilter || p.scope === scopeFilter;
    return matchesSearch && matchesScope;
  });

  const companyPerms = filtered.filter((p) => p.scope === "COMPANY");
  const employeePerms = filtered.filter((p) => p.scope === "EMPLOYEE");

  return (
    <ModuleContentShell>
      <Stack p="xl">

        <Group justify="space-between" align="flex-start" wrap="wrap" gap="sm">
          <Group gap="sm">
            <ThemeIcon size={40} variant="light" color="secondary" radius="md">
              <IconLock size={22} />
            </ThemeIcon>
            <Box>
              <Title order={3} fw={600}>Berechtigungen</Title>
              <Text size="sm" c="dimmed">{permissions.length} Berechtigungen im Unternehmen</Text>
            </Box>
          </Group>
        </Group>

        {error && (
          <Alert color="red" icon={<IconAlertCircle size={16} />} radius="md" withCloseButton onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Group gap="sm" wrap="wrap">
          <TextInput
            placeholder="Berechtigungen durchsuchen..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            radius="md"
            style={{ flex: 1, minWidth: 200 }}
          />
          <Select
            placeholder="Alle Scopes"
            data={[
              { value: "COMPANY", label: "Unternehmensweit" },
              { value: "EMPLOYEE", label: "Mitarbeiterbezogen" },
            ]}
            value={scopeFilter}
            onChange={setScopeFilter}
            clearable
            radius="md"
            w={190}
          />
        </Group>

        {loading ? (
          <Group justify="center" py="xl">
            <Loader size="sm" color="secondary" />
            <Text size="sm" c="dimmed">Berechtigungen werden geladen...</Text>
          </Group>
        ) : filtered.length === 0 ? (
          <Paper withBorder p="xl" ta="center" radius="md">
            <ThemeIcon size={48} variant="light" color="gray" mx="auto" mb="sm"><IconLockOff size={24} /></ThemeIcon>
            <Text fw={500} mb={4}>Keine Berechtigungen gefunden</Text>
            <Text size="sm" c="dimmed">
              {search || scopeFilter ? "Versuche einen anderen Suchbegriff oder Filter" : "Das System hat noch keine Berechtigungen generiert"}
            </Text>
          </Paper>
        ) : (
          <Stack gap="xl">
            {companyPerms.length > 0 && (
              <Box>
                <Group gap="xs" mb="sm">
                  <IconBuilding size={13} color="var(--mantine-color-dimmed)" />
                  <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: 1 }}>
                    Unternehmensweite Berechtigungen ({companyPerms.length})
                  </Text>
                </Group>
                <Stack gap="xs">
                  {companyPerms.map((p) => (
                    <PermissionCard key={p.id} permission={p} onClick={() => navigate(`/iam/permissions/${p.id}`)} />
                  ))}
                </Stack>
              </Box>
            )}
            {employeePerms.length > 0 && (
              <Box>
                <Group gap="xs" mb="sm">
                  <IconUser size={13} color="var(--mantine-color-dimmed)" />
                  <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: 1 }}>
                    Mitarbeiterbezogene Berechtigungen ({employeePerms.length})
                  </Text>
                </Group>
                <Stack gap="xs">
                  {employeePerms.map((p) => (
                    <PermissionCard key={p.id} permission={p} onClick={() => navigate(`/iam/permissions/${p.id}`)} />
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        )}
      </Stack>
    </ModuleContentShell>
  );
}