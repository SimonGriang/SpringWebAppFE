import { useAuth } from "../auth/AuthContext";
import { useBranding } from "../tenant/BrandingContext";
import { Button, Box, Text, Image } from "@mantine/core";
import { useNavigate } from "react-router-dom";

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const { branding, loading } = useBranding();
  const navigate = useNavigate();

  if (loading) {
    return <Text>Lade Branding...</Text>;
  }

  return (
    <Box>
      <h1>
        Dashboard
      </h1>

      {/* Buttons mit Branding */}
      <Button
        style={{ marginTop: 20, backgroundColor: branding?.accentColor }}
        onClick={() => navigate("/time-tracking")}
      >
        Zeiterfassung öffnen
      </Button>

      <Button
        style={{
          marginLeft: 10,
          marginTop: 20,
          backgroundColor: branding?.secondaryColor,
        }}
        onClick={logout}
      >
        Logout
      </Button>
    </Box>
  );
};
