import { db } from "./db.js";
import { PROGRAMS, MODULES, moduleBonusText } from "./content/programs.js";

// Canonical seed: 50 standard programs per world (5 per level, levels 1–10)
// with verbatim EN/UK/ES names+effects, canonical prices, in_chest=1,
// plus the 5 canonical modules per world.
// Parents can edit/reorder/archive/add via Game Setup (draft+Save).
// Custom parent programs stay single-language (name_uk/name_es empty → fallback).
const WORLDS = ["pirates", "space", "dollhouse"];

function hasCanonicalSeed(parentId) {
  const row = db
    .prepare("SELECT name_uk FROM potion_templates WHERE parent_id = ? LIMIT 1")
    .get(parentId);
  return !!row && !!row.name_uk;
}

export function seedParent(parentId) {
  const has = db
    .prepare("SELECT id FROM potion_templates WHERE parent_id = ? LIMIT 1")
    .get(parentId);
  if (has && hasCanonicalSeed(parentId)) return; // canonical seed already in place

  // Replace the old level-1-only seed with the canonical one.
  // (kid_inventory keeps its copies via potion_template_id SET NULL.)
  db.prepare("DELETE FROM potion_templates WHERE parent_id = ?").run(parentId);
  db.prepare("DELETE FROM module_templates WHERE parent_id = ?").run(parentId);

  const insPotion = db.prepare(
    `INSERT INTO potion_templates
     (parent_id, world_id, level, name, name_uk, name_es, effect, effect_uk, effect_es,
      price, in_chest, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const worldId of WORLDS) {
    for (let level = 1; level <= 10; level++) {
      PROGRAMS[worldId][level].forEach((p, i) => {
        insPotion.run(
          parentId, worldId, level,
          p.name.en, p.name.uk, p.name.es,
          p.effect.en, p.effect.uk, p.effect.es,
          p.price, 1, i
        );
      });
    }
  }

  const hasChest = db
    .prepare("SELECT parent_id FROM chest_prices WHERE parent_id = ? LIMIT 1")
    .get(parentId);
  if (!hasChest) {
    const insChest = db.prepare(
      "INSERT INTO chest_prices (parent_id, world_id, level, price) VALUES (?, ?, ?, ?)"
    );
    for (const worldId of WORLDS) {
      for (let level = 1; level <= 10; level++) {
        insChest.run(parentId, worldId, level, 20 * level);
      }
    }
  }

  const insModule = db.prepare(
    `INSERT INTO module_templates
     (parent_id, world_id, module_key, name, name_uk, name_es,
      bonus_text, bonus_uk, bonus_es, price)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const worldId of WORLDS) {
    for (const m of MODULES) {
      const nm = m.names[worldId];
      insModule.run(
        parentId, worldId, m.key,
        nm.en, nm.uk, nm.es,
        moduleBonusText(m, "en"), moduleBonusText(m, "uk"), moduleBonusText(m, "es"),
        m.price
      );
    }
  }
}
