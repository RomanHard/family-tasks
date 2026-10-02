import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useLang } from "../lang.jsx";

const STATUS_KEY = {
  ready: "stReady",
  working: "stWorking",
  done: "stDone",
  approved: "stApproved",
  paused: "stPaused",
};

export default function ParentTasks({ kids }) {
  const { t } = useLang();
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
    if (!window.confirm(t("confirmDelete", { title }))) return;
    act(() => api(`/api/tasks/${id}`, { method: "DELETE" }));
  };

  const acceptSuggestion = (id) => {
    const coins = window.prompt(t("coins"), "5");
    if (coins === null) return;
    const exp = window.prompt("EXP", "10");
    if (exp === null) return;
    act(() =>
      api(`/api/tasks/suggestions/${id}/accept`, { method: "POST", body: { coins, exp } })
    );
  };

  const awaiting = tasks.filter((t) => t.status === "done");
  const active = tasks.filter((t) => ["ready", "working", "paused"].includes(t.status));

  return (
    <section>
      <h2>{t("tasks")}</h2>
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {suggestions.length > 0 && (
        <div style={box}>
          <h3>{t("suggestions")} ({suggestions.length})</h3>
          {suggestions.map((s) => (
            <div key={s.id} style={row}>
              <div>
                <b>{s.title}</b> <small>— {s.child_nickname}</small>
                {s.details && <div><small>{s.details}</small></div>}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => acceptSuggestion(s.id)}>{t("accept")}</button>
                <button onClick={() => act(() => api(`/api/tasks/suggestions/${s.id}/decline`, { method: "POST" }))}>
                  {t("decline")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {awaiting.length > 0 && (
        <div style={box}>
          <h3>{t("awaiting")} ({awaiting.length})</h3>
          {awaiting.map((t) => (
            <div key={t.id} style={row}>
              <div>
                <b>{t.title}</b> <small>— {t.child_nickname || t("allKids")}</small>
                {t.kid_note && <div><small>📝 {t.kid_note}</small></div>}
                <div><small>+{t.coins} {t("coins")}, +{t.exp} EXP</small></div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => act(() => api(`/api/tasks/${t.id}/approve`, { method: "POST" }))}>
                  ✅ {t("approve")}
                </button>
                <button onClick={() => act(() => api(`/api/tasks/${t.id}/reject`, { method: "POST" }))}>
                  ↩ {t("sendBack")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h3>{t("active")}</h3>
      {active.length === 0 && <p>{t("noActive")}</p>}
      {active.map((t) =>
        editing === t.id ? (
          <EditForm key={t.id} task={t} kids={kids} onSave={(d) => saveEdit(t.id, d)} onCancel={() => setEditing(null)} />
        ) : (
          <div key={t.id} style={row}>
            <div>
              <b>{t.title}</b>{" "}
              <small style={badge}>{t(STATUS_KEY[t.status])}</small>{" "}
              <small>— {t.child_nickname || t("allKids")}</small>
              {t.deadline && <span> <small>📅 {t.deadline}</small></span>}
              {t.details && <div><small>{t.details}</small></div>}
              <div><small>+{t.coins} {t("coins")}, +{t.exp} EXP</small></div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button onClick={() => setEditing(t.id)}>{t("edit")}</button>
              {t.status === "paused" ? (
                <button onClick={() => act(() => api(`/api/tasks/${t.id}/resume`, { method: "POST" }))}>▶ {t("resume")}</button>
              ) : (
                <button onClick={() => act(() => api(`/api/tasks/${t.id}/pause`, { method: "POST" }))}>⏸ {t("pause")}</button>
              )}
              <button onClick={() => remove(t.id, t.title)}>🗑 {t("delete")}</button>
            </div>
          </div>
        )
      )}

      <h3>{t("newTask")}</h3>
      <form onSubmit={create} style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 420 }}>
        <input placeholder={t("titleReq")} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <input placeholder={t("details")} value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <label>{t("coins")} <input type="number" min="0" value={form.coins} onChange={(e) => setForm({ ...form, coins: e.target.value })} style={{ width: 70 }} /></label>
          <label>EXP <input type="number" min="0" value={form.exp} onChange={(e) => setForm({ ...form, exp: e.target.value })} style={{ width: 70 }} /></label>
          <select value={form.child_id} onChange={(e) => setForm({ ...form, child_id: e.target.value })}>
            <option value="">{t("allKids")}</option>
            {kids.map((k) => (
              <option key={k.id} value={k.id}>{k.nickname}</option>
            ))}
          </select>
          <label>{t("deadline")} <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></label>
        </div>
        <button type="submit" style={{ maxWidth: 200 }}>{t("addTask")}</button>
      </form>
    </section>
  );
}

function EditForm({ task, kids, onSave, onCancel }) {
  const { t } = useLang();
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
        <input value={f.details} onChange={(e) => setF({ ...f, details: e.target.value })} placeholder={t("details")} />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <label>{t("coins")} <input type="number" min="0" value={f.coins} onChange={(e) => setF({ ...f, coins: e.target.value })} style={{ width: 70 }} /></label>
          <label>EXP <input type="number" min="0" value={f.exp} onChange={(e) => setF({ ...f, exp: e.target.value })} style={{ width: 70 }} /></label>
          <select value={f.child_id} onChange={(e) => setF({ ...f, child_id: e.target.value })}>
            <option value="">{t("allKids")}</option>
            {kids.map((k) => (
              <option key={k.id} value={k.id}>{k.nickname}</option>
            ))}
          </select>
          <label>{t("deadline")} <input type="date" value={f.deadline} onChange={(e) => setF({ ...f, deadline: e.target.value })} /></label>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button type="submit">{t("save")}</button>
        <button type="button" onClick={onCancel}>{t("cancel")}</button>
      </div>
    </form>
  );
}

const box = { border: "1px solid #ddd", borderRadius: 8, padding: 12, marginBottom: 16, background: "#fafafa" };
const row = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid #eee", flexWrap: "wrap" };
const badge = { background: "#eee", borderRadius: 4, padding: "2px 6px" };
