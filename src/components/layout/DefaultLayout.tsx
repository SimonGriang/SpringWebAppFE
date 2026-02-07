import { AppShell } from "@mantine/core";
import { DefaultHeader } from "../header/DefaultHeader";

export const DefaultLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AppShell
      padding="md"
      header={{ height: 56 }} 
    >
      <AppShell.Header>
        <DefaultHeader />
      </AppShell.Header>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
};