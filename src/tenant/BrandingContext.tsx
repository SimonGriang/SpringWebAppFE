import { createContext } from "react";

export type Branding = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  logoUrl: string;
};

export type BrandingContextType = {
  branding: Branding | null;
  loading: boolean;
  reloadBranding: () => Promise<void>;
};

export const BrandingContext = createContext<BrandingContextType>({
  branding: null,
  loading: false,
  reloadBranding: async () => {},
});
