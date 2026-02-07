import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Stack, Title, TextInput, PasswordInput, Button, Anchor, Group, Text }  from "@mantine/core";
import { useAuth } from "../auth/AuthContext";

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [employeeNumber, setEmployeeNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/backend/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeNumber, password }),
      });

      if (!res.ok) {
        console.error("Login fehlgeschlagen", res.status);
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

        {/* Mitarbeitennummer */}
        <TextInput
          label="Mitarbeiternummer"
          placeholder="Deine Mitarbeitennummer"
          value={employeeNumber}
          onChange={(e) => setEmployeeNumber(e.currentTarget.value)}
          required
        />

        {/* Passwort */}
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
            required
          />
        </Box>

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