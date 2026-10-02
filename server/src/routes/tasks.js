import { Router } from "express";
import { db } from "../db.js";
import { requireParent, requireChild } from "../auth.js";
import { creditRewards, applyDeadlineBonus } from "../game.js";
import { localized, langOfChild } from "../game.js";
import { notify, notifyParent } from "../notify.js";

const r = Router();

const CATS = ["dishes", "vacuum", "tidying", "laundry", "homework", "kindness", "other"];
function cleanCat(v) {
  return CATS.includes(v) ? v : "other";
}
function cleanDiff(v) {
  const d = parseInt(v);
  return [1, 2, 3].includes(d) ? d : 1;
}

function logEvent(taskId, actorType, actorId, event, note = "") {
  db.prepare(
    "INSERT INTO task_events (task_id, actor_type, actor_id, event, note) VALUES (?, ?, ?, ?, ?)"
  ).run(taskId, actorType, actorId, event, note);
  db.prepare("UPDATE tasks SET updated_at = datetime('now') WHERE id = ?").run(taskId);
}

function parentTask(parentId, taskId) {
  return db
    .prepare("SELECT * FROM tasks WHERE id = ? AND parent_id = ? AND deleted = 0")
    .get(taskId, parentId);
}

function childTask(childId, taskId) {
  return db
    .prepare(
      `SELECT t.* FROM tasks t
       JOIN children c ON c.parent_id = t.parent_id
       WHERE t.id = ? AND c.id = ? AND t.deleted = 0
         AND (t.child_id IS NULL OR t.child_id = ?)`
    )
    .get(taskId, childId, childId);
}

// ================= PARENT =================

// List all active tasks (with assignee nicknames)
r.get("/", requireParent, (req, res) => {
  const tasks = db
    .prepare(
      `SELECT t.*, c.nickname AS child_nickname FROM tasks t
       LEFT JOIN children c ON c.id = t.child_id
       WHERE t.parent_id = ? AND t.deleted = 0
       ORDER BY t.status = 'done' DESC, t.updated_at DESC`
    )
    .all(req.session.user_id);
  res.json({ tasks });
});

