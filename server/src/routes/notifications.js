import { Router } from "express";
import { db } from "../db.js";
import { requireAuth } from "../auth.js";

const r = Router();
r.use(requireAuth);

// Parents see parent-targeted notifications (their own + kid activity);
// children see only their own.
function scope(req) {
  const s = req.session;
  if (s.user_type === "parent") return { where: "parent_id = ? AND child_id IS NULL", params: [s.user_id] };
  return { where: "child_id = ?", params: [s.user_id] };
}

r.get("/", (req, res) => {
  const { where, params } = scope(req);
  const notifications = db
    .prepare(
      `SELECT id, type, title, body, data, read, created_at, child_id
       FROM notifications WHERE ${where} ORDER BY id DESC LIMIT 100`
    )
    .all(...params);
  const unread = db
    .prepare(`SELECT COUNT(*) AS c FROM notifications WHERE ${where} AND read = 0`)
    .get(...params).c;
  res.json({ notifications, unread });
});

// Mark all my notifications as read (called when the list modal opens)
r.post("/read", (req, res) => {
  const { where, params } = scope(req);
  db.prepare(`UPDATE notifications SET read = 1 WHERE ${where}`).run(...params);
  res.json({ ok: true });
});

export default r;
