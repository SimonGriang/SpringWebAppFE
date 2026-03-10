// components/layout/RoleRightsModuleNav.tsx

import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ModuleGenericNav, type ModuleNavItem } from "./ModuleGenericNav";
import { IconShield, IconLock, IconUsers, IconUserShield, IconHierarchy } from "@tabler/icons-react";

const NAV_ITEMS: ModuleNavItem[] = [
  // ── Identitäts- & Zugriffsverwaltung ──────────────────────────────────────
  // Gruppenüberschrift als nicht-navigierbares Label-Item
  { key: "__group_iam",        label: "Benutzer, Rollen und Rechte verwalten", icon: IconUserShield, group: true },
  { key: "/rols",            label: "Rollen",                           icon: IconHierarchy },
  { key: "/permissions",     label: "Berechtigungen",                           icon: IconLock },
  { key: "/employees",   label: "Mitarbeiter",                         icon: IconUsers },
];

export function RoleRightsModuleNav({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <ModuleGenericNav
      navItems={NAV_ITEMS}
      activeKey={location.pathname}
      onNavigate={(path) => navigate(path)}
      moduleTitle="Identitäts- & Zugriffsverwaltung"
      moduleIcon={IconShield}
    >
      {children}
    </ModuleGenericNav>
  );
}