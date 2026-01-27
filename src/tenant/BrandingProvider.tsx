import { MantineProvider, type MantineThemeOverride, type MantineColorsTuple } from "@mantine/core";
import { useContext, useEffect, useState } from "react";
import { BrandingContext, type Branding } from "./BrandingContext";
import { AuthContext } from "../auth/AuthContext";
import { createApiClient } from "../api/apiClient";
import tinycolor from "tinycolor2";

// Helper function to generate a color scale for Mantine theme
const generateColorScale = (hex: string): MantineColorsTuple => {
  const base = tinycolor(hex);
  const scale: string[] = [];

  for (let i = 0; i < 10; i++) {
    const factor = (i - 4.5) * 10; // -45% bis +45%
    const color = factor < 0 ? base.darken(-factor) : base.lighten(factor);
    scale.push(color.toHexString());
  }

  return scale as unknown as MantineColorsTuple;
};

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [branding, setBranding] = useState<Branding | null>(null);
  const [loading, setLoading] = useState(true);

  const apiClient = createApiClient(() => token);

  const loadBranding = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await apiClient("/api/tenant/branding");
      setBranding(data);
    } catch (err) {
      console.error("Failed to load branding", err);
      setBranding(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranding();
  }, [token]);

  const theme: MantineThemeOverride | undefined = branding
    ? {
        colors: {
          primary: generateColorScale(branding.primaryColor),
          secondary: generateColorScale(branding.secondaryColor),
          accent: generateColorScale(branding.accentColor),
          background: generateColorScale(branding.backgroundColor),
        },
        primaryColor: "primary",
      }
    : undefined;

  return (
    <BrandingContext.Provider value={{ branding, loading, reloadBranding: loadBranding }}>
      <MantineProvider theme={theme}>{children}</MantineProvider>
    </BrandingContext.Provider>
  );
};