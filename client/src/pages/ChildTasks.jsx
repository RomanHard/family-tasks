import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useLang } from "../lang.jsx";

export default function ChildTasks() {
  const { t } = useLang();
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
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {tasks.length === 0 && <p>{t("noTasks")}</p>}

      {byStatus("ready").map((x) => (
        <div key={x.id} style={card}>
          <b>{x.title}</b>
          {x.details && <div><small>{x.details}</small></div>}
          {x.deadline && <div><small>📅 {x.deadline}</small></div>}
          <div><small>+{x.coins} {t("coins")}, +{x.exp} EXP</small></div>
          <button onClick={() => act(() => api(`/api/tasks/${x.id}/start`, { method: "POST" }))}>
            ▶ {t("start")}
          </button>
        </div>
      ))}

      {byStatus("working").map((x) => (
        <div key={x.id} style={{ ...card, borderColor: "#f0ad4e" }}>
          <b>{x.title}</b> <small>— {STATUS.working}</small>
          {x.details && <div><small>{x.details}</small></div>}
          <input
            placeholder={t("notePh")}
            value={note[x.id] || ""}
            onChange={(e) => setNote({ ...note, [x.id]: e.target.value })}
            style={{ width: "100%", marginTop: 6 }}
          />
          <button
            onClick={() =>
              act(() => api(`/api/tasks/${x.id}/finish`, { method: "POST", body: { note: note[x.id] || "" } }))
            }
          >
            ✅ {t("finish")}
          </button>
        </div>
      ))}

      {byStatus("done").map((x) => (
        <div key={x.id} style={{ ...card, borderColor: "#5bc0de", opacity: 0.85 }}>
          <b>{x.title}</b> <small>— {STATUS.done} ⏳</small>
          {x.kid_note && <div><small>📝 {x.kid_note}</small></div>}
        </div>
      ))}

      <h3>{t("suggestH")}</h3>
      <form onSubmit={sendSuggest} style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 420 }}>
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
        <button type="submit" style={{ maxWidth: 200 }}>{t("sendSuggestion")}</button>
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
                ✅ {x.title} <small>(+{x.coins} {t("coins")}, +{x.exp} EXP)</small>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

const card = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 12,
  marginBottom: 10,
  display: "flex",
  flexDirection: "column",
  gap: 6,
  alignItems: "flex-start",
};
