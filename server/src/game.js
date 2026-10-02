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
    videos: {
      en: "/assets/videos/pirates-backstory-en.mp4",
      es: "/assets/videos/pirates-backstory-es.mp4",
    },
  },
  {
    id: "space",
    name_uk: "В комп'ютері",
    currency_uk: "вольт",
    art: "/assets/images/media-generation-main-space-ship-repair-0-abc02b17-eddc-4342-8d98-a2745a3835d1.webp",
    videos: {
      en: "/assets/videos/space-backstory-en.mp4",
      es: "/assets/videos/space-backstory-es.mp4",
    },
  },
  {
    id: "dollhouse",
    name_uk: "Ляльковий дім",
    currency_uk: "м²",
    art: "/assets/images/media-generation-main-dollhouse-empty-0-0711303a-0344-44fc-a028-f32977c0f631.webp",
    videos: {
      en: "/assets/videos/dollhouse-backstory-en.mp4",
      es: "/assets/videos/dollhouse-backstory-es.mp4",
    },
  },
];

// Narration language: EN/ES only for now (UK voiceover deferred — UK UI plays EN).
export function videoFor(worldId, lang) {
  const w = WORLDS.find((x) => x.id === worldId);
  if (!w) return null;
  return w.videos[lang === "es" ? "es" : "en"];
}

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

export function ownsModule(childId, worldId, moduleKey) {
  return !!db
    .prepare(
      "SELECT id FROM purchased_modules WHERE child_id = ? AND world_id = ? AND module_key = ?"
    )
    .get(childId, worldId, moduleKey);
}

/** +1 day deadline shield: extends the date when the child owns the module. */
export function applyDeadlineBonus(childId, deadline) {
  const d = String(deadline || "").trim();
  if (!d || !childId) return "";
  const active = getActiveWorld(childId);
  if (!active || !ownsModule(childId, active.world_id, "deadline_1day")) return d;
  const dt = new Date(d + "T12:00:00");
  if (isNaN(dt)) return d;
  dt.setDate(dt.getDate() + 1);
  return dt.toISOString().slice(0, 10);
}

/** Chest price for a level, with −20% when the child owns the discount module. */
export function chestPriceFor(parentId, worldId, level, childId) {
  const row = db
    .prepare("SELECT price FROM chest_prices WHERE parent_id = ? AND world_id = ? AND level = ?")
    .get(parentId, worldId, level);
  const base = row ? row.price : 20 * level;
  if (childId && ownsModule(childId, worldId, "chest_discount_20")) {
    return Math.max(1, Math.round(base * 0.8));
  }
  return base;
}

/**
 * Credit coins + EXP to the child's active world (creates a default
 * pirates progress when the child never picked a world).
 * Applies permanent module bonuses (+10% coins / +10% EXP).
 * Returns { world_id, coins, exp, level, leveledUp: {from,to} | null }.
 */
export function creditRewards(childId, coins, exp) {
  let active = getActiveWorld(childId);
  if (!active) {
    active = setActiveWorld(childId, "pirates");
  }
  let c = Math.max(0, coins);
  let e = Math.max(0, exp);
  if (ownsModule(childId, active.world_id, "coins_10")) c = Math.round(c * 1.1);
  if (ownsModule(childId, active.world_id, "exp_10")) e = Math.round(e * 1.1);
  const beforeLevel = levelForExp(active.exp);
  const newExp = active.exp + e;
  const newCoins = active.coins + c;
  const afterLevel = levelForExp(newExp);
  const leveledUp = afterLevel > beforeLevel ? { from: beforeLevel, to: afterLevel } : null;
  // Level-up reward is a free mystery drop per gained level, auto-opened by
  // the approve handler (canonical: "your free mystery drop contained X").
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
    leveledUp,
  };
}

/**
 * Localize a potion_templates / module_templates row.
 * Standard programs carry verbatim name_uk/name_es/effect_uk/effect_es;
 * custom parent programs stay single-language (fallback to base columns).
 * Module rows use bonus_uk/bonus_es for the bonus text.
 */
export function localized(row, lang) {
  const out = { ...row };
  if (lang === "uk" || lang === "es") {
    const s = "_" + lang;
    if (row["name" + s]) out.name = row["name" + s];
    if (row["effect" + s]) out.effect = row["effect" + s];
    if (row["bonus" + s]) out.bonus_text = row["bonus" + s];
  }
  return out;
}

export function langOfChild(childId) {
  return (
    db.prepare("SELECT language FROM children WHERE id = ?").get(childId)?.language || "uk"
  );
}

export function langOfParent(parentId) {
  return (
    db.prepare("SELECT language FROM parents WHERE id = ?").get(parentId)?.language || "uk"
  );
}
