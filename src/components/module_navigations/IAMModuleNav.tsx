import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ModuleGenericNav, type ModuleNavItem } from "./ModuleGenericNav";
import { IconShield, IconLock, IconUsers, IconUserShield, IconHierarchy } from "@tabler/icons-react";

const NAV_ITEMS: ModuleNavItem[] = [
  // Group label — non-navigable
  { key: "__group_iam", label: "Identity & Access Management", icon: IconUserShield, group: true },
  { key: "/iam/employees",   label: "Employees",    icon: IconUsers },
  { key: "/iam/roles",       label: "Roles",        icon: IconHierarchy },
  { key: "/iam/permissions", label: "Permissions",  icon: IconLock },
];

export function IAMModuleNav({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const activeKey = (() => {
    const path = location.pathname;
      if (path.startsWith("/iam/employees")) return "/iam/employees";
    if (path.startsWith("/iam/roles")) return "/iam/roles";
    if (path.startsWith("/iam/permissions")) return "/iam/permissions";
    return path;
  })();

  return (
    <ModuleGenericNav
      navItems={NAV_ITEMS}
      activeKey={activeKey}
      onNavigate={(path) => navigate(path)}
      moduleTitle="Identity & Access"
      moduleIcon={IconShield}
    >
      {children}
    </ModuleGenericNav>
  );
}