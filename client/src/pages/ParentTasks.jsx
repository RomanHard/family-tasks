import { useEffect, useState } from "react";
import { api } from "../api.js";

const STATUS_UA = {
  ready: "Готове",
  working: "В роботі",
  done: "На перевірці",
  approved: "Схвалено",
  paused: "На паузі",
};

export default function ParentTasks({ kids }) {
  const [tasks, setTasks] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [form, setForm] = useState({ title: "", details: "", coins: "5", exp: "10", child_id: "", deadline: "" });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    const [{ tasks }, { suggestions }] = await Promise.all([
      api("/api/tasks"),
      api("/api/tasks/suggestions/inbox"),
    ]);
    setTasks(tasks);
    setSuggestions(suggestions);
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

  const create = (e) => {
    e.preventDefault();
    act(() =>
      api("/api/tasks", {
        method: "POST",
        body: {
          title: form.title,
          details: form.details,
          coins: form.coins,
          exp: form.exp,
          child_id: form.child_id || null,
          deadline: form.deadline,
        },
      }).then(() => setForm({ title: "", details: "", coins: "5", exp: "10", child_id: "", deadline: "" }))
    );
  };

  const saveEdit = (id, data) =>
    act(() => api(`/api/tasks/${id}`, { method: "PATCH", body: data }).then(() => setEditing(null)));

  const remove = (id, title) => {
    if (!window.confirm(`Видалити завдання «${title}»? Історія збережеться.`)) return;
    act(() => api(`/api/tasks/${id}`, { method: "DELETE" }));
  };

  const acceptSuggestion = (id) => {
    const coins = window.prompt("Монет за завдання:", "5");
    if (coins === null) return;
    const exp = window.prompt("EXP за завдання:", "10");
    if (exp === null) return;
    act(() =>
      api(`/api/tasks/suggestions/${id}/accept`, { method: "POST", body: { coins, exp } })
    );
  };

  const awaiting = tasks.filter((t) => t.status === "done");
  const active = tasks.filter((t) => ["ready", "working", "paused"].includes(t.status));

  return (
    <section>
      <h2>Завдання</h2>
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {suggestions.length > 0 && (
        <div style={box}>
          <h3>Пропозиції від дітей ({suggestions.length})</h3>
          {suggestions.map((s) => (
            <div key={s.id} style={row}>
              <div>
                <b>{s.title}</b> <small>— {s.child_nickname}</small>
                {s.details && <div><small>{s.details}</small></div>}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => acceptSuggestion(s.id)}>Прийняти</button>
                <button onClick={() => act(() => api(`/api/tasks/suggestions/${s.id}/decline`, { method: "POST" }))}>
                  Відхилити
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {awaiting.length > 0 && (
        <div style={box}>
          <h3>Чекають перевірки ({awaiting.length})</h3>
          {awaiting.map((t) => (
            <div key={t.id} style={row}>
              <div>
                <b>{t.title}</b> <small>— {t.child_nickname || "всім"}</small>
                {t.kid_note && <div><small>📝 {t.kid_note}</small></div>}
                <div><small>+{t.coins} монет, +{t.exp} EXP</small></div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => act(() => api(`/api/tasks/${t.id}/approve`, { method: "POST" }))}>
                  ✅ Схвалити
                </button>
                <button onClick={() => act(() => api(`/api/tasks/${t.id}/reject`, { method: "POST" }))}>
                  ↩ Повернути
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h3>Активні</h3>
      {active.length === 0 && <p>Немає активних завдань.</p>}
      {active.map((t) =>
        editing === t.id ? (
          <EditForm key={t.id} task={t} kids={kids} onSave={(d) => saveEdit(t.id, d)} onCancel={() => setEditing(null)} />
        ) : (
          <div key={t.id} style={row}>
            <div>
              <b>{t.title}</b>{" "}
              <small style={badge}>{STATUS_UA[t.status]}</small>{" "}
              <small>— {t.child_nickname || "всім"}</small>
              {t.deadline && <span> <small>📅 до {t.deadline}</small></span>}
              {t.details && <div><small>{t.details}</small></div>}
              <div><small>+{t.coins} монет, +{t.exp} EXP</small></div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button onClick={() => setEditing(t.id)}>Редагувати</button>
              {t.status === "paused" ? (
                <button onClick={() => act(() => api(`/api/tasks/${t.id}/resume`, { method: "POST" }))}>▶ Продовжити</button>
              ) : (
                <button onClick={() => act(() => api(`/api/tasks/${t.id}/pause`, { method: "POST" }))}>⏸ Пауза</button>
              )}
              <button onClick={() => remove(t.id, t.title)}>🗑 Видалити</button>
            </div>
          </div>
        )
      )}

      <h3>Нове завдання</h3>
      <form onSubmit={create} style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 420 }}>
        <input placeholder="Назва*" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <input placeholder="Деталі" value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} />
        <div style={{ display: "flex", gap: 8 }}>
          <label>Монети <input type="number" min="0" value={form.coins} onChange={(e) => setForm({ ...form, coins: e.target.value })} style={{ width: 70 }} /></label>
          <label>EXP <input type="number" min="0" value={form.exp} onChange={(e) => setForm({ ...form, exp: e.target.value })} style={{ width: 70 }} /></label>
          <select value={form.child_id} onChange={(e) => setForm({ ...form, child_id: e.target.value })}>
            <option value="">Всім дітям</option>
            {kids.map((k) => (
              <option key={k.id} value={k.id}>{k.nickname}</option>
            ))}
          </select>
          <label>Дедлайн <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></label>
        </div>
        <button type="submit" style={{ maxWidth: 200 }}>Додати завдання</button>
      </form>
    </section>
  );
}

function EditForm({ task, kids, onSave, onCancel }) {
  const [f, setF] = useState({
    title: task.title,
    details: task.details,
    coins: task.coins,
    exp: task.exp,
    child_id: task.child_id || "",
    deadline: task.deadline || "",
  });
  return (
    <form
      style={row}
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ ...f, child_id: f.child_id || null });
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        <input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} required />
        <input value={f.details} onChange={(e) => setF({ ...f, details: e.target.value })} placeholder="Деталі" />
        <div style={{ display: "flex", gap: 8 }}>
          <label>Монети <input type="number" min="0" value={f.coins} onChange={(e) => setF({ ...f, coins: e.target.value })} style={{ width: 70 }} /></label>
          <label>EXP <input type="number" min="0" value={f.exp} onChange={(e) => setF({ ...f, exp: e.target.value })} style={{ width: 70 }} /></label>
          <select value={f.child_id} onChange={(e) => setF({ ...f, child_id: e.target.value })}>
            <option value="">Всім дітям</option>
            {kids.map((k) => (
              <option key={k.id} value={k.id}>{k.nickname}</option>
            ))}
          </select>
          <label>Дедлайн <input type="date" value={f.deadline} onChange={(e) => setF({ ...f, deadline: e.target.value })} /></label>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button type="submit">Зберегти</button>
        <button type="button" onClick={onCancel}>Скасувати</button>
      </div>
    </form>
  );
}

const box = { border: "1px solid #ddd", borderRadius: 8, padding: 12, marginBottom: 16, background: "#fafafa" };
const row = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid #eee", flexWrap: "wrap" };
const badge = { background: "#eee", borderRadius: 4, padding: "2px 6px" };
