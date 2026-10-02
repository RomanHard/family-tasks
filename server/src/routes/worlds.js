import { Router } from "express";
import { db } from "../db.js";
import { requireAuth, requireChild } from "../auth.js";
import {
  WORLDS,
  WORLD_SWITCH_ART,
  EXP_THRESHOLDS,
  MAX_LEVEL,
  isWorld,
  levelForExp,
  expToNextLevel,
  getWorldProgress,
  ensureWorldProgress,
  setActiveWorld,
} from "../game.js";

const r = Router();

// World catalog (static config)
r.get("/", requireAuth, (_req, res) => {
  res.json({ worlds: WORLDS, switchArt: WORLD_SWITCH_ART });
});

// The child's progress across worlds
r.get("/mine", requireChild, (req, res) => {
  const rows = db
    .prepare("SELECT * FROM child_worlds WHERE child_id = ?")
    .all(req.session.user_id);
  const byId = Object.fromEntries(rows.map((x) => [x.world_id, x]));
  const worlds = WORLDS.map((w) => {
    const p = byId[w.id];
    return {
      ...w,
      entered: !!p,
      level: p ? p.level : 1,
      exp: p ? p.exp : 0,
      coins: p ? p.coins : 0,
      character_name: p ? p.character_name : "",
      is_active: p ? p.is_active === 1 : false,
      exp_to_next: p ? expToNextLevel(p.exp) : EXP_THRESHOLDS[1],
    };
  });
  res.json({ worlds });
});

// Pick a world (first entry names the character; switching keeps progress)
r.post("/select", requireChild, (req, res) => {
  const { world_id, character_name } = req.body ?? {};
  if (!isWorld(world_id)) return res.status(400).json({ error: "unknown world" });

  const existing = getWorldProgress(req.session.user_id, world_id);
  const row = setActiveWorld(req.session.user_id, world_id);

  if (!existing) {
    // first entry into this world — name the character
    const me = db
      .prepare("SELECT nickname FROM children WHERE id = ?")
      .get(req.session.user_id);
    const name = String(character_name || "").trim() || me.nickname;
    db.prepare("UPDATE child_worlds SET character_name = ? WHERE id = ?").run(name, row.id);
    // welcome gift: the +10% EXP module, free
    db.prepare(
      `INSERT OR IGNORE INTO purchased_modules (child_id, world_id, module_key)
       VALUES (?, ?, 'exp_10')`
    ).run(req.session.user_id, world_id);
  } else if (character_name !== undefined && String(character_name).trim()) {
    db.prepare("UPDATE child_worlds SET character_name = ? WHERE id = ?").run(
      String(character_name).trim(),
      row.id
    );
  }
  const updated = getWorldProgress(req.session.user_id, world_id);
  res.json({
    ok: true,
    firstEntry: !existing,
    world: { ...WORLDS.find((w) => w.id === world_id), ...updated },
  });
});

// Rename the character in a world
r.patch("/character", requireChild, (req, res) => {
  const { world_id, character_name } = req.body ?? {};
  if (!isWorld(world_id)) return res.status(400).json({ error: "unknown world" });
  const name = String(character_name || "").trim();
  if (!name) return res.status(400).json({ error: "name required" });
  const row = ensureWorldProgress(req.session.user_id, world_id);
  db.prepare("UPDATE child_worlds SET character_name = ? WHERE id = ?").run(name, row.id);
  res.json({ ok: true, character_name: name });
});

// Journey map: 10 level points + the secret point after level 10
r.get("/:world_id/journey", requireChild, (req, res) => {
  const { world_id } = req.params;
  if (!isWorld(world_id)) return res.status(400).json({ error: "unknown world" });
  const p = getWorldProgress(req.session.user_id, world_id);
  const exp = p ? p.exp : 0;
  const level = levelForExp(exp);
  const me = db
    .prepare("SELECT parent_id FROM children WHERE id = ?")
    .get(req.session.user_id);

  const potionsByLevel = {};
  if (me) {
    const rows = db
      .prepare(
        `SELECT level, name, effect, price FROM potion_templates
         WHERE parent_id = ? AND world_id = ? AND in_chest = 1
         ORDER BY level, sort_order, id`
      )
      .all(me.parent_id, world_id);
    for (const x of rows) {
      (potionsByLevel[x.level] = potionsByLevel[x.level] || []).push({
        name: x.name,
        effect: x.effect,
        price: x.price,
      });
    }
  }
  const ownedModules = db
    .prepare(
      `SELECT mt.name, mt.bonus_text FROM purchased_modules pm
       JOIN module_templates mt ON mt.world_id = pm.world_id AND mt.module_key = pm.module_key
         AND mt.parent_id = ?
       WHERE pm.child_id = ? AND pm.world_id = ?`
    )
    .all(me ? me.parent_id : 0, req.session.user_id, world_id)
    .map((m) => ({ name: m.name, bonus: m.bonus_text }));

  // Paywall: on the free plan the visible level is capped at 3 and
  // points 4+ are locked; EXP keeps accumulating underneath.
  let plan = "free";
  if (me) {
    const prow = db.prepare("SELECT plan FROM parents WHERE id = ?").get(me.parent_id);
    plan = prow?.plan || "free";
  }
  const visibleLevel = plan === "plus" ? level : Math.min(level, 3);

  const points = EXP_THRESHOLDS.map((threshold, i) => {
    const lv = i + 1;
    const paywalled = plan !== "plus" && lv > 3;
    return {
      level: lv,
      threshold,
      status: lv < level ? "completed" : lv === level ? "current" : "locked",
      paywalled,
      potions: potionsByLevel[lv] || [],
    };
  });

  res.json({
    world_id,
    exp,
    level,
    visible_level: visibleLevel,
    plan,
    exp_to_next: expToNextLevel(exp),
    maxed: level >= MAX_LEVEL,
    points,
    modules: ownedModules,
    secret: {
      id: "???",
      // undisclosed until reached; unlocks at max level
      unlocked: level >= MAX_LEVEL,
    },
  });
});

export default r;
