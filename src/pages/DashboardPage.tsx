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
    <Box style={{ padding: 20, backgroundColor: branding?.backgroundColor }}>
      {/* Header mit Branding */}
      <Box
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: branding?.primaryColor,
          padding: "10px 20px",
          borderRadius: 8,
          color: "white",
        }}
      >
        <Image src={branding?.logoUrl} height={40} alt="Logo" />
        <Text>
          {user?.employeeSurname}, {user?.employeeFirstname}
        </Text>
      </Box>

      <Text size="xl" style={{ marginTop: 20 }}>
        Dashboard
      </Text>

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
