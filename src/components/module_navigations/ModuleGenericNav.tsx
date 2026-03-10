import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Tooltip,
  Text,
  ScrollArea,
  Divider,
  useMantineTheme,
  Drawer,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ModuleNavItem {
  label: string;
  icon: React.FC<{ size?: number; color?: string; strokeWidth?: number }>;
  key: string;
  /** Optional badge count */
  badge?: number;
  /** Divider before this item */
  dividerBefore?: boolean;
  /** Renders as a non-clickable group label instead of a nav button */
  group?: boolean;
}

interface ModuleLayoutProps {
  children: React.ReactNode;
  navItems: ModuleNavItem[];
  activeKey: string;
  onNavigate: (key: string) => void;
  /** Module title shown when sidebar is expanded */
  moduleTitle: string;
  /** Module icon shown in header of sidebar */
  moduleIcon?: React.FC<{ size?: number; color?: string }>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface ModuleSidebarCtx {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

const ModuleSidebarContext = createContext<ModuleSidebarCtx>({
  collapsed: false,
  setCollapsed: () => {},
});

export function useModuleSidebar() {
  return useContext(ModuleSidebarContext);
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SIDEBAR_EXPANDED = 220;
const SIDEBAR_COLLAPSED = 56;
const TRANSITION = "width 0.22s cubic-bezier(0.4,0,0.2,1)";

// ─── Contrast Helper ──────────────────────────────────────────────────────────

function getContrastColor(hex: string): string {
  if (!hex || hex.length < 7) return "#ffffff";
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160 ? "#111111" : "#ffffff";
}

function hexToRgba(hex: string, alpha: number): string {
  if (!hex || hex.length < 7) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─── Nav Item Component ───────────────────────────────────────────────────────

function NavItem({
  item,
  active,
  collapsed,
  onNavigate,
  bgColor,
  textColor,
}: {
  item: ModuleNavItem;
  active: boolean;
  collapsed: boolean;
  onNavigate: (key: string) => void;
  bgColor: string;
  textColor: string;
}) {
  const [hovered, setHovered] = useState(false);

  const activeStyle: React.CSSProperties = {
    backgroundColor: hexToRgba(textColor === "#ffffff" ? "#ffffff" : "#000000", 0.15),
    borderRight: `3px solid ${textColor}`,
  };

  const hoverStyle: React.CSSProperties = {
    backgroundColor: hexToRgba(textColor === "#ffffff" ? "#ffffff" : "#000000", 0.08),
  };

  const button = (
    <button
      onClick={() => onNavigate(item.key)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: collapsed ? 0 : 10,
        width: "100%",
        padding: collapsed ? "10px 0" : "10px 12px",
        justifyContent: collapsed ? "center" : "flex-start",
        border: "none",
        borderRight: "3px solid transparent",
        borderRadius: 0,
        cursor: "pointer",
        backgroundColor: "transparent",
        transition: "background-color 0.15s, border-color 0.15s",
        position: "relative",
        ...(active ? activeStyle : hovered ? hoverStyle : {}),
      }}
    >
      {/* Icon */}
      <span style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
        <item.icon
          size={20}
          color={textColor}
          strokeWidth={active ? 2.2 : 1.7}
        />
      </span>

      {/* Label */}
      {!collapsed && (
        <Text
          size="sm"
          fw={active ? 600 : 400}
          style={{
            color: textColor,
            flex: 1,
            textAlign: "left",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            letterSpacing: active ? "0.01em" : "normal",
            transition: "opacity 0.18s",
            opacity: collapsed ? 0 : 1,
          }}
        >
          {item.label}
        </Text>
      )}

      {/* Badge */}
      {item.badge !== undefined && item.badge > 0 && (
        <span
          style={{
            minWidth: 18,
            height: 18,
            borderRadius: 99,
            backgroundColor: textColor,
            color: bgColor,
            fontSize: 10,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 4px",
            flexShrink: 0,
            position: collapsed ? "absolute" : "relative",
            top: collapsed ? 6 : undefined,
            right: collapsed ? 6 : undefined,
          }}
        >
          {item.badge > 99 ? "99+" : item.badge}
        </span>
      )}
    </button>
  );

  if (collapsed) {
    return (
      <Tooltip label={item.label} position="right" withArrow>
        {button}
      </Tooltip>
    );
  }

  return button;
}

// ─── Sidebar Content ──────────────────────────────────────────────────────────

// ─── Collapse Toggle Button (wiederverwendet in header + footer) ──────────────

function CollapseToggle({
  collapsed,
  setCollapsed,
  textColor,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  textColor: string;
}) {
  const label = collapsed ? "Erweitern" : "Einklappen";
  return (
    <Tooltip label={label} position="right" withArrow disabled={!collapsed}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        title={label}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "10px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          color: hexToRgba(textColor, 0.6),
          transition: "background-color 0.15s, color 0.15s",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = hexToRgba(textColor, 0.1);
          (e.currentTarget as HTMLElement).style.color = textColor;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
          (e.currentTarget as HTMLElement).style.color = hexToRgba(textColor, 0.6);
        }}
      >
        {/* Doppel-Chevron für mehr Prägnanz */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {collapsed ? (
            // Pfeil nach rechts (aufklappen)
            <>
              <polyline points="13 17 18 12 13 7" />
              <polyline points="6 17 11 12 6 7" />
            </>
          ) : (
            // Pfeil nach links (einklappen)
            <>
              <polyline points="11 17 6 12 11 7" />
              <polyline points="18 17 13 12 18 7" />
            </>
          )}
        </svg>
      </button>
    </Tooltip>
  );
}

// ─── Sidebar Content ──────────────────────────────────────────────────────────

function SidebarContent({
  navItems,
  activeKey,
  onNavigate,
  collapsed,
  setCollapsed,
  moduleTitle,
  moduleIcon: ModuleIcon,
  bgColor,
  textColor,
}: {
  navItems: ModuleNavItem[];
  activeKey: string;
  onNavigate: (key: string) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  moduleTitle: string;
  moduleIcon?: React.FC<{ size?: number; color?: string }>;
  bgColor: string;
  textColor: string;
}) {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: bgColor,
        overflow: "hidden",
      }}
    >
      {/* Module Header — nur wenn expanded */}
      {!collapsed && (
        <div
          style={{
            padding: "14px 12px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            justifyContent: "space-between",
            borderBottom: `1px solid ${hexToRgba(textColor, 0.15)}`,
            flexShrink: 0,
          }}
        >
          {/* Icon + Title */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              overflow: "hidden",
              flex: 1,
            }}
          >
            {ModuleIcon && (
              <span style={{ flexShrink: 0 }}>
                <ModuleIcon size={22} color={textColor} />
              </span>
            )}
            <div style={{ overflow: "hidden" }}>
                <Text
                size="sm"
                fw={700}
                style={{
                    color: textColor,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    lineHeight: "1.2em",
                    maxHeight: "2.4em",
                    letterSpacing: "0.02em",
                }}
                >
                {moduleTitle}
                </Text>
            </div>
          </div>
        </div>
      )}

      {/* Nav Items */}
      <ScrollArea style={{ flex: 1 }} scrollbarSize={4}>
        <div style={{ paddingTop: 6, paddingBottom: 6 }}>
          {navItems.map((item) => (
            <React.Fragment key={item.key}>
              {item.dividerBefore && (
                <div style={{ padding: "6px 12px" }}>
                  <div style={{ height: 1, backgroundColor: hexToRgba(textColor, 0.15) }} />
                </div>
              )}

              {/* Gruppen-Label */}
              {item.group ? (
                collapsed ? (
                  // Im eingeklappten Zustand: nur dünne Trennlinie
                  <div style={{ padding: "6px 12px" }}>
                    <div style={{ height: 1, backgroundColor: hexToRgba(textColor, 0.2) }} />
                  </div>
                ) : (
                  <div style={{ padding: "10px 12px 10px 12px" }}>
                    <Text
                      size="xs"
                      fw={700}
                      style={{
                        color: hexToRgba(textColor, 0.5),
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      {item.label}
                    </Text>
                  </div>
                )
              ) : (
                <NavItem
                  item={item}
                  active={activeKey === item.key}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                  bgColor={bgColor}
                  textColor={textColor}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </ScrollArea>

      {/* ── Footer: Collapse Toggle immer unten ── */}
      <div style={{ borderTop: `1px solid ${hexToRgba(textColor, 0.12)}`, flexShrink: 0 }}>
        <CollapseToggle
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          textColor={textColor}
        />
      </div>
    </div>
  );
}

// ─── Main ModuleLayout ────────────────────────────────────────────────────────

export function ModuleGenericNav({
  children,
  navItems,
  activeKey,
  onNavigate,
  moduleTitle,
  moduleIcon,
}: ModuleLayoutProps) {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Collapse automatically on small screens
  useEffect(() => {
    if (isMobile) setCollapsed(true);
  }, [isMobile]);

  const bgColor = theme?.colors?.secondary?.[6] ?? "#2F5D62";
  const textColor = getContrastColor(bgColor);

  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

  const handleNavigate = (key: string) => {
    onNavigate(key);
    if (isMobile) setDrawerOpen(false);
  };

  return (
    <ModuleSidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>

        {/* ── Desktop Sidebar ── */}
        {!isMobile && (
          <div
            style={{
              width: sidebarWidth,
              flexShrink: 0,
              transition: TRANSITION,
              overflow: "hidden",
              borderRight: `1px solid ${hexToRgba(bgColor, 0.3)}`,
              boxShadow: "2px 0 8px rgba(0,0,0,0.06)",
              zIndex: 10,
            }}
          >
            <SidebarContent
              navItems={navItems}
              activeKey={activeKey}
              onNavigate={handleNavigate}
              collapsed={collapsed}
              setCollapsed={setCollapsed}
              moduleTitle={moduleTitle}
              moduleIcon={moduleIcon}
              bgColor={bgColor}
              textColor={textColor}
            />
          </div>
        )}

        {/* ── Mobile: Floating Toggle Button + Drawer ── */}
        {isMobile && (
          <>
            {/* Floating tab on the left edge */}
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Navigation öffnen"
              style={{
                position: "fixed",
                left: 0,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 200,
                backgroundColor: bgColor,
                border: "none",
                borderRadius: "0 8px 8px 0",
                padding: "12px 8px",
                cursor: "pointer",
                boxShadow: "2px 0 12px rgba(0,0,0,0.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Hamburger icon */}
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke={textColor}
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <Drawer
              opened={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              size={SIDEBAR_EXPANDED}
              padding={0}
              withCloseButton={false}
              styles={{
                body: { padding: 0, height: "100%" },
                content: { backgroundColor: bgColor },
              }}
            >
              <SidebarContent
                navItems={navItems}
                activeKey={activeKey}
                onNavigate={handleNavigate}
                collapsed={false}
                setCollapsed={() => {}}
                moduleTitle={moduleTitle}
                moduleIcon={moduleIcon}
                bgColor={bgColor}
                textColor={textColor}
              />
            </Drawer>
          </>
        )}

        {/* ── Page Content ── */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <ScrollArea style={{ flex: 1 }} scrollbarSize={6} className="custom-scroll">
            {children}
          </ScrollArea>
        </div>
      </div>
    </ModuleSidebarContext.Provider>
  );
}