import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { useLang } from "../lang.jsx";
import { LANGS } from "../i18n.js";
import { api } from "../api.js";

export default function Login() {
  const { loginParent, loginChild } = useAuth();
  const { t, lang, setLang } = useLang();
  const navigate = useNavigate();
  const [mode, setMode] = useState("parent"); // parent | child
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMsg, setResetMsg] = useState("");

  const sendReset = async (e) => {
    e.preventDefault();
    try {
      await api("/api/auth/password-reset-request", { method: "POST", body: { email: resetEmail } });
    } catch {
      /* same message either way — no email enumeration */
    }
    setResetMsg(t("resetSent"));
    setResetEmail("");
  };

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
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <select value={lang} onChange={(e) => setLang(e.target.value)} aria-label={t("language")}>
          {LANGS.map((l) => (
            <option key={l.id} value={l.id}>{l.label}</option>
          ))}
        </select>
      </div>
      <h1>Family Tasks</h1>
      <div style={styles.tabs}>
        <button
          style={mode === "parent" ? styles.tabActive : styles.tab}
          onClick={() => setMode("parent")}
        >
          {t("parents")}
        </button>
        <button
          style={mode === "child" ? styles.tabActive : styles.tab}
          onClick={() => setMode("child")}
        >
          {t("kids")}
        </button>
      </div>
      <form onSubmit={submit} style={styles.form}>
        {mode === "parent" ? (
          <input
            style={styles.input}
            placeholder={t("email")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        ) : (
          <input
            style={styles.input}
            placeholder={t("nickname")}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
          />
        )}
        <input
          style={styles.input}
          placeholder={t("password")}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p style={styles.error}>{error}</p>}
        <button style={styles.button} type="submit">
          {t("login")}
        </button>
      </form>
      {mode === "parent" && (
        <>
          <p>
            {t("noAccount")} <Link to="/register">{t("register")}</Link>
          </p>
          {!showReset ? (
            <p>
              <button type="button" onClick={() => setShowReset(true)} style={styles.link}>
                {t("forgotPw")}
              </button>
            </p>
          ) : (
            <form onSubmit={sendReset} style={styles.form}>
              <input
                style={styles.input}
                placeholder={t("email")}
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
              <p><small>{t("resetHint")}</small></p>
              {resetMsg && <p style={{ color: "green" }}><small>{resetMsg}</small></p>}
              <div style={{ display: "flex", gap: 8 }}>
                <button style={styles.button} type="submit">{t("send")}</button>
                <button type="button" onClick={() => { setShowReset(false); setResetMsg(""); }}>
                  {t("cancel")}
                </button>
              </div>
            </form>
          )}
        </>
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
  link: { background: "none", border: "none", padding: 0, color: "#1565c0", textDecoration: "underline", cursor: "pointer", fontSize: 14 },
};
