import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app/App";
import { AuthProvider } from "./auth/AuthProvider";
import { BrandingProvider } from "./tenant/BrandingProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrandingProvider>
        <App />
      </BrandingProvider>
    </AuthProvider>
  </React.StrictMode>
);
