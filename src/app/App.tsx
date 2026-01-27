import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../auth/AuthProvider";
import { BrandingProvider } from "../tenant/BrandingProvider";
import { Router } from "./Router";

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrandingProvider>
        <BrowserRouter>
          <Router />
        </BrowserRouter>
      </BrandingProvider>
    </AuthProvider>
  );
};
