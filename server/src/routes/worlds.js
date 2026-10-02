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

  const points = EXP_THRESHOLDS.map((threshold, i) => {
    const lv = i + 1;
    return {
      level: lv,
      threshold,
      status: lv < level ? "completed" : lv === level ? "current" : "locked",
      // filled by the shop/modules phases
      bonuses: [],
    };
  });

  res.json({
    world_id,
    exp,
    level,
    exp_to_next: expToNextLevel(exp),
    maxed: level >= MAX_LEVEL,
    points,
    secret: {
      id: "???",
      // undisclosed until reached; unlocks at max level
      unlocked: level >= MAX_LEVEL,
    },
  });
});

export default r;
