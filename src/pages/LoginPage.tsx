import { useState, useContext } from "react";
import { TextInput, Button, Paper, Title } from "@mantine/core";
import { AuthContext } from "../auth/AuthContext";

// Fake Backend-Login
const fakeLogin = async (username: string, password: string) => {
  // simuliert JWT von Backend
  return {
    token: "FAKE.JWT.TOKEN",
    payload: {
      employeeId: "123",
      companyId: "456",
      companyKey: "acme",
      permissions: ["USER_READ"],
    },
  };
};

export const LoginPage: React.FC = () => {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { token, payload } = await fakeLogin(username, password);
    login(token, payload);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <Paper p="xl" shadow="md" style={{ width: 300 }}>
        <Title order={3} mb="md">Login</Title>
        <form onSubmit={handleSubmit}>
          <TextInput label="Username" value={username} onChange={(e) => setUsername(e.currentTarget.value)} required mb="sm" />
          <TextInput label="Password" type="password" value={password} onChange={(e) => setPassword(e.currentTarget.value)} required mb="sm" />
          <Button type="submit" fullWidth mt="md">Login</Button>
        </form>
      </Paper>
    </div>
  );
};
