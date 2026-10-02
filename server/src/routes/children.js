import { Router } from "express";
import { db } from "../db.js";
import { hashPassword, requireParent } from "../auth.js";

const r = Router();
r.use(requireParent);

// List parent's children
r.get("/", (req, res) => {
  const kids = db
    .prepare("SELECT id, nickname, language, created_at FROM children WHERE parent_id = ? ORDER BY id")
    .all(req.session.user_id);
  res.json({ children: kids });
});

// Create a child profile: nickname + password (managed sign-in)
r.post("/", async (req, res) => {
  const { nickname, password } = req.body ?? {};
  if (!nickname || !password || String(password).length < 4) {
    return res.status(400).json({ error: "nickname and password (4+ chars) required" });
  }
  const name = String(nickname).trim();
  const exists = db
    .prepare("SELECT id FROM children WHERE parent_id = ? AND nickname = ?")
    .get(req.session.user_id, name);
  if (exists) return res.status(409).json({ error: "nickname already used in your family" });

  const hash = await hashPassword(String(password));
  const { lastInsertRowid } = db
    .prepare("INSERT INTO children (parent_id, nickname, password_hash) VALUES (?, ?, ?)")
    .run(req.session.user_id, name, hash);
  res.json({ ok: true, child: { id: lastInsertRowid, nickname: name } });
});

// Set a child's interface language (parent decides per child)
r.patch("/:id/language", (req, res) => {
  const language = ["en", "uk", "es"].includes(req.body?.language) ? req.body.language : "uk";
  const kid = db
    .prepare("SELECT id FROM children WHERE id = ? AND parent_id = ?")
    .get(req.params.id, req.session.user_id);
  if (!kid) return res.status(404).json({ error: "child not found" });
  db.prepare("UPDATE children SET language = ? WHERE id = ?").run(language, kid.id);
  res.json({ ok: true, language });
});

// Reset a child's password (old one is never shown)
r.post("/:id/password", async (req, res) => {
  const { password } = req.body ?? {};
  if (!password || String(password).length < 4) {
    return res.status(400).json({ error: "password (4+ chars) required" });
  }
  const kid = db
    .prepare("SELECT id FROM children WHERE id = ? AND parent_id = ?")
    .get(req.params.id, req.session.user_id);
  if (!kid) return res.status(404).json({ error: "child not found" });
  const hash = await hashPassword(String(password));
  db.prepare("UPDATE children SET password_hash = ? WHERE id = ?").run(hash, kid.id);
  // kill child's sessions so the old password stops working everywhere
  db.prepare("DELETE FROM sessions WHERE user_type = 'child' AND user_id = ?").run(kid.id);
  res.json({ ok: true });
});

export default r;
