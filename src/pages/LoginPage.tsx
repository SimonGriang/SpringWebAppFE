import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Stack, Title, TextInput, PasswordInput, Button, Anchor, Group, Text }  from "@mantine/core";
import { useAuth } from "../auth/AuthContext";
import { IconAlertCircle } from '@tabler/icons-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [companyUniqueIdentifier, setCompanyUniqueIdentifier] = useState("");
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/backend/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({companyUniqueIdentifier, employeeNumber, password }),
      });

      if (!res.ok) {
        setError('Benutzername oder Passwort ist falsch.');
        setCompanyUniqueIdentifier('');
        setEmployeeNumber('');
        setPassword('');
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (!data.token) {
        console.error("Kein Token erhalten", data);
        setLoading(false);
        return;
      }

      login(data.token);
      navigate("/dashboard");
    } catch (err) {
      console.error("Fehler beim Login", err);
      setError('Benutzername oder Passwort ist falsch.');
      setCompanyUniqueIdentifier('');
      setEmployeeNumber('');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      style={{
        maxWidth: 400,
        margin: "auto",
        padding: 20,
        marginTop: 50,
      }}
    >
      <Stack gap="md">
        {/* Titel */}
        <Title order={2} style={{ textAlign: "center" }}>
          Login
        </Title>

        <TextInput
          label="Unternehmenskennung"
          placeholder="Deine Unternehmenskennung"
          value={companyUniqueIdentifier}
          onChange={(e) => setCompanyUniqueIdentifier(e.currentTarget.value)}
        />

        <TextInput
          label="Mitarbeiternummer"
          placeholder="Deine Mitarbeitennummer"
          value={employeeNumber}
          onChange={(e) => setEmployeeNumber(e.currentTarget.value)}
        />

        <Box>
          <Group justify="apart" mb={5}>
            <Text component="label" htmlFor="password" size="sm" fw={500}>
              Passwort
            </Text>
          </Group>
          <PasswordInput
            id="password"
            placeholder="Dein Passwort"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
          />
        </Box>
        {error && (
          <Alert 
            icon={<IconAlertCircle size={16} />} 
            color="red" 
            mt="md"
          >
            {error}
          </Alert>
        )}
        <Anchor href="#" onClick={(e) => e.preventDefault()} pt={2} fw={500} fz="xs">
          Passwort vergessen?
        </Anchor>
        {/* Login Button */}
        <Button fullWidth onClick={submit} loading={loading}>
          Login
        </Button>


      </Stack>
    </Box>
  );
};