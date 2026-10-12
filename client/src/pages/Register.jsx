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
    <main className="auth-card" style={{ maxWidth: 400, width: "calc(100% - 24px)", margin: "44px auto", padding: "26px 24px" }}>
      <h1 style={{ textAlign: "center" }}>{t("registerTitle")}</h1>
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
        {error && <p style={{ color: "var(--danger)", fontWeight: 600, margin: 0 }}>{error}</p>}
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

const input = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1.5px solid var(--border)",
  background: "var(--surface)",
  fontSize: 16,
  width: "100%",
};
const button = {
  padding: "13px 16px",
  borderRadius: 12,
  border: "none",
  background: "var(--accent)",
  color: "var(--on-accent)",
  fontSize: 16,
  fontWeight: 700,
  boxShadow: "0 8px 18px color-mix(in srgb, var(--accent) 28%, transparent)",
};
