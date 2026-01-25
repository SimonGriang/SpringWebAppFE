import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { MantineProvider } from "@mantine/core";
import { TenantProvider } from "./tenant/TenantProvider";
import { AuthProvider } from "./auth/AuthProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <TenantProvider>
        <MantineProvider>
          <App />
        </MantineProvider>
      </TenantProvider>
    </AuthProvider>
  </React.StrictMode>
);
