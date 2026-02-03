import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [employeeNumber, setEmployeeNumber] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    /**
     * Backend:
     * - prüft Credentials
     * - erstellt JWT
     */
    const res = await fetch("/backend/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeNumber, password }),
    });

    const data = await res.json();
    login(data.token);
    navigate("/");
  };

  return (
    <div>
      <h1>Login</h1>
      <input value={employeeNumber} onChange={(e) => setEmployeeNumber(e.target.value)} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={submit}>Login</button>
    </div>
  );
};
