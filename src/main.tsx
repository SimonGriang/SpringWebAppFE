import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app/App";
import { AuthProvider } from "./auth/AuthProvider";
import { MantineProvider } from "@mantine/core";
import '@mantine/core/styles.css';

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MantineProvider> {/*defaultColorScheme="light" default Color Scheme can be changed to auto for system default settin for darkmode ord lightmode */}
      <AuthProvider>
          <App />
      </AuthProvider>
    </MantineProvider>
  </React.StrictMode>
);
