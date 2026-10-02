import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import { useLang } from "../lang.jsx";
import { LANGS } from "../i18n.js";
import ParentTasks from "./ParentTasks.jsx";
import GameSetup from "./GameSetup.jsx";

export default function ParentHome() {
  const { user, logout, refresh } = useAuth();
  const { t, lang } = useLang();
  const [kids, setKids] = useState([]);
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    const { children } = await api("/api/children");
    setKids(children);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const addChild = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api("/api/children", { method: "POST", body: { nickname, password } });
      setNickname("");
      setPassword("");
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const setMyLang = async (l) => {
    await api("/api/auth/language", { method: "PATCH", body: { language: l } });
    await refresh();
  };

  const setKidLang = async (id, l) => {
    await api(`/api/children/${id}/language`, { method: "PATCH", body: { language: l } });
    await load();
  };

  return (
    <main style={{ fontFamily: "system-ui", maxWidth: 560, margin: "24px auto", padding: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>{t("parentTitle")}</h1>
        <button onClick={logout}>{t("logout")}</button>
      </header>
      <p>{user?.email}</p>
      <p>
        <label>
          {t("language")}:{" "}
          <select value={lang} onChange={(e) => setMyLang(e.target.value)}>
            {LANGS.map((l) => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </select>
        </label>
      </p>

      <h2>{t("kidsTitle")}</h2>
      {kids.length === 0 && <p>{t("noKids")}</p>}
      <ul>
        {kids.map((k) => (
          <li key={k.id}>
            {k.nickname}{" "}
            <select
              value={k.language || "uk"}
              onChange={(e) => setKidLang(k.id, e.target.value)}
              title={t("language")}
            >
              {LANGS.map((l) => (
                <option key={l.id} value={l.id}>{l.label}</option>
              ))}
            </select>
          </li>
        ))}
      </ul>

      <h3>{t("addChild")}</h3>
      <form onSubmit={addChild} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          placeholder={t("nickname")}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
        />
        <input
          placeholder={t("password")}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{t("add")}</button>
      </form>
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <hr style={{ margin: "24px 0" }} />
      <ParentTasks kids={kids} />

      <hr style={{ margin: "24px 0" }} />
      <GameSetup />
    </main>
  );
}
