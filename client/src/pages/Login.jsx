import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";

export default function Login() {
  const { loginParent, loginChild } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("parent"); // parent | child
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (mode === "parent") {
        await loginParent(email, password);
        navigate("/parent", { replace: true });
      } else {
        await loginChild(nickname, password);
        navigate("/kid", { replace: true });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main style={styles.page}>
      <h1>Family Tasks</h1>
      <div style={styles.tabs}>
        <button
          style={mode === "parent" ? styles.tabActive : styles.tab}
          onClick={() => setMode("parent")}
        >
          Батьки
        </button>
        <button
          style={mode === "child" ? styles.tabActive : styles.tab}
          onClick={() => setMode("child")}
        >
          Діти
        </button>
      </div>
      <form onSubmit={submit} style={styles.form}>
        {mode === "parent" ? (
          <input
            style={styles.input}
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        ) : (
          <input
            style={styles.input}
            placeholder="Нікнейм"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
          />
        )}
        <input
          style={styles.input}
          placeholder="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p style={styles.error}>{error}</p>}
        <button style={styles.button} type="submit">
          Увійти
        </button>
      </form>
      {mode === "parent" && (
        <p>
          Немає акаунту? <Link to="/register">Зареєструватися</Link>
        </p>
      )}
    </main>
  );
}

const styles = {
  page: { fontFamily: "system-ui", maxWidth: 360, margin: "40px auto", padding: 16 },
  tabs: { display: "flex", gap: 8, marginBottom: 16 },
  tab: { flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ccc", background: "#fff" },
  tabActive: { flex: 1, padding: 10, borderRadius: 8, border: "1px solid #333", background: "#eee", fontWeight: "bold" },
  form: { display: "flex", flexDirection: "column", gap: 10 },
  input: { padding: 10, borderRadius: 8, border: "1px solid #ccc", fontSize: 16 },
  button: { padding: 12, borderRadius: 8, border: "none", background: "#333", color: "#fff", fontSize: 16 },
  error: { color: "crimson" },
};
