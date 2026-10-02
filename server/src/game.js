import { db } from "./db.js";

// EXP thresholds: minimum total EXP for levels 1..10
export const EXP_THRESHOLDS = [0, 40, 100, 180, 280, 400, 550, 730, 940, 1180];
export const MAX_LEVEL = 10;

export const WORLDS = [
  {
    id: "pirates",
    name_uk: "Пірати",
    currency_uk: "золото",
    art: "/assets/images/media-generation-main-pirates-treasure-map-0-0aedaaaa-1e39-49a4-a15d-01f00cc68c2b.webp",
  },
  {
    id: "space",
    name_uk: "В комп'ютері",
    currency_uk: "вольт",
    art: "/assets/images/media-generation-main-space-ship-repair-0-abc02b17-eddc-4342-8d98-a2745a3835d1.webp",
  },
  {
    id: "dollhouse",
    name_uk: "Ляльковий дім",
    currency_uk: "м²",
    art: "/assets/images/media-generation-main-dollhouse-empty-0-0711303a-0344-44fc-a028-f32977c0f631.webp",
  },
];

export const WORLD_SWITCH_ART =
  "/assets/images/world-switch-collage.webp";

export function isWorld(id) {
  return WORLDS.some((w) => w.id === id);
}

export function levelForExp(exp) {
  let level = 1;
  for (let i = 0; i < EXP_THRESHOLDS.length; i++) {
    if (exp >= EXP_THRESHOLDS[i]) level = i + 1;
  }
  return Math.min(level, MAX_LEVEL);
}

/** EXP still needed to reach the next level (0 when maxed). */
export function expToNextLevel(exp) {
  const level = levelForExp(exp);
  if (level >= MAX_LEVEL) return 0;
  return EXP_THRESHOLDS[level] - exp;
}

export function getWorldProgress(childId, worldId) {
  return db
    .prepare("SELECT * FROM child_worlds WHERE child_id = ? AND world_id = ?")
    .get(childId, worldId);
}

export function ensureWorldProgress(childId, worldId) {
  let row = getWorldProgress(childId, worldId);
  if (!row) {
    db.prepare(
      "INSERT INTO child_worlds (child_id, world_id) VALUES (?, ?)"
    ).run(childId, worldId);
    row = getWorldProgress(childId, worldId);
  }
  return row;
}

export function setActiveWorld(childId, worldId) {
  db.prepare("UPDATE child_worlds SET is_active = 0 WHERE child_id = ?").run(childId);
  const row = ensureWorldProgress(childId, worldId);
  db.prepare("UPDATE child_worlds SET is_active = 1 WHERE id = ?").run(row.id);
  return getWorldProgress(childId, worldId);
}

export function getActiveWorld(childId) {
  return db
    .prepare("SELECT * FROM child_worlds WHERE child_id = ? AND is_active = 1")
    .get(childId);
}

/**
 * Credit coins + EXP to the child's active world (creates a default
 * pirates progress when the child never picked a world).
 * Returns { world_id, coins, exp, level, leveledUp: {from,to} | null }.
 */
export function creditRewards(childId, coins, exp) {
  let active = getActiveWorld(childId);
  if (!active) {
    active = setActiveWorld(childId, "pirates");
  }
  const beforeLevel = levelForExp(active.exp);
  const newExp = active.exp + Math.max(0, exp);
  const newCoins = active.coins + Math.max(0, coins);
  const afterLevel = levelForExp(newExp);
  db.prepare("UPDATE child_worlds SET exp = ?, coins = ?, level = ? WHERE id = ?").run(
    newExp,
    newCoins,
    afterLevel,
    active.id
  );
  return {
    world_id: active.world_id,
    coins: newCoins,
    exp: newExp,
    level: afterLevel,
    leveledUp:
      afterLevel > beforeLevel ? { from: beforeLevel, to: afterLevel } : null,
  };
}
