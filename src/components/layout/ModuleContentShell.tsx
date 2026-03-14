import { Box, type BoxProps } from "@mantine/core";
import type { ReactNode } from "react";

// ─── Zentrale Breitensteuerung für alle Modul-Pages ───────────────────────────
// Hier anpassen um die Inhaltsbreite global zu ändern.
// Der Container passt sich automatisch an wenn Sidebar oder
// Notification-Panel ein-/ausgeblendet werden, da er in einem
// flex: 1 Container sitzt (DefaultLayout → main).

const MODULE_CONTENT_MAX_WIDTH = 1200;

interface ModuleContentShellProps extends BoxProps {
  children: ReactNode;
}

export function ModuleContentShell({ children, ...rest }: ModuleContentShellProps) {
  return (
    <Box
      maw={MODULE_CONTENT_MAX_WIDTH}
      mx="auto"
      w="100%"
      {...rest}
    >
      {children}
    </Box>
  );
}