import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import { BrandingContext } from "../tenant/BrandingContext";
import { Button, Text, Container, Image } from "@mantine/core";

export const DashboardPage: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const { branding, loading } = useContext(BrandingContext);

  if (loading) return <Text>Loading Branding...</Text>;

  return (
    <Container>
      {branding && <Image src={branding.logoUrl} alt="Logo" width={100} mb="md" />}
      <Text>Welcome, {user?.employeeId}</Text>
      <Text>Company: {user?.companyKey}</Text>
      <Button mt="md" onClick={logout}>Logout</Button>
    </Container>
  );
};