// Create a task (child_id null = for all kids)
r.post("/", requireParent, (req, res) => {
  const { child_id, title, details, coins, exp, deadline, category, difficulty } = req.body ?? {};
  if (!title || !String(title).trim()) {
    return res.status(400).json({ error: "title required" });
  }
  let assignee = null;
  if (child_id) {
    assignee = db
      .prepare("SELECT id FROM children WHERE id = ? AND parent_id = ?")
      .get(child_id, req.session.user_id);
    if (!assignee) return res.status(400).json({ error: "child not found" });
  }
  const finalDeadline = assignee
    ? applyDeadlineBonus(assignee.id, deadline)
    : String(deadline || "").trim();
  const { lastInsertRowid } = db
    .prepare(
      `INSERT INTO tasks (parent_id, child_id, title, details, coins, exp, deadline, category, difficulty)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      req.session.user_id,
      assignee ? assignee.id : null,
      String(title).trim(),
      String(details || "").trim(),
      Math.max(0, parseInt(coins) || 0),
      Math.max(0, parseInt(exp) || 0),
      finalDeadline,
      cleanCat(category),
      cleanDiff(difficulty)
    );
  logEvent(lastInsertRowid, "parent", req.session.user_id, "created");
  // notify the assignee, or every kid when the task is for all
  const targets = assignee
    ? [{ id: assignee.id }]
    : db.prepare("SELECT id FROM children WHERE parent_id = ?").all(req.session.user_id);
  for (const k of targets) {
    notify(req.session.user_id, {
      childId: k.id,
      type: "task_assigned",
      title: "New task",
      body: `"${String(title).trim()}" — ${Math.max(0, parseInt(coins) || 0)} coins, ${Math.max(0, parseInt(exp) || 0)} EXP`,
      data: {
        title: String(title).trim(),
        coins: Math.max(0, parseInt(coins) || 0),
      },
    });
  }
  res.json({ ok: true, id: lastInsertRowid });
});

// Edit a task (not after approval)
r.patch("/:id", requireParent, (req, res) => {
  const t = parentTask(req.session.user_id, req.params.id);
  if (!t) return res.status(404).json({ error: "task not found" });
  if (t.status === "approved") return res.status(400).json({ error: "already approved" });
  const { title, details, coins, exp, child_id, deadline, category, difficulty } = req.body ?? {};
  let assigneeId = t.child_id;
  if (child_id !== undefined) {
    if (child_id === null) assigneeId = null;
    else {
      const k = db
        .prepare("SELECT id FROM children WHERE id = ? AND parent_id = ?")
        .get(child_id, req.session.user_id);
      if (!k) return res.status(400).json({ error: "child not found" });
      assigneeId = k.id;
    }
  }
  db.prepare(
    `UPDATE tasks SET title = ?, details = ?, coins = ?, exp = ?, child_id = ?, deadline = ?,
     category = ?, difficulty = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(
    title !== undefined ? String(title).trim() : t.title,
    details !== undefined ? String(details).trim() : t.details,
    coins !== undefined ? Math.max(0, parseInt(coins) || 0) : t.coins,
    exp !== undefined ? Math.max(0, parseInt(exp) || 0) : t.exp,
    assigneeId,
    deadline !== undefined ? String(deadline).trim() : t.deadline,
    category !== undefined ? cleanCat(category) : t.category,
    difficulty !== undefined ? cleanDiff(difficulty) : t.difficulty,
    t.id
  );
  logEvent(t.id, "parent", req.session.user_id, "edited");
  res.json({ ok: true });
});

// Pause / resume
r.post("/:id/pause", requireParent, (req, res) => {
  const t = parentTask(req.session.user_id, req.params.id);
  if (!t) return res.status(404).json({ error: "task not found" });
  if (t.status === "paused" || t.status === "approved") {
    return res.status(400).json({ error: "cannot pause in this state" });
  }
  db.prepare("UPDATE tasks SET status = 'paused', paused_from = ? WHERE id = ?").run(
    t.status,
    t.id
  );
  logEvent(t.id, "parent", req.session.user_id, "paused");
  res.json({ ok: true });
});

r.post("/:id/resume", requireParent, (req, res) => {
  const t = parentTask(req.session.user_id, req.params.id);
  if (!t) return res.status(404).json({ error: "task not found" });
  if (t.status !== "paused") return res.status(400).json({ error: "not paused" });
  const back = ["ready", "working", "done"].includes(t.paused_from) ? t.paused_from : "ready";
  db.prepare("UPDATE tasks SET status = ?, paused_from = '' WHERE id = ?").run(back, t.id);
  logEvent(t.id, "parent", req.session.user_id, "resumed");
  res.json({ ok: true });
});

// Approve (done -> approved, rewards granted) or send back (done -> working)
r.post("/:id/approve", requireParent, (req, res) => {
  const t = parentTask(req.session.user_id, req.params.id);
  if (!t) return res.status(404).json({ error: "task not found" });
  if (t.status !== "done") return res.status(400).json({ error: "task is not awaiting check" });
  db.prepare("UPDATE tasks SET status = 'approved' WHERE id = ?").run(t.id);
  logEvent(
    t.id,
    "parent",
    req.session.user_id,
    "approved",
    `+${t.coins} coins, +${t.exp} exp`
  );
  // Credit the reward to the child's active world (per-world wallets).
  const doerId = t.completed_by || t.child_id;
  let reward = null;
  if (doerId) {
    const stillExists = db
      .prepare("SELECT id FROM children WHERE id = ? AND parent_id = ?")
      .get(doerId, req.session.user_id);
    if (stillExists) reward = creditRewards(doerId, t.coins, t.exp);
  }
  if (doerId) {
    const leveledUp = !!reward?.leveledUp;
    const newLevel = reward?.leveledUp?.to || null;
    const nick =
      db.prepare("SELECT nickname FROM children WHERE id = ?").get(doerId)?.nickname || "";
    const plan =
      db.prepare("SELECT plan FROM parents WHERE id = ?").get(req.session.user_id)?.plan ||
      "free";
    let suffixKey = null;
    let dropName = null;
    if (leveledUp && newLevel) {
      // Level-up reward: auto-open one free mystery drop per gained level.
      const lang = langOfChild(doerId);
      for (let lv = reward.leveledUp.from + 1; lv <= newLevel; lv++) {
        const lvProgs = db
          .prepare(
            `SELECT * FROM potion_templates
             WHERE parent_id = ? AND world_id = ? AND level = ? AND in_chest = 1 AND archived = 0`
          )
          .all(req.session.user_id, reward.world_id, lv);
        if (lvProgs.length === 0) continue;
        const pick = lvProgs[Math.floor(Math.random() * lvProgs.length)];
        const lp = localized(pick, lang);
        db.prepare(
          `INSERT INTO kid_inventory (child_id, world_id, potion_template_id, name, effect)
           VALUES (?, ?, ?, ?, ?)`
        ).run(doerId, reward.world_id, pick.id, lp.name, lp.effect);
        if (lv === newLevel) dropName = lp.name;
      }
      // Canonical level-up notifications to the parents (up to 4, separate).
      if (plan === "free" && newLevel >= 4) {
        notify(req.session.user_id, {
          type: "plus_chapter_ready",
          data: { name: nick, n: newLevel },
        });
        suffixKey = "plus";
      }
      if (dropName) {
        notify(req.session.user_id, {
          type: "mission_completed",
          data: { name: nick, n: newLevel, program: dropName },
        });
        if (!suffixKey) suffixKey = "program";
      } else {
        notify(req.session.user_id, {
          type: "mission_reward_setup",
          data: { name: nick, n: newLevel },
        });
        if (!suffixKey) suffixKey = "setup";
      }
      notify(req.session.user_id, {
        type: "check_level_rewards",
        data: { name: nick, n: newLevel },
      });
    }
    notify(req.session.user_id, {
      childId: doerId,
      type: "task_approved",
      data: {
        title: t.title,
        coins: t.coins,
        xp: t.exp,
        leveledUp,
        suffixKey,
        n: newLevel,
        program: dropName,
      },
    });
  }
  res.json({ ok: true, granted: { coins: t.coins, exp: t.exp }, reward });
});

r.post("/:id/reject", requireParent, (req, res) => {
  const t = parentTask(req.session.user_id, req.params.id);
  if (!t) return res.status(404).json({ error: "task not found" });
  if (t.status !== "done") return res.status(400).json({ error: "task is not awaiting check" });
  const { note } = req.body ?? {};
  db.prepare("UPDATE tasks SET status = 'working' WHERE id = ?").run(t.id);
  logEvent(t.id, "parent", req.session.user_id, "rejected", String(note || ""));
  const doerId = t.completed_by || t.child_id;
  if (doerId) {
    notify(req.session.user_id, {
      childId: doerId,
      type: "task_rejected",
      title: "Task sent back",
      body: `"${t.title}" — take another look`,
      data: { title: t.title },
    });
  }
  res.json({ ok: true });
});

// Soft delete — history (task_events) is preserved
r.delete("/:id", requireParent, (req, res) => {
  const t = parentTask(req.session.user_id, req.params.id);
  if (!t) return res.status(404).json({ error: "task not found" });
  db.prepare("UPDATE tasks SET deleted = 1 WHERE id = ?").run(t.id);
  logEvent(t.id, "parent", req.session.user_id, "deleted");
  res.json({ ok: true });
});

// My history (approved tasks) — defined here, above /:id/history,
// because Express matches /:id/history for the path /mine/history otherwise
r.get("/mine/history", requireChild, (req, res) => {
  const tasks = db
    .prepare(
      `SELECT * FROM tasks
       WHERE parent_id = (SELECT parent_id FROM children WHERE id = ?)
         AND deleted = 0 AND status = 'approved'
         AND (child_id IS NULL OR child_id = ?)
       ORDER BY updated_at DESC LIMIT 50`
    )
    .all(req.session.user_id, req.session.user_id);
  res.json({ tasks });
});

// History of one task (parent view)
r.get("/:id/history", requireParent, (req, res) => {
  const t = db
    .prepare("SELECT * FROM tasks WHERE id = ? AND parent_id = ?")
    .get(req.params.id, req.session.user_id);
  if (!t) return res.status(404).json({ error: "task not found" });
  const events = db
    .prepare("SELECT * FROM task_events WHERE task_id = ? ORDER BY id")
    .all(t.id);
  res.json({ task: t, events });
});

// Kid suggestions inbox
r.get("/suggestions/inbox", requireParent, (req, res) => {
  const list = db
    .prepare(
      `SELECT s.*, c.nickname AS child_nickname FROM task_suggestions s
       JOIN children c ON c.id = s.child_id
       WHERE s.parent_id = ? AND s.status = 'pending' ORDER BY s.id`
    )
    .all(req.session.user_id);
  res.json({ suggestions: list });
});

r.post("/suggestions/:id/accept", requireParent, (req, res) => {
  const s = db
    .prepare("SELECT * FROM task_suggestions WHERE id = ? AND parent_id = ? AND status = 'pending'")
    .get(req.params.id, req.session.user_id);
  if (!s) return res.status(404).json({ error: "suggestion not found" });
  const { coins, exp } = req.body ?? {};
  const { lastInsertRowid } = db
    .prepare(
      `INSERT INTO tasks (parent_id, child_id, title, details, coins, exp)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      req.session.user_id,
      s.child_id,
      s.title,
      s.details,
      Math.max(0, parseInt(coins) || 0),
      Math.max(0, parseInt(exp) || 0)
    );
  db.prepare("UPDATE task_suggestions SET status = 'accepted' WHERE id = ?").run(s.id);
  logEvent(lastInsertRowid, "parent", req.session.user_id, "created", "from kid suggestion");
  notify(req.session.user_id, {
    childId: s.child_id,
    type: "suggestion_accepted",
    title: "Suggestion accepted",
    body: `"${s.title}" became a task`,
    data: { title: s.title },
  });
  res.json({ ok: true, task_id: lastInsertRowid });
});

r.post("/suggestions/:id/decline", requireParent, (req, res) => {
  const s = db
    .prepare("SELECT * FROM task_suggestions WHERE id = ? AND parent_id = ? AND status = 'pending'")
    .get(req.params.id, req.session.user_id);
  if (!s) return res.status(404).json({ error: "suggestion not found" });
  db.prepare("UPDATE task_suggestions SET status = 'declined' WHERE id = ?").run(s.id);
  notify(req.session.user_id, {
    childId: s.child_id,
    type: "suggestion_declined",
    title: "Suggestion declined",
    body: `"${s.title}"`,
    data: { title: s.title },
  });
  res.json({ ok: true });
});

// ================= CHILD =================

// My active tasks (assigned to me or to all kids)
// NOTE: static /mine/* routes must stay above /:id/history (Express matches in order)
r.get("/mine/list", requireChild, (req, res) => {
  const tasks = db
    .prepare(
      `SELECT * FROM tasks
       WHERE parent_id = (SELECT parent_id FROM children WHERE id = ?)
         AND deleted = 0 AND status != 'approved'
         AND (child_id IS NULL OR child_id = ?)
       ORDER BY status = 'done' DESC, updated_at DESC`
    )
    .all(req.session.user_id, req.session.user_id);
  res.json({ tasks });
});

r.post("/:id/start", requireChild, (req, res) => {
  const t = childTask(req.session.user_id, req.params.id);
  if (!t) return res.status(404).json({ error: "task not found" });
  if (t.status !== "ready") return res.status(400).json({ error: "cannot start now" });
  db.prepare("UPDATE tasks SET status = 'working', completed_by = ? WHERE id = ?").run(
    req.session.user_id,
    t.id
  );
  logEvent(t.id, "child", req.session.user_id, "started");
  res.json({ ok: true });
});

r.post("/:id/finish", requireChild, (req, res) => {
  const t = childTask(req.session.user_id, req.params.id);
  if (!t) return res.status(404).json({ error: "task not found" });
  if (t.status !== "working") return res.status(400).json({ error: "cannot finish now" });
  const { note } = req.body ?? {};
  db.prepare("UPDATE tasks SET status = 'done', kid_note = ? WHERE id = ?").run(
    String(note || "").trim(),
    t.id
  );
  logEvent(t.id, "child", req.session.user_id, "finished", String(note || "").trim());
  const nick =
    db.prepare("SELECT nickname FROM children WHERE id = ?").get(req.session.user_id)?.nickname || "";
  notifyParent(req.session.user_id, {
    type: "task_review",
    title: "Task ready for review",
    body: `${nick} finished "${t.title}"`,
    data: { name: nick, title: t.title, note: String(note || "").trim() },
  });
  res.json({ ok: true });
});

r.post("/:id/note", requireChild, (req, res) => {
  const t = childTask(req.session.user_id, req.params.id);
  if (!t) return res.status(404).json({ error: "task not found" });
  if (t.status === "approved") return res.status(400).json({ error: "already approved" });
  const { note } = req.body ?? {};
  db.prepare("UPDATE tasks SET kid_note = ? WHERE id = ?").run(String(note || "").trim(), t.id);
  logEvent(t.id, "child", req.session.user_id, "note_added", String(note || "").trim());
  res.json({ ok: true });
});

// Suggest a new task to parents
r.post("/suggest/new", requireChild, (req, res) => {
  const { title, details } = req.body ?? {};
  if (!title || !String(title).trim()) {
    return res.status(400).json({ error: "title required" });
  }
  const me = db.prepare("SELECT parent_id FROM children WHERE id = ?").get(req.session.user_id);
  const { lastInsertRowid } = db
    .prepare(
      "INSERT INTO task_suggestions (parent_id, child_id, title, details) VALUES (?, ?, ?, ?)"
    )
    .run(me.parent_id, req.session.user_id, String(title).trim(), String(details || "").trim());
  const nick = db.prepare("SELECT nickname FROM children WHERE id = ?").get(req.session.user_id)?.nickname || "";
  notifyParent(req.session.user_id, {
    type: "task_suggested",
    data: { name: nick, title: String(title).trim() },
  });
  res.json({ ok: true, id: lastInsertRowid });
});

r.get("/suggest/mine", requireChild, (req, res) => {
  const list = db
    .prepare("SELECT * FROM task_suggestions WHERE child_id = ? ORDER BY id DESC LIMIT 20")
    .all(req.session.user_id);
  res.json({ suggestions: list });
});

export default r;
