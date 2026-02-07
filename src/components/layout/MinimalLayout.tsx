import { AppShell } from "@mantine/core";
import { MinimalHeader } from "../header/MinimalHeader";

export const MinimalLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AppShell header={{ height: 56 }} padding="md">
      <AppShell.Header>
        <MinimalHeader />
      </AppShell.Header>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>

  );
};
