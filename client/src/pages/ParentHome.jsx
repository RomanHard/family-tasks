import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import { useLang } from "../lang.jsx";
import { LANGS } from "../i18n.js";
import ParentTasks from "./ParentTasks.jsx";
import GameSetup from "./GameSetup.jsx";
import NotifBell from "../components/NotifBell.jsx";

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
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <NotifBell />
          <button onClick={logout}>{t("logout")}</button>
        </div>
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
      <SubscriptionPanel />

      <hr style={{ margin: "24px 0" }} />
      <RewardsPanel />

      <hr style={{ margin: "24px 0" }} />
      <ParentTasks kids={kids} />

      <hr style={{ margin: "24px 0" }} />
      <GameSetup />
    </main>
  );
}

function SubscriptionPanel() {
  const { t } = useLang();
  const [plan, setPlan] = useState("free");

  useEffect(() => {
    api("/api/subscription/plan").then((r) => setPlan(r.plan)).catch(() => {});
  }, []);

  const toggle = async () => {
    const next = plan === "plus" ? "free" : "plus";
    try {
      const r = await api("/api/subscription/plan", { method: "PATCH", body: { plan: next } });
      setPlan(r.plan);
    } catch {
      /* stay on current plan */
    }
  };

  return (
    <section style={panelBox}>
      <h2 style={{ marginTop: 0 }}>{t("subscriptionTitle")}</h2>
      <p>
        {t("currentPlan")}: <b>{plan === "plus" ? t("planPlus") : t("planFree")}</b>
      </p>
      <button onClick={toggle}>{plan === "plus" ? t("switchToFree") : t("previewPlus")}</button>
      <p><small>{t("billingNote")}</small></p>
    </section>
  );
}

const panelBox = { border: "1px solid #ddd", borderRadius: 12, padding: 16, background: "#fafafa" };

function RewardsPanel() {
  const { t } = useLang();
  const [pending, setPending] = useState([]);
  const [history, setHistory] = useState([]);

  const load = async () => {
    const [p, h] = await Promise.all([
      api("/api/rewards/inbox"),
      api("/api/rewards/history"),
    ]);
    setPending(p.rewards);
    setHistory(h.rewards);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const decide = async (id, action) => {
    try {
      await api(`/api/rewards/${id}/${action}`, { method: "POST" });
      await load();
    } catch {
      /* offline */
    }
  };

  const st = (s) =>
    s === "approved" ? t("rwApproved") : s === "declined" ? t("rwDeclined") : t("rwPending");

  return (
    <section>
      <h2>🎁 {t("rewards")}</h2>
      {pending.length === 0 && <p><small>{t("noRewards")}</small></p>}
      {pending.map((r) => (
        <div key={r.id} style={rewardRow}>
          <div><b>{r.child_nickname}</b>: {r.text}</div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => decide(r.id, "approve")}>{t("approve")}</button>
            <button onClick={() => decide(r.id, "decline")}>{t("decline")}</button>
          </div>
        </div>
      ))}
      {history.length > 0 && (
        <>
          <h3>{t("history")}</h3>
          <ul>
            {history.map((r) => (
              <li key={r.id}>
                <b>{r.child_nickname}</b>: {r.text} — <small>{st(r.status)}</small>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

const rewardRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 8,
  padding: "8px 0",
  borderBottom: "1px solid #eee",
  flexWrap: "wrap",
};
