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
  const [showKidReset, setShowKidReset] = useState(false);
  const [kidResetNick, setKidResetNick] = useState("");
  const [kidResetMsg, setKidResetMsg] = useState("");

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

  const sendKidReset = async (e) => {
    e.preventDefault();
    try {
      await api("/api/auth/child-password-request", { method: "POST", body: { nickname: kidResetNick } });
    } catch {
      /* same message either way — no nickname enumeration */
    }
    setKidResetMsg(t("kidResetSent"));
    setKidResetNick("");
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
    <main className="auth-card" style={styles.page}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <select value={lang} onChange={(e) => setLang(e.target.value)} aria-label={t("language")} style={{ padding: "7px 10px", fontSize: 14 }}>
          {LANGS.map((l) => (
            <option key={l.id} value={l.id}>{l.label}</option>
          ))}
        </select>
      </div>
      <h1 style={{ textAlign: "center" }}>Family Tasks</h1>
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
              {resetMsg && <p style={{ color: "var(--success)" }}><small>{resetMsg}</small></p>}
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
      {mode === "child" && (
        <>
          {!showKidReset ? (
            <p>
              <button type="button" onClick={() => setShowKidReset(true)} style={styles.link}>
                {t("forgotPw")}
              </button>
            </p>
          ) : (
            <form onSubmit={sendKidReset} style={styles.form}>
              <input
                style={styles.input}
                placeholder={t("nickname")}
                value={kidResetNick}
                onChange={(e) => setKidResetNick(e.target.value)}
                required
              />
              <p><small>{t("kidResetHint")}</small></p>
              {kidResetMsg && <p style={{ color: "var(--success)" }}><small>{kidResetMsg}</small></p>}
              <div style={{ display: "flex", gap: 8 }}>
                <button style={styles.button} type="submit">{t("send")}</button>
                <button type="button" onClick={() => { setShowKidReset(false); setKidResetMsg(""); }}>
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
  page: { maxWidth: 400, width: "calc(100% - 24px)", margin: "44px auto", padding: "26px 24px" },
  tabs: {
    display: "flex",
    gap: 5,
    marginBottom: 18,
    background: "var(--surface-2)",
    padding: 5,
    borderRadius: 999,
  },
  tab: {
    flex: 1,
    padding: 10,
    borderRadius: 999,
    border: "1px solid transparent",
    background: "transparent",
    color: "var(--dim)",
    fontWeight: 700,
  },
  tabActive: {
    flex: 1,
    padding: 10,
    borderRadius: 999,
    border: "1px solid transparent",
    background: "var(--surface)",
    color: "var(--text)",
    fontWeight: 800,
    boxShadow: "0 4px 12px rgba(23, 34, 56, 0.12)",
  },
  form: { display: "flex", flexDirection: "column", gap: 11 },
  input: {
    padding: "12px 14px",
    borderRadius: 12,
    border: "1.5px solid var(--border)",
    background: "var(--surface)",
    fontSize: 16,
    width: "100%",
  },
  button: {
    padding: "13px 16px",
    borderRadius: 12,
    border: "none",
    background: "var(--accent)",
    color: "var(--on-accent)",
    fontSize: 16,
    fontWeight: 700,
    boxShadow: "0 8px 18px color-mix(in srgb, var(--accent) 28%, transparent)",
  },
  error: {
    color: "var(--danger)",
    background: "color-mix(in srgb, var(--danger) 10%, var(--surface))",
    borderRadius: 10,
    padding: "9px 12px",
    margin: 0,
    fontSize: 14,
    fontWeight: 600,
  },
  link: { background: "none", border: "none", padding: 0, color: "var(--accent)", textDecoration: "underline", cursor: "pointer", fontSize: 14, fontWeight: 600 },
};
