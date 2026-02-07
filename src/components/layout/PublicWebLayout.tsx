import { Group, Text, Avatar } from "@mantine/core";
import { useContext } from "react";
import { BrandingContext } from "../../tenant/BrandingContext";
import { AuthContext } from "../../auth/AuthContext";

export const DefaultHeader = () => {
  const { branding } = useContext(BrandingContext);
  const { user } = useContext(AuthContext);

  return (
    <Group h="100%" px="md" justify="space-between">
      <img
        src={branding?.logoSrc ?? "/default-logo.png"}
        alt="Logo"
        style={{ height: 32 }}
      />

      <Group>
        <Avatar size="sm" radius="xl" />
        <Text>{user?.employeeSurname}</Text>
      </Group>
    </Group>
  );
};