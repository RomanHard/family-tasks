import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useLang } from "../lang.jsx";
import { TASK_CATEGORIES, DIFF_EXP, catLabel } from "../i18n.js";

const STATUS_KEY = {
  ready: "stReady",
  working: "stWorking",
  done: "stDone",
  approved: "stApproved",
  paused: "stPaused",
};

export default function ParentTasks({ kids }) {
  const { t, lang } = useLang();
  const [tasks, setTasks] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [form, setForm] = useState({ title: "", details: "", coins: "5", exp: "10", child_id: "", deadline: "", category: "other", difficulty: "1" });
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
          category: form.category,
          difficulty: parseInt(form.difficulty) || 1,
        },
      }).then(() => setForm({ title: "", details: "", coins: "5", exp: "10", child_id: "", deadline: "", category: "other", difficulty: "1" }))
    );
  };

  // picking a difficulty presets EXP (still editable manually afterwards)
  const setDifficulty = (d) => {
    setForm({ ...form, difficulty: d, exp: String(DIFF_EXP[d] || 10) });
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

  const awaiting = tasks.filter((x) => x.status === "done");
  const active = tasks.filter((x) => ["ready", "working", "paused"].includes(x.status));

  return (
    <section>
      <h2>{t("tasks")}</h2>
      {error && <p style={{ color: "var(--danger)", fontWeight: 600 }}>{error}</p>}

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
                <button onClick={() => acceptSuggestion(s.id)} className="btn-primary btn-sm">{t("accept")}</button>
                <button onClick={() => act(() => api(`/api/tasks/suggestions/${s.id}/decline`, { method: "POST" }))} className="btn-sm">
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
          {awaiting.map((task) => (
            <div key={task.id} style={row}>
              <div>
                <b>{task.title}</b> <small style={catBadge}>{catLabel(task.category, lang)}</small>{" "}
                <small>— {task.child_nickname || t("allKids")}</small>
                {task.kid_note && <div><small>📝 {task.kid_note}</small></div>}
                <div><small>+{task.coins} {t("coins")}, +{task.exp} EXP</small></div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => act(() => api(`/api/tasks/${task.id}/approve`, { method: "POST" }))} className="btn-primary btn-sm">
                  ✅ {t("approve")}
                </button>
                <button onClick={() => act(() => api(`/api/tasks/${task.id}/reject`, { method: "POST" }))} className="btn-sm">
                  ↩ {t("sendBack")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h3>{t("active")}</h3>
      {active.length === 0 && <p>{t("noActive")}</p>}
      {active.map((task) =>
        editing === task.id ? (
          <EditForm key={task.id} task={task} kids={kids} onSave={(d) => saveEdit(task.id, d)} onCancel={() => setEditing(null)} />
        ) : (
          <div key={task.id} style={row}>
            <div>
              <b>{task.title}</b> <small style={catBadge}>{catLabel(task.category, lang)}</small>{" "}
              <small style={badge}>{t(STATUS_KEY[task.status])}</small>{" "}
              <small>— {task.child_nickname || t("allKids")}</small>
              {task.deadline && <span> <small>📅 {task.deadline}</small></span>}
              {task.details && <div><small>{task.details}</small></div>}
              <div><small>+{task.coins} {t("coins")}, +{task.exp} EXP</small></div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button onClick={() => setEditing(task.id)} className="btn-sm">{t("edit")}</button>
              {task.status === "paused" ? (
                <button onClick={() => act(() => api(`/api/tasks/${task.id}/resume`, { method: "POST" }))} className="btn-sm">▶ {t("resume")}</button>
              ) : (
                <button onClick={() => act(() => api(`/api/tasks/${task.id}/pause`, { method: "POST" }))} className="btn-sm">⏸ {t("pause")}</button>
              )}
              <button onClick={() => remove(task.id, task.title)} className="btn-sm">🗑 {t("delete")}</button>
            </div>
          </div>
        )
      )}

      <h3>{t("newTask")}</h3>
      <form onSubmit={create} style={formCard}>
        <input placeholder={t("titleReq")} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <input placeholder={t("details")} value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <label style={fieldCol}>{t("coins")} <input type="number" min="0" value={form.coins} onChange={(e) => setForm({ ...form, coins: e.target.value })} style={{ width: 76 }} /></label>
          <label style={fieldCol}>EXP <input type="number" min="0" value={form.exp} onChange={(e) => setForm({ ...form, exp: e.target.value })} style={{ width: 76 }} /></label>
          <label style={fieldCol}>{t("category")}{" "}
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {TASK_CATEGORIES.map((c) => (
                <option key={c} value={c}>{catLabel(c, lang)}</option>
              ))}
            </select>
          </label>
          <label style={fieldCol}>{t("difficulty")}{" "}
            <select value={form.difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              {[1, 2, 3].map((d) => (
                <option key={d} value={String(d)}>{t(`diff${d}`)}</option>
              ))}
            </select>
          </label>
          <label style={fieldCol}>
            <select value={form.child_id} onChange={(e) => setForm({ ...form, child_id: e.target.value })}>
              <option value="">{t("allKids")}</option>
              {kids.map((k) => (
                <option key={k.id} value={k.id}>{k.nickname}</option>
              ))}
            </select>
          </label>
          <label style={fieldCol}>{t("deadline")} <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></label>
        </div>
        <button type="submit" className="btn-primary" style={{ alignSelf: "flex-start" }}>{t("addTask")}</button>
      </form>
    </section>
  );
}

function EditForm({ task, kids, onSave, onCancel }) {
  const { t, lang } = useLang();
  const [f, setF] = useState({
    title: task.title,
    details: task.details,
    coins: task.coins,
    exp: task.exp,
    child_id: task.child_id || "",
    deadline: task.deadline || "",
    category: task.category || "other",
    difficulty: String(task.difficulty || 1),
  });
  const setDiff = (d) => setF({ ...f, difficulty: d, exp: DIFF_EXP[d] || 10 });
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
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <label style={fieldCol}>{t("coins")} <input type="number" min="0" value={f.coins} onChange={(e) => setF({ ...f, coins: e.target.value })} style={{ width: 76 }} /></label>
          <label style={fieldCol}>EXP <input type="number" min="0" value={f.exp} onChange={(e) => setF({ ...f, exp: e.target.value })} style={{ width: 76 }} /></label>
          <label style={fieldCol}>{t("category")}{" "}
            <select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
              {TASK_CATEGORIES.map((c) => (
                <option key={c} value={c}>{catLabel(c, lang)}</option>
              ))}
            </select>
          </label>
          <label style={fieldCol}>{t("difficulty")}{" "}
            <select value={f.difficulty} onChange={(e) => setDiff(e.target.value)}>
              {[1, 2, 3].map((d) => (
                <option key={d} value={String(d)}>{t(`diff${d}`)}</option>
              ))}
            </select>
          </label>
          <label style={fieldCol}>
            <select value={f.child_id} onChange={(e) => setF({ ...f, child_id: e.target.value })}>
              <option value="">{t("allKids")}</option>
              {kids.map((k) => (
                <option key={k.id} value={k.id}>{k.nickname}</option>
              ))}
            </select>
          </label>
          <label style={fieldCol}>{t("deadline")} <input type="date" value={f.deadline} onChange={(e) => setF({ ...f, deadline: e.target.value })} /></label>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button type="submit" className="btn-primary btn-sm">{t("save")}</button>
        <button type="button" onClick={onCancel} className="btn-sm">{t("cancel")}</button>
      </div>
    </form>
  );
}

const box = {
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: 16,
  marginBottom: 16,
  background: "var(--surface)",
  boxShadow: "var(--shadow)",
};
const row = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
  padding: "12px 14px",
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 14,
  marginBottom: 10,
  flexWrap: "wrap",
  boxShadow: "0 4px 14px rgba(23, 34, 56, 0.05)",
};
const formCard = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: 16,
  boxShadow: "0 4px 14px rgba(23, 34, 56, 0.05)",
};
const fieldCol = { display: "flex", flexDirection: "column", gap: 5 };
const badge = {
  background: "var(--surface-2)",
  color: "var(--dim)",
  borderRadius: 999,
  padding: "2px 9px",
  fontWeight: 700,
  fontSize: 11,
  whiteSpace: "nowrap",
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
