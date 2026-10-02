import { useEffect, useState } from "react";
import { api } from "../api.js";

const STATUS_UA = {
  ready: "Готове",
  working: "В роботі",
  done: "На перевірці у батьків",
};

export default function ChildTasks() {
  const [tasks, setTasks] = useState([]);
  const [history, setHistory] = useState([]);
  const [mySuggestions, setMySuggestions] = useState([]);
  const [note, setNote] = useState({});
  const [suggest, setSuggest] = useState({ title: "", details: "" });
  const [error, setError] = useState("");

  const load = async () => {
    const [t, h, s] = await Promise.all([
      api("/api/tasks/mine/list"),
      api("/api/tasks/mine/history"),
      api("/api/tasks/suggest/mine"),
    ]);
    setTasks(t.tasks);
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

  const byStatus = (s) => tasks.filter((t) => t.status === s);

  return (
    <section>
      <h2>Мої завдання</h2>
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {tasks.length === 0 && <p>Поки немає завдань. Запропонуй своє нижче! 👇</p>}

      {byStatus("ready").map((t) => (
        <div key={t.id} style={card}>
          <b>{t.title}</b>
          {t.details && <div><small>{t.details}</small></div>}
          {t.deadline && <div><small>📅 до {t.deadline}</small></div>}
          <div><small>+{t.coins} монет, +{t.exp} EXP після перевірки</small></div>
          <button onClick={() => act(() => api(`/api/tasks/${t.id}/start`, { method: "POST" }))}>
            ▶ Почати
          </button>
        </div>
      ))}

      {byStatus("working").map((t) => (
        <div key={t.id} style={{ ...card, borderColor: "#f0ad4e" }}>
          <b>{t.title}</b> <small>— {STATUS_UA.working}</small>
          {t.details && <div><small>{t.details}</small></div>}
          <input
            placeholder="Нотатка для батьків (необов'язково)"
            value={note[t.id] || ""}
            onChange={(e) => setNote({ ...note, [t.id]: e.target.value })}
            style={{ width: "100%", marginTop: 6 }}
          />
          <button
            onClick={() =>
              act(() => api(`/api/tasks/${t.id}/finish`, { method: "POST", body: { note: note[t.id] || "" } }))
            }
          >
            ✅ Готово, на перевірку
          </button>
        </div>
      ))}

      {byStatus("done").map((t) => (
        <div key={t.id} style={{ ...card, borderColor: "#5bc0de", opacity: 0.85 }}>
          <b>{t.title}</b> <small>— {STATUS_UA.done} ⏳</small>
          {t.kid_note && <div><small>📝 {t.kid_note}</small></div>}
        </div>
      ))}

      <h3>Запропонувати завдання</h3>
      <form onSubmit={sendSuggest} style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 420 }}>
        <input
          placeholder="Що хочеш запропонувати?*"
          value={suggest.title}
          onChange={(e) => setSuggest({ ...suggest, title: e.target.value })}
          required
        />
        <input
          placeholder="Деталі"
          value={suggest.details}
          onChange={(e) => setSuggest({ ...suggest, details: e.target.value })}
        />
        <button type="submit" style={{ maxWidth: 200 }}>Надіслати батькам</button>
      </form>
      {mySuggestions.length > 0 && (
        <ul>
          {mySuggestions.map((s) => (
            <li key={s.id}>
              {s.title} —{" "}
              <small>
                {s.status === "pending" ? "⏳ чекає" : s.status === "accepted" ? "✅ прийнято" : "❌ відхилено"}
              </small>
            </li>
          ))}
        </ul>
      )}

      {history.length > 0 && (
        <>
          <h3>Історія</h3>
          <ul>
            {history.map((t) => (
              <li key={t.id}>
                ✅ {t.title} <small>(+{t.coins} монет, +{t.exp} EXP)</small>
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
