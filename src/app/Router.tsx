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
import { RoleRightsModuleNav } from "../components/module_navigations/RoleRightsModuleNav";
import { CreateRolePage } from "../pages/iam/CreateRole";
import { DetailRolePage } from "../pages/iam/DetailsRole";
import { PermissionListPage } from "../pages/iam/ListPermissions";

// Returns true if the token exists and is not yet expired
function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  try {
    const payload = decodeJwt(token);
    // Add a 5-second buffer to avoid edge cases where the token expires
    // between this check and the actual API request
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

      // IAM

      <Route path="/rols" element={
        <ProtectedRoute>
          <BrandingProvider mode="tenant">
            <DefaultLayout>
              <RoleRightsModuleNav>
                <RoleManagementPage />
              </RoleRightsModuleNav>
            </DefaultLayout>
          </BrandingProvider>
        </ProtectedRoute>
      }/>

      <Route path="/rols/create" element={
        <ProtectedRoute>
          <BrandingProvider mode="tenant">
            <DefaultLayout>
              <RoleRightsModuleNav>
                <CreateRolePage />
              </RoleRightsModuleNav>
            </DefaultLayout>
          </BrandingProvider>
        </ProtectedRoute>
      }/>

      <Route path="/rols/:id" element={
        <ProtectedRoute>
          <BrandingProvider mode="tenant">
            <DefaultLayout>
              <RoleRightsModuleNav>
                <DetailRolePage />
              </RoleRightsModuleNav>
            </DefaultLayout>
          </BrandingProvider>
        </ProtectedRoute>
      }/>

      <Route path="/permissions" element={
        <ProtectedRoute>
          <BrandingProvider mode="tenant">
            <DefaultLayout>
              <RoleRightsModuleNav>
                <PermissionListPage />
              </RoleRightsModuleNav>
            </DefaultLayout>
          </BrandingProvider>
        </ProtectedRoute>
      }/>
      <Route path="/permissions/:id" element={
        <ProtectedRoute>
          <BrandingProvider mode="tenant">
            <DefaultLayout>
              <RoleRightsModuleNav>
                <PermissionListPage />
              </RoleRightsModuleNav>
            </DefaultLayout>
          </BrandingProvider>
        </ProtectedRoute>
      }/>
    </Routes>
  </BrowserRouter>
);