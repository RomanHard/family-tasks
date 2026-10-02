import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import { useLang } from "../lang.jsx";
import { LANGS } from "../i18n.js";
import ParentTasks from "./ParentTasks.jsx";
import GameSetup from "./GameSetup.jsx";
import NotifBell from "../components/NotifBell.jsx";
import Tour from "../components/Tour.jsx";

const PARENT_TOUR_KEY = "ft_parent_tour_done";
const PARENT_THEMES = ["bright", "warm", "ocean", "night"];
const KID_THEMES = ["sky", "mint", "coral", "sunshine"];

export default function ParentHome() {
  const { user, logout, refresh } = useAuth();
  const { t, lang } = useLang();
  const [kids, setKids] = useState([]);
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [ptour, setPtour] = useState(false);
  const [kidTourPreview, setKidTourPreview] = useState(false);

  const load = async () => {
    const { children } = await api("/api/children");
    setKids(children);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  // Parent tour auto-launches on first login; completion is persisted.
  useEffect(() => {
    let done = false;
    try {
      done = !!localStorage.getItem(PARENT_TOUR_KEY);
    } catch {
      /* private mode */
    }
    if (!done) setPtour(true);
  }, []);

  const finishPTour = () => {
    try {
      localStorage.setItem(PARENT_TOUR_KEY, "1");
    } catch {
      /* private mode */
    }
    setPtour(false);
  };

  // 6 steps when the family has children, 5 when not.
  const ptourSteps =
    kids.length > 0
      ? [1, 2, 3, 4, 5, 6].map((n) => ({ title: t(`ptourK${n}t`), body: t(`ptourK${n}b`) }))
      : [1, 2, 3, 4, 5].map((n) => ({ title: t(`ptourN${n}t`), body: t(`ptourN${n}b`) }));

  const kidTourSteps = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({
    title: t(`kidTour${n}t`),
    body: t(`kidTour${n}b`),
  }));

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

  const setKidTheme = async (id, theme) => {
    await api(`/api/children/${id}/theme`, { method: "PATCH", body: { theme } });
    await load();
  };

  const setMyTheme = async (theme) => {
    await api("/api/auth/theme", { method: "PATCH", body: { theme } });
    await refresh();
  };

  const changeKidPassword = async (kid) => {
    const pw = window.prompt(t("newPwPrompt", { nick: kid.nickname }));
    if (pw === null) return;
    setError("");
    try {
      await api(`/api/children/${kid.id}/password`, { method: "POST", body: { password: pw } });
      window.alert(t("pwChanged"));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main data-theme={user?.theme || "bright"} style={{ fontFamily: "system-ui", maxWidth: 560, margin: "24px auto", padding: 16 }}>
      {ptour && (
        <Tour
          steps={ptourSteps}
          stepOf={(n, m) => t("ptourStepOf", { n, m })}
          ariaLabel={(n, m) => t("ptourAria", { n, m })}
          skipLabel={t("tourSkip")}
          backLabel={t("tourBack")}
          nextLabel={t("tourNext")}
          startLabel={t("ptourStart")}
          transitionLabel={t("tourTransition")}
          onDone={finishPTour}
        />
      )}
      {kidTourPreview && (
        <Tour
          steps={kidTourSteps}
          stepOf={(n) => t("tourStepOf", { n })}
          ariaLabel={(n) => t("tourAriaKid", { n })}
          skipLabel={t("tourSkip")}
          backLabel={t("tourBack")}
          nextLabel={t("tourNext")}
          startLabel={t("tourStartKid")}
          transitionLabel={t("tourTransition")}
          onDone={() => setKidTourPreview(false)}
        />
      )}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>{t("parentTitle")}</h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <NotifBell />
          <button onClick={logout}>{t("logout")}</button>
        </div>
      </header>
      <p>
        <button onClick={() => setPtour(true)} style={tourBtn}>🧭 {t("ptourShow")}</button>{" "}
        <button onClick={() => setKidTourPreview(true)} style={tourBtn}>👧 {t("tourShowKid")}</button>
      </p>
      <p>{user?.email}</p>
      <p>
        <label>
          {t("themeLabel")}:{" "}
          <select value={user?.theme || "bright"} onChange={(e) => setMyTheme(e.target.value)}>
            {PARENT_THEMES.map((th) => (
              <option key={th} value={th}>{t(`theme${th[0].toUpperCase()}${th.slice(1)}`)}</option>
            ))}
          </select>
        </label>
        <br />
        <small>{t("themeHint")}</small>
      </p>
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
            </select>{" "}
            <select
              value={k.theme || "sky"}
              onChange={(e) => setKidTheme(k.id, e.target.value)}
              title={t("kidThemeLabel")}
            >
              {KID_THEMES.map((th) => (
                <option key={th} value={th}>{th[0].toUpperCase() + th.slice(1)}</option>
              ))}
            </select>{" "}
            <button onClick={() => changeKidPassword(k)} title={t("changePw")}>
              🔑 {t("changePw")}
            </button>
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
        <span style={planBadge}>{plan === "plus" ? "PLUS PREVIEW" : t("freeBadge")}</span>
      </p>
      <p>{t("currentPlan")}</p>
      <ul>
        <li>{t("planFreeBullet")}</li>
        <li>{t("planPlusBullet")}</li>
      </ul>
      <button onClick={toggle}>{plan === "plus" ? t("stayFree") : t("previewPlusBtn")}</button>
      <p><small>{t("previewNote")}</small></p>
    </section>
  );
}

const planBadge = {
  display: "inline-block",
  fontSize: 11,
  fontWeight: "bold",
  letterSpacing: 1,
  padding: "4px 10px",
  borderRadius: 999,
  border: "1px solid #cbd7e6",
  background: "#eaf0f8",
};

const panelBox = { border: "1px solid #ddd", borderRadius: 12, padding: 16, background: "#fafafa" };
const tourBtn = { padding: "6px 10px", borderRadius: 8, border: "1px solid #ccc", background: "#fff", cursor: "pointer" };

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
      let body;
      if (action === "approve") {
        const raw = window.prompt(t("setCoinPrice"), "20");
        if (raw === null) return; // cancelled — keep pending
        body = { coins: Math.max(0, parseInt(raw) || 0) };
      }
      await api(`/api/rewards/${id}/${action}`, { method: "POST", body });
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
            <button onClick={() => decide(r.id, "approve")}>{t("setCoinPrice")}</button>
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
                <b>{r.child_nickname}</b>: {r.text}
                {r.status === "approved" && r.coins > 0 && <> — {r.coins} {t("coins")}</>} — <small>{st(r.status)}</small>
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
