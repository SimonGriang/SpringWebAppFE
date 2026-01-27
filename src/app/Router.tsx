import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";

export const Router: React.FC = () => {
  const { token } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={token ? <DashboardPage /> : <Navigate to="/login" />} />
    </Routes>
  );
};
