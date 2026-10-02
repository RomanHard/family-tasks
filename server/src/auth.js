import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { db } from "./db.js";

const SESSION_DAYS = 30;

export async function hashPassword(pw) {
  return bcrypt.hash(pw, 10);
}

export async function verifyPassword(pw, hash) {
  return bcrypt.compare(pw, hash);
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createSession(userType, userId) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 864e5).toISOString();
  db.prepare(
    "INSERT INTO sessions (token_hash, user_type, user_id, expires_at) VALUES (?, ?, ?, ?)"
  ).run(hashToken(token), userType, userId, expiresAt);
  return token;
}

export function getSession(req) {
  const token = req.cookies?.ft_session;
  if (!token) return null;
  const row = db
    .prepare("SELECT * FROM sessions WHERE token_hash = ?")
    .get(hashToken(token));
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(row.token_hash);
    return null;
  }
  return row;
}

export function destroySession(req) {
  const token = req.cookies?.ft_session;
  if (token) {
    db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
  }
}

export function requireAuth(req, res, next) {
  const s = getSession(req);
  if (!s) return res.status(401).json({ error: "unauthorized" });
  req.session = s;
  next();
}

export function requireParent(req, res, next) {
  requireAuth(req, res, () => {
    if (req.session.user_type !== "parent") {
      return res.status(403).json({ error: "parents only" });
    }
    next();
  });
}

export const SESSION_COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  maxAge: SESSION_DAYS * 864e5,
};
