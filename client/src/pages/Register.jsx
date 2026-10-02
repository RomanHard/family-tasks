import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";

export default function Register() {
  const { registerParent } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await registerParent(email, password);
      navigate("/parent", { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main style={{ fontFamily: "system-ui", maxWidth: 360, margin: "40px auto", padding: 16 }}>
      <h1>Реєстрація батьків</h1>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input
          style={input}
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          style={input}
          placeholder="Пароль (мін. 6 символів)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p style={{ color: "crimson" }}>{error}</p>}
        <button style={button} type="submit">
          Створити акаунт
        </button>
      </form>
      <p>
        Вже є акаунт? <Link to="/login">Увійти</Link>
      </p>
    </main>
  );
}

const input = { padding: 10, borderRadius: 8, border: "1px solid #ccc", fontSize: 16 };
const button = { padding: 12, borderRadius: 8, border: "none", background: "#333", color: "#fff", fontSize: 16 };
