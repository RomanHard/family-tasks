import { Router } from "express";
import { db } from "../db.js";
import { requireParent, requireChild } from "../auth.js";
import { notify, notifyParent } from "../notify.js";

const r = Router();

// Child asks for a real family reward
r.post("/request", requireChild, (req, res) => {
  const { text } = req.body ?? {};
  if (!text || !String(text).trim()) {
    return res.status(400).json({ error: "text required" });
  }
  const me = db
    .prepare("SELECT parent_id, nickname FROM children WHERE id = ?")
    .get(req.session.user_id);
  const { lastInsertRowid } = db
    .prepare("INSERT INTO redemptions (parent_id, child_id, text) VALUES (?, ?, ?)")
    .run(me.parent_id, req.session.user_id, String(text).trim().slice(0, 300));
  notifyParent(req.session.user_id, {
    type: "reward_requested",
    title: "New reward idea",
    body: `${me.nickname} would love "${String(text).trim().slice(0, 300)}".`,
    data: { name: me.nickname, title: String(text).trim().slice(0, 300) },
  });
  res.json({ ok: true, id: lastInsertRowid });
});

// Child's own requests (history)
r.get("/mine", requireChild, (req, res) => {
  const items = db
    .prepare("SELECT * FROM redemptions WHERE child_id = ? ORDER BY id DESC LIMIT 50")
    .all(req.session.user_id);
  res.json({ rewards: items });
});

// Parent: pending requests
r.get("/inbox", requireParent, (req, res) => {
  const items = db
    .prepare(
      `SELECT r.*, c.nickname AS child_nickname FROM redemptions r
       JOIN children c ON c.id = r.child_id
       WHERE r.parent_id = ? AND r.status = 'pending' ORDER BY r.id`
    )
    .all(req.session.user_id);
  res.json({ rewards: items });
});

// Parent: full history
r.get("/history", requireParent, (req, res) => {
  const items = db
    .prepare(
      `SELECT r.*, c.nickname AS child_nickname FROM redemptions r
       JOIN children c ON c.id = r.child_id
       WHERE r.parent_id = ? ORDER BY r.id DESC LIMIT 100`
    )
    .all(req.session.user_id);
  res.json({ rewards: items });
});

function decide(req, res, status) {
  const rwd = db
    .prepare("SELECT * FROM redemptions WHERE id = ? AND parent_id = ? AND status = 'pending'")
    .get(req.params.id, req.session.user_id);
  if (!rwd) return res.status(404).json({ error: "request not found" });
  const coins = status === "approved" ? Math.max(0, parseInt(req.body?.coins) || 0) : 0;
  db.prepare("UPDATE redemptions SET status = ?, coins = ? WHERE id = ?").run(status, coins, rwd.id);
  notify(req.session.user_id, {
    childId: rwd.child_id,
    type: status === "approved" ? "reward_approved" : "reward_declined",
    title: status === "approved" ? "Reward idea accepted" : "Reward idea declined",
    body:
      status === "approved"
        ? `"${rwd.text}" was added for ${coins} coins.`
        : `Your idea "${rwd.text}" was declined.`,
    data: { title: rwd.text, coins },
  });
  res.json({ ok: true });
}

r.post("/:id/approve", requireParent, (req, res) => decide(req, res, "approved"));
r.post("/:id/decline", requireParent, (req, res) => decide(req, res, "declined"));

export default r;
