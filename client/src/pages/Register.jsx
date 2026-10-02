import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { useLang } from "../lang.jsx";

export default function Register() {
  const { registerParent } = useAuth();
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await registerParent(email, password, lang);
      navigate("/parent", { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main style={{ fontFamily: "system-ui", maxWidth: 360, margin: "40px auto", padding: 16 }}>
      <h1>{t("registerTitle")}</h1>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input
          style={input}
          placeholder={t("email")}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          style={input}
          placeholder={t("passwordHint")}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p style={{ color: "crimson" }}>{error}</p>}
        <button style={button} type="submit">
          {t("createAccount")}
        </button>
      </form>
      <p>
        {t("haveAccount")} <Link to="/login">{t("login")}</Link>
      </p>
    </main>
  );
}

const input = { padding: 10, borderRadius: 8, border: "1px solid #ccc", fontSize: 16 };
const button = { padding: 12, borderRadius: 8, border: "none", background: "#333", color: "#fff", fontSize: 16 };
