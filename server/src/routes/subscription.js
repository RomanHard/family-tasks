import { Router } from "express";
import { db } from "../db.js";
import { requireParent, requireChild } from "../auth.js";
import { notify } from "../notify.js";

const r = Router();
const PLANS = ["free", "plus"];

// Current plan of the logged-in parent
r.get("/plan", requireParent, (req, res) => {
  const p = db.prepare("SELECT plan FROM parents WHERE id = ?").get(req.session.user_id);
  res.json({ plan: p?.plan || "free" });
});

// Preview toggle: switch between free and plus (no real billing yet)
r.patch("/plan", requireParent, (req, res) => {
  const plan = String(req.body?.plan || "");
  if (!PLANS.includes(plan)) return res.status(400).json({ error: "unknown plan" });
  db.prepare("UPDATE parents SET plan = ? WHERE id = ?").run(plan, req.session.user_id);
  notify(req.session.user_id, {
    type: "plan_changed",
    title: "Subscription plan changed",
    body: `Plan is now ${plan === "plus" ? "Family Tasks Plus" : "Free"}.`,
    data: { plan },
  });
  res.json({ ok: true, plan });
});

// Child asks parents for Plus (deduped while an unread request exists)
r.post("/request", requireChild, (req, res) => {
  const me = db
    .prepare("SELECT parent_id, nickname FROM children WHERE id = ?")
    .get(req.session.user_id);
  if (!me) return res.status(404).json({ error: "child not found" });
  const existing = db
    .prepare(
      `SELECT id FROM notifications
       WHERE parent_id = ? AND child_id = ? AND type = 'plus_requested' AND read = 0`
    )
    .get(me.parent_id, req.session.user_id);
  if (!existing) {
    notify(me.parent_id, {
      type: "plus_requested",
      title: "Family Tasks Plus requested",
      body: `${me.nickname} asks for Family Tasks Plus (levels 4-10).`,
      data: { nickname: me.nickname },
    });
  }
  res.json({ ok: true });
});

export default r;
