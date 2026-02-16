import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { type JSX } from "react";
import { useAuth } from "../auth/AuthContext";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { TimeTrackingPage } from "../pages/TimeTrackingPage";
import { DefaultLayout } from "../components/layout/DefaultLayout";
import { MinimalLayout } from "../components/layout/MinimalLayout";
import { BrandingProvider } from "../tenant/BrandingProvider";
//import { PublicWebLayout } from "../components/layout/PublicWebLayout";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

  export const Router = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" 
      element={
          <BrandingProvider mode="standard">
            <MinimalLayout>
              <LoginPage />
            </MinimalLayout>
          </BrandingProvider>
        } 
      />

      <Route path="/login" 
        element={
          <BrandingProvider mode="standard">      
            <MinimalLayout>
              <LoginPage />
            </MinimalLayout>
          </BrandingProvider>
        } 
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <BrandingProvider mode="tenant">
              <DefaultLayout>
                <DashboardPage />
              </DefaultLayout>
            </BrandingProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/time-tracking"
        element={
          <ProtectedRoute>
            <BrandingProvider mode="tenant" >
              <DefaultLayout>
                <TimeTrackingPage />
              </DefaultLayout>
            </BrandingProvider>
          </ProtectedRoute>
        }
      />
    </Routes>
  </BrowserRouter>
);
