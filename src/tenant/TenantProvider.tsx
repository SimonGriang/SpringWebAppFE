// src/tenant/TenantProvider.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import { MantineProvider, createTheme } from "@mantine/core";
import { baseTheme } from "../theme/baseTheme";
import { lighten, darken } from "polished";

type Tenant = {
  name: string;
  primaryColor: string;
  secondaryColor?: string;
  tertiaryColor?: string;
  quaternaryColor?: string;
  baseColor?: string;
  logoUrl: string;
};

const TenantContext = createContext<Tenant | null>(null);

export const useTenant = () => useContext(TenantContext);

type TenantProviderProps = {
  children: ReactNode;
};

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const [tenant, setTenant] = useState<Tenant>({
    name: "Default",
    primaryColor: "#8A2338",
    secondaryColor: "#C94F5D",
    tertiaryColor: "#4D4D4D",
    quaternaryColor: "#BFBFBF",
    baseColor: "#FFFFFF",
    logoUrl: "/default-logo.svg",
  });

  // Theme dynamisch erzeugen
  const theme = createTheme({
    ...baseTheme,
    primaryColor: "brand",
    colors: {
      brand: generateShades(tenant.primaryColor),
      secondary: tenant.secondaryColor ? generateShades(tenant.secondaryColor) : undefined,
      tertiary: tenant.tertiaryColor ? generateShades(tenant.tertiaryColor) : undefined,
      quaternary: tenant.quaternaryColor ? generateShades(tenant.quaternaryColor) : undefined,
    },
  });

  function generateShades(baseColor: string): readonly [string,string,string,string,string,string,string,string,string,string] {
    const shades: string[] = Array.from({ length: 10 }, (_, i) =>
        i < 5
        ? lighten((5 - i) * 0.1, baseColor)
        : darken((i - 4) * 0.1, baseColor)
    );

    return shades as [string,string,string,string,string,string,string,string,string,string]; 
  }


  return (
    <TenantContext.Provider value={tenant}>
      <MantineProvider theme={theme}>{children}</MantineProvider>
    </TenantContext.Provider>
  );
};
