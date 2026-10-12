import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useLang } from "../lang.jsx";
import { catLabel } from "../i18n.js";

export default function ChildTasks() {
  const { t, lang } = useLang();
  const [tasks, setTasks] = useState([]);
  const [history, setHistory] = useState([]);
  const [mySuggestions, setMySuggestions] = useState([]);
  const [note, setNote] = useState({});
  const [suggest, setSuggest] = useState({ title: "", details: "" });
  const [error, setError] = useState("");

  const STATUS = { ready: t("stReady"), working: t("stWorking"), done: t("stDoneKid") };

  const load = async () => {
    const [tRes, h, s] = await Promise.all([
      api("/api/tasks/mine/list"),
      api("/api/tasks/mine/history"),
      api("/api/tasks/suggest/mine"),
    ]);
    setTasks(tRes.tasks);
    setHistory(h.tasks);
    setMySuggestions(s.suggestions);
  };

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  const act = async (fn) => {
    setError("");
    try {
      await fn();
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const sendSuggest = (e) => {
    e.preventDefault();
    act(() =>
      api("/api/tasks/suggest/new", { method: "POST", body: suggest }).then(() =>
        setSuggest({ title: "", details: "" })
      )
    );
  };

  const byStatus = (s) => tasks.filter((x) => x.status === s);
  const sgStatus = (s) => (s === "pending" ? t("sgPending") : s === "accepted" ? t("sgAccepted") : t("sgDeclined"));

  return (
    <section>
      <h2>{t("myTasks")}</h2>
      {error && <p style={{ color: "var(--danger)", fontWeight: 600 }}>{error}</p>}

      {tasks.length === 0 && <p>{t("noTasks")}</p>}

      {byStatus("ready").map((x) => (
        <div key={x.id} style={card}>
          <b>{x.title}</b> <small style={catBadge}>{catLabel(x.category, lang)}</small>
          {x.details && <div><small>{x.details}</small></div>}
          {x.deadline && <div><small>📅 {x.deadline}</small></div>}
          <div><small>+{x.coins} {t("coins")}, +{x.exp} EXP</small></div>
          <button onClick={() => act(() => api(`/api/tasks/${x.id}/start`, { method: "POST" }))} className="btn-primary">
            ▶ {t("start")}
          </button>
        </div>
      ))}

      {byStatus("working").map((x) => (
        <div key={x.id} style={{ ...card, borderColor: "var(--accent-2)", borderWidth: 2 }}>
          <b>{x.title}</b> <small style={catBadge}>{catLabel(x.category, lang)}</small> <small>— {STATUS.working}</small>
          {x.details && <div><small>{x.details}</small></div>}
          <input
            placeholder={t("notePh")}
            value={note[x.id] || ""}
            onChange={(e) => setNote({ ...note, [x.id]: e.target.value })}
            style={{ width: "100%", marginTop: 6 }}
          />
          <button
            className="btn-primary"
            onClick={() =>
              act(() => api(`/api/tasks/${x.id}/finish`, { method: "POST", body: { note: note[x.id] || "" } }))
            }
          >
            ✅ {t("finish")}
          </button>
        </div>
      ))}

      {byStatus("done").map((x) => (
        <div key={x.id} style={{ ...card, borderColor: "var(--accent)", opacity: 0.85 }}>
          <b>{x.title}</b> <small style={catBadge}>{catLabel(x.category, lang)}</small> <small>— {STATUS.done} ⏳</small>
          {x.kid_note && <div><small>📝 {x.kid_note}</small></div>}
        </div>
      ))}

      <h3>{t("suggestH")}</h3>
      <form onSubmit={sendSuggest} style={suggestForm}>
        <input
          placeholder={t("suggestPh")}
          value={suggest.title}
          onChange={(e) => setSuggest({ ...suggest, title: e.target.value })}
          required
        />
        <input
          placeholder={t("details")}
          value={suggest.details}
          onChange={(e) => setSuggest({ ...suggest, details: e.target.value })}
        />
        <button type="submit" className="btn-primary" style={{ alignSelf: "flex-start" }}>{t("sendSuggestion")}</button>
      </form>
      {mySuggestions.length > 0 && (
        <ul>
          {mySuggestions.map((s) => (
            <li key={s.id}>
              {s.title} — <small>{sgStatus(s.status)}</small>
            </li>
          ))}
        </ul>
      )}

      {history.length > 0 && (
        <>
          <h3>{t("history")}</h3>
          <ul>
            {history.map((x) => (
              <li key={x.id}>
                ✅ {x.title} <small style={catBadge}>{catLabel(x.category, lang)}</small>{" "}
                <small>(+{x.coins} {t("coins")}, +{x.exp} EXP)</small>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

const card = {
  border: "1px solid var(--border)",
  borderRadius: 16,
  padding: 14,
  marginBottom: 12,
  display: "flex",
  flexDirection: "column",
  gap: 7,
  alignItems: "stretch",
  background: "var(--surface)",
  boxShadow: "0 6px 18px rgba(23, 34, 56, 0.07)",
};
const suggestForm = {
  display: "flex",
  flexDirection: "column",
  gap: 9,
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: 14,
  boxShadow: "0 4px 14px rgba(23, 34, 56, 0.05)",
};
const catBadge = {
  background: "color-mix(in srgb, var(--accent-2) 26%, var(--surface))",
  color: "var(--text)",
  borderRadius: 999,
  padding: "2px 9px",
  fontWeight: 700,
  fontSize: 11,
  whiteSpace: "nowrap",
};
