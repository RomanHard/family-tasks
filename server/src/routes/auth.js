import { Router } from "express";
import { db } from "../db.js";
import {
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
  getSession,
  SESSION_COOKIE_OPTS,
} from "../auth.js";
import { seedParent } from "../seed.js";

const r = Router();

const LANGS = ["en", "uk", "es"];
function cleanLang(v) {
  return LANGS.includes(v) ? v : "uk";
}

// Parent registration: email + password
r.post("/parent/register", async (req, res) => {
  const { email, password, language } = req.body ?? {};
  if (!email || !password || String(password).length < 6) {
    return res.status(400).json({ error: "email and password (6+ chars) required" });
  }
  const normalized = String(email).trim().toLowerCase();
  const exists = db.prepare("SELECT id FROM parents WHERE email = ?").get(normalized);
  if (exists) return res.status(409).json({ error: "email already registered" });

  const hash = await hashPassword(String(password));
  const lang = cleanLang(language);
  const { lastInsertRowid } = db
    .prepare("INSERT INTO parents (email, password_hash, language) VALUES (?, ?, ?)")
    .run(normalized, hash, lang);
  seedParent(lastInsertRowid);
  const token = createSession("parent", lastInsertRowid);
  res
    .cookie("ft_session", token, SESSION_COOKIE_OPTS)
    .json({ ok: true, user: { type: "parent", id: lastInsertRowid, email: normalized, language: lang } });
});

// Parent login: email + password
r.post("/parent/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ error: "email and password required" });
  const p = db
    .prepare("SELECT * FROM parents WHERE email = ?")
    .get(String(email).trim().toLowerCase());
  if (!p || !(await verifyPassword(String(password), p.password_hash))) {
    return res.status(401).json({ error: "invalid email or password" });
  }
  const token = createSession("parent", p.id);
  res
    .cookie("ft_session", token, SESSION_COOKIE_OPTS)
    .json({ ok: true, user: { type: "parent", id: p.id, email: p.email, language: p.language || "uk" } });
});

// Child login: nickname + password (no email)
r.post("/child/login", async (req, res) => {
  const { nickname, password } = req.body ?? {};
  if (!nickname || !password) {
    return res.status(400).json({ error: "nickname and password required" });
  }
  const kids = db
    .prepare("SELECT * FROM children WHERE nickname = ?")
    .all(String(nickname).trim());
  for (const k of kids) {
    if (await verifyPassword(String(password), k.password_hash)) {
      const token = createSession("child", k.id);
      return res
        .cookie("ft_session", token, SESSION_COOKIE_OPTS)
        .json({
          ok: true,
          user: { type: "child", id: k.id, nickname: k.nickname, parent_id: k.parent_id, language: k.language || "uk" },
        });
    }
  }
  return res.status(401).json({ error: "invalid nickname or password" });
});

r.post("/logout", (req, res) => {
  destroySession(req);
  res.clearCookie("ft_session", { path: "/" }).json({ ok: true });
});

r.get("/me", (req, res) => {
  const s = getSession(req);
  if (!s) return res.json({ user: null });
  if (s.user_type === "parent") {
    const p = db.prepare("SELECT id, email, language FROM parents WHERE id = ?").get(s.user_id);
    return res.json({ user: p ? { type: "parent", ...p, language: p.language || "uk" } : null });
  }
  const c = db
    .prepare("SELECT id, nickname, parent_id, language FROM children WHERE id = ?")
    .get(s.user_id);
  return res.json({ user: c ? { type: "child", ...c, language: c.language || "uk" } : null });
});

// Parent changes their own interface language
r.patch("/language", (req, res) => {
  const s = getSession(req);
  if (!s || s.user_type !== "parent") return res.status(401).json({ error: "unauthorized" });
  const language = cleanLang(req.body?.language);
  db.prepare("UPDATE parents SET language = ? WHERE id = ?").run(language, s.user_id);
  res.json({ ok: true, language });
});

export default r;
