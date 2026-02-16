import { MantineProvider, type MantineThemeOverride, type MantineColorsTuple } from "@mantine/core";
import { useContext, useEffect, useState } from "react";
import { BrandingContext, type Branding } from "./BrandingContext";
import { AuthContext } from "../auth/AuthContext";
import { createApiClient } from "../api/apiClient";
import tinycolor from "tinycolor2";

const generateColorScale = (hex: string): MantineColorsTuple => {
  return [
    tinycolor(hex).lighten(45).toHexString(),
    tinycolor(hex).lighten(35).toHexString(),
    tinycolor(hex).lighten(25).toHexString(),
    tinycolor(hex).lighten(15).toHexString(),
    tinycolor(hex).lighten(5).toHexString(),
    tinycolor(hex).toHexString(),             // Index 5
    tinycolor(hex).toHexString(),             // Index 6
    tinycolor(hex).darken(10).toHexString(),
    tinycolor(hex).darken(20).toHexString(),
    tinycolor(hex).darken(30).toHexString(),
  ] as MantineColorsTuple;
};


export const BrandingProvider: React.FC<{
  children: React.ReactNode;
  mode: "standard" | "tenant";
}> = ({ children, mode }) => {
  const { token } = useContext(AuthContext);
  const [branding, setBranding] = useState<Branding | null>(null);
  const [loading, setLoading] = useState(true);

  const apiClient = createApiClient(() => token);


  const STANDARD_BRANDING: Branding = {
    primaryColor: "#F28C28",
    secondaryColor: "#2F5D62",
    accentColor: "#8A8F98",
    backgroundColor: "#F7F7F7",
    logoUrl: "/GriangLogo_ws.png",
  };

  const resolveLogoSrc = async(
    logoUrl: string,
    hasBackendLogo: boolean
  ): Promise<string> => {
    if (!hasBackendLogo) {
      return logoUrl;
    }

    const blob = await apiClient(
        `/backend/api/auth/${logoUrl}`,
        {
          method: "GET",
          headers: {
            Accept: "application/octet-stream",
          },
        }
      );
    return URL.createObjectURL(blob);
  };

  const loadBranding = async () => {
    setLoading(true);


    /* 🔴 FIX: expliziter Standard-Modus */
    if (mode === "standard") {
      setBranding(STANDARD_BRANDING);
      setLoading(false);
      return;
    }

    /* 🔴 FIX: Tenant-Modus ohne Token → Fallback */
    if (!token) {
      setBranding(STANDARD_BRANDING);
      setLoading(false);
      return;
    }

    try {
      const data = await apiClient("/backend/api/auth/tenant/branding");
      const hasBackendLogo = Boolean(data.logoUrl);
      const logoUrl = hasBackendLogo
        ? data.logoUrl
        : STANDARD_BRANDING.logoUrl;
      const resolvedLogoSrc = await resolveLogoSrc(logoUrl, hasBackendLogo);

      setBranding({
        primaryColor: data.primaryColor || STANDARD_BRANDING.primaryColor,
        secondaryColor: data.secondaryColor || STANDARD_BRANDING.secondaryColor,
        accentColor: data.accentColor || STANDARD_BRANDING.accentColor,
        backgroundColor:
          data.backgroundColor || STANDARD_BRANDING.backgroundColor,
        logoUrl: logoUrl,
        logoSrc: resolvedLogoSrc,
      });
    } catch (err) {
      console.error("Failed to load tenant branding", err);
      setBranding(STANDARD_BRANDING);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadBranding();
  }, [token, mode]);

  const theme: MantineThemeOverride | undefined = branding
    ? {
        colors: {
          primary: generateColorScale(branding.primaryColor),
          secondary: generateColorScale(branding.secondaryColor),
          accent: generateColorScale(branding.accentColor),
          background: generateColorScale(branding.backgroundColor),
        },
        primaryColor: "primary",
        components: {
                Anchor: {
                  styles: {
                    root: {
                      color: 'var(--mantine-color-secondary-6)', 
                    },
                  },
                },
              },
            }
          : undefined;

  return (
    <BrandingContext.Provider
      value={{ branding, loading, reloadBranding: loadBranding }}
    >
      <MantineProvider theme={theme} defaultColorScheme="auto">{children}</MantineProvider>
    </BrandingContext.Provider>
  );
};