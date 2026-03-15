import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { type JSX } from "react";
import { useAuth } from "../auth/AuthContext";
import { decodeJwt } from "../auth/jwtDecode";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { TimeTrackingPage } from "../pages/TimeTrackingPage";
import { DefaultLayout } from "../components/layout/DefaultLayout";
import { MinimalLayout } from "../components/layout/MinimalLayout";
import { BrandingProvider } from "../tenant/BrandingProvider";
import { RoleManagementPage } from "../pages/iam/ListRoles";
import { IAMModuleNav } from "../components/module_navigations/IAMModuleNav";
import { CreateRolePage } from "../pages/iam/CreateRole";
import { DetailRolePage } from "../pages/iam/DetailsRole";
import { PermissionListPage } from "../pages/iam/ListPermissions";
import { DetailsPermissionPage } from "../pages/iam/DetailsPermission";

// Returns true if the token exists and has not expired
function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  try {
    const payload = decodeJwt(token);
    return payload.exp * 1000 > Date.now() + 5000;
  } catch {
    return false;
  }
}

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { token } = useAuth();
  if (!isTokenValid(token)) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Reusable IAM wrapper — all IAM routes share the same layout
const IAMRoute = ({ children }: { children: JSX.Element }) => (
  <ProtectedRoute>
    <BrandingProvider mode="tenant">
      <DefaultLayout>
        <IAMModuleNav>
          {children}
        </IAMModuleNav>
      </DefaultLayout>
    </BrandingProvider>
  </ProtectedRoute>
);

export const Router = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={
        <BrandingProvider mode="standard">
          <MinimalLayout><LoginPage /></MinimalLayout>
        </BrandingProvider>
      }/>

      <Route path="/login" element={
        <BrandingProvider mode="standard">
          <MinimalLayout><LoginPage /></MinimalLayout>
        </BrandingProvider>
      }/>

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <BrandingProvider mode="tenant">
            <DefaultLayout><DashboardPage /></DefaultLayout>
          </BrandingProvider>
        </ProtectedRoute>
      }/>

      <Route path="/time-tracking" element={
        <ProtectedRoute>
          <BrandingProvider mode="tenant">
            <DefaultLayout><TimeTrackingPage /></DefaultLayout>
          </BrandingProvider>
        </ProtectedRoute>
      }/>

      {/* ── IAM Module ── */}
      {/* Note: /iam/permissions must come before /iam/roles/:roleName */}
      <Route path="/iam/permissions" element={<IAMRoute><PermissionListPage /></IAMRoute>}/>
      <Route path="/iam/permissions/:permissionId" element={<IAMRoute><DetailsPermissionPage /></IAMRoute>}/>
      <Route path="/iam/roles" element={<IAMRoute><RoleManagementPage /></IAMRoute>}/>
      <Route path="/iam/roles/create" element={<IAMRoute><CreateRolePage /></IAMRoute>}/>
      <Route path="/iam/roles/:roleName" element={<IAMRoute><DetailRolePage /></IAMRoute>}/>
      <Route path="/iam/employees" element={<IAMRoute><DashboardPage /></IAMRoute>}/>
    </Routes>
  </BrowserRouter>
);