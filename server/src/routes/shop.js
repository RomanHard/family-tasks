import { Router } from "express";
import { db } from "../db.js";
import { requireParent, requireChild } from "../auth.js";
import {
  isWorld,
  levelForExp,
  getWorldProgress,
  ensureWorldProgress,
  ownsModule,
  chestPriceFor,
  localized,
  langOfChild,
} from "../game.js";
import { notifyParent } from "../notify.js";

const r = Router();

function parentOf(childId) {
  return db.prepare("SELECT parent_id FROM children WHERE id = ?").get(childId).parent_id;
}

function nickOf(childId) {
  return db.prepare("SELECT nickname FROM children WHERE id = ?").get(childId)?.nickname || "";
}

// ================= PARENT: Game Setup =================

// Potion templates + chest price for one world/level
r.get("/setup", requireParent, (req, res) => {
  const { world_id, level } = req.query;
  if (!isWorld(world_id)) return res.status(400).json({ error: "unknown world" });
  const lv = Math.min(10, Math.max(1, parseInt(level) || 1));
  const potions = db
    .prepare(
      `SELECT * FROM potion_templates
       WHERE parent_id = ? AND world_id = ? AND level = ? AND archived = 0
       ORDER BY sort_order, id`
    )
    .all(req.session.user_id, world_id, lv);
  const archived = db
    .prepare(
      `SELECT * FROM potion_templates
       WHERE parent_id = ? AND world_id = ? AND level = ? AND archived = 1
       ORDER BY sort_order, id`
    )
    .all(req.session.user_id, world_id, lv);
  const chest = db
    .prepare("SELECT price FROM chest_prices WHERE parent_id = ? AND world_id = ? AND level = ?")
    .get(req.session.user_id, world_id, lv);
  res.json({ potions, archived, chest_price: chest ? chest.price : 20 * lv, level: lv, world_id });
});

r.post("/potions", requireParent, (req, res) => {
  const { world_id, level, name, name_uk, name_es, effect, effect_uk, effect_es, price, in_chest } = req.body ?? {};
  if (!isWorld(world_id)) return res.status(400).json({ error: "unknown world" });
  if (!name || !String(name).trim()) return res.status(400).json({ error: "name required" });
  const lv = Math.min(10, Math.max(1, parseInt(level) || 1));
  const maxOrder = db
    .prepare(
      "SELECT COALESCE(MAX(sort_order), -1) AS m FROM potion_templates WHERE parent_id = ? AND world_id = ? AND level = ?"
    )
    .get(req.session.user_id, world_id, lv).m;
  const { lastInsertRowid } = db
    .prepare(
      `INSERT INTO potion_templates
       (parent_id, world_id, level, name, name_uk, name_es, effect, effect_uk, effect_es,
        price, in_chest, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      req.session.user_id,
      world_id,
      lv,
      String(name).trim(),
      String(name_uk || "").trim(),
      String(name_es || "").trim(),
      String(effect || "").trim(),
      String(effect_uk || "").trim(),
      String(effect_es || "").trim(),
      Math.max(0, parseInt(price) || 0),
      in_chest ? 1 : 0,
      maxOrder + 1
    );
  res.json({ ok: true, id: lastInsertRowid });
});

r.patch("/potions/:id", requireParent, (req, res) => {
  const p = db
    .prepare("SELECT * FROM potion_templates WHERE id = ? AND parent_id = ?")
    .get(req.params.id, req.session.user_id);
  if (!p) return res.status(404).json({ error: "potion not found" });
  const { name, name_uk, name_es, effect, effect_uk, effect_es, price, in_chest, sort_order } = req.body ?? {};
  db.prepare(
    `UPDATE potion_templates
     SET name = ?, name_uk = ?, name_es = ?,
         effect = ?, effect_uk = ?, effect_es = ?,
         price = ?, in_chest = ?, sort_order = ?
     WHERE id = ?`
  ).run(
    name !== undefined ? String(name).trim() : p.name,
    name_uk !== undefined ? String(name_uk).trim() : p.name_uk,
    name_es !== undefined ? String(name_es).trim() : p.name_es,
    effect !== undefined ? String(effect).trim() : p.effect,
    effect_uk !== undefined ? String(effect_uk).trim() : p.effect_uk,
    effect_es !== undefined ? String(effect_es).trim() : p.effect_es,
    price !== undefined ? Math.max(0, parseInt(price) || 0) : p.price,
    in_chest !== undefined ? (in_chest ? 1 : 0) : p.in_chest,
    sort_order !== undefined ? parseInt(sort_order) || 0 : p.sort_order,
    p.id
  );
  res.json({ ok: true });
});

r.delete("/potions/:id", requireParent, (req, res) => {
  const p = db
    .prepare("SELECT id FROM potion_templates WHERE id = ? AND parent_id = ?")
    .get(req.params.id, req.session.user_id);
  if (!p) return res.status(404).json({ error: "potion not found" });
  // soft-archive, never hard-delete (restorable from Game Setup)
  db.prepare("UPDATE potion_templates SET archived = 1 WHERE id = ?").run(p.id);
  res.json({ ok: true });
});

r.post("/potions/:id/restore", requireParent, (req, res) => {
  const p = db
    .prepare("SELECT id FROM potion_templates WHERE id = ? AND parent_id = ?")
    .get(req.params.id, req.session.user_id);
  if (!p) return res.status(404).json({ error: "potion not found" });
  db.prepare("UPDATE potion_templates SET archived = 0 WHERE id = ?").run(p.id);
  res.json({ ok: true });
});

r.put("/chest-price", requireParent, (req, res) => {
  const { world_id, level, price } = req.body ?? {};
  if (!isWorld(world_id)) return res.status(400).json({ error: "unknown world" });
  const lv = Math.min(10, Math.max(1, parseInt(level) || 1));
  db.prepare(
    `INSERT INTO chest_prices (parent_id, world_id, level, price) VALUES (?, ?, ?, ?)
     ON CONFLICT(parent_id, world_id, level) DO UPDATE SET price = excluded.price`
  ).run(req.session.user_id, world_id, lv, Math.max(1, parseInt(price) || 1));
  res.json({ ok: true });
});

// Module templates (Game Setup → Modules tab)
r.get("/modules", requireParent, (req, res) => {
  const { world_id } = req.query;
  if (!isWorld(world_id)) return res.status(400).json({ error: "unknown world" });
  const modules = db
    .prepare(
      "SELECT * FROM module_templates WHERE parent_id = ? AND world_id = ? ORDER BY id"
    )
    .all(req.session.user_id, world_id);
  res.json({ modules });
});

r.patch("/modules/:id", requireParent, (req, res) => {
  const m = db
    .prepare("SELECT * FROM module_templates WHERE id = ? AND parent_id = ?")
    .get(req.params.id, req.session.user_id);
  if (!m) return res.status(404).json({ error: "module not found" });
  const { name, name_uk, name_es, price, bonus_text, bonus_uk, bonus_es } = req.body ?? {};
  db.prepare(
    `UPDATE module_templates
     SET name = ?, name_uk = ?, name_es = ?,
         price = ?, bonus_text = ?, bonus_uk = ?, bonus_es = ?
     WHERE id = ?`
  ).run(
    name !== undefined ? String(name).trim() : m.name,
    name_uk !== undefined ? String(name_uk).trim() : m.name_uk,
    name_es !== undefined ? String(name_es).trim() : m.name_es,
    price !== undefined ? Math.max(1, parseInt(price) || 1) : m.price,
    bonus_text !== undefined ? String(bonus_text).trim() : m.bonus_text,
    bonus_uk !== undefined ? String(bonus_uk).trim() : m.bonus_uk,
    bonus_es !== undefined ? String(bonus_es).trim() : m.bonus_es,
    m.id
  );
  res.json({ ok: true });
});

// ================= KID: shop =================

function kidShopData(childId, worldId) {
  const pid = parentOf(childId);
  const lang = langOfChild(childId);
  const prog = ensureWorldProgress(childId, worldId);
  const level = prog.level;
  const potions = db
    .prepare(
      `SELECT * FROM potion_templates
       WHERE parent_id = ? AND world_id = ? AND level = ? AND in_chest = 1 AND archived = 0
       ORDER BY sort_order, id`
    )
    .all(pid, worldId, level);
  const modules = db
    .prepare("SELECT * FROM module_templates WHERE parent_id = ? AND world_id = ? ORDER BY id")
    .all(pid, worldId);
  const owned = new Set(
    db
      .prepare("SELECT module_key FROM purchased_modules WHERE child_id = ? AND world_id = ?")
      .all(childId, worldId)
      .map((x) => x.module_key)
  );
  return {
    coins: prog.coins,
    level,
    free_chests: prog.free_chests,
    chest_price: chestPriceFor(pid, worldId, level, childId),
    potions: potions.map((p) => localized(p, lang)),
    modules: modules.map((m) => ({ ...localized(m, lang), owned: owned.has(m.module_key) })),
  };
}

r.get("/:world_id", requireChild, (req, res) => {
  const { world_id } = req.params;
  if (!isWorld(world_id)) return res.status(400).json({ error: "unknown world" });
  res.json(kidShopData(req.session.user_id, world_id));
});

function spendCoins(childId, worldId, amount) {
  const prog = ensureWorldProgress(childId, worldId);
  if (prog.coins < amount) return false;
  db.prepare("UPDATE child_worlds SET coins = coins - ? WHERE id = ?").run(amount, prog.id);
  return true;
}

r.post("/:world_id/buy-potion/:potion_id", requireChild, (req, res) => {
  const { world_id, potion_id } = req.params;
  if (!isWorld(world_id)) return res.status(400).json({ error: "unknown world" });
  const pid = parentOf(req.session.user_id);
  const prog = ensureWorldProgress(req.session.user_id, world_id);
  const potion = db
    .prepare(
      `SELECT * FROM potion_templates
       WHERE id = ? AND parent_id = ? AND world_id = ? AND level = ? AND in_chest = 1 AND archived = 0`
    )
    .get(potion_id, pid, world_id, prog.level);
  if (!potion) return res.status(404).json({ error: "potion not found" });
  if (!spendCoins(req.session.user_id, world_id, potion.price)) {
    return res.status(400).json({ error: "not enough coins" });
  }
  // inventory keeps the name/effect in the child's language at purchase time
  const lp = localized(potion, langOfChild(req.session.user_id));
  const { lastInsertRowid } = db
    .prepare(
      `INSERT INTO kid_inventory (child_id, world_id, potion_template_id, name, effect)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(req.session.user_id, world_id, potion.id, lp.name, lp.effect);
  notifyParent(req.session.user_id, {
    type: "potion_bought",
    title: "Program bought",
    body: `${nickOf(req.session.user_id)}: ${potion.name} (${potion.price})`,
    data: { nick: nickOf(req.session.user_id), name: potion.name, price: potion.price },
  });
  res.json({ ok: true, id: lastInsertRowid });
});

r.post("/:world_id/open-chest", requireChild, (req, res) => {
  const { world_id } = req.params;
  if (!isWorld(world_id)) return res.status(400).json({ error: "unknown world" });
  const pid = parentOf(req.session.user_id);
  const prog = ensureWorldProgress(req.session.user_id, world_id);

  const potions = db
    .prepare(
      `SELECT * FROM potion_templates
       WHERE parent_id = ? AND world_id = ? AND level = ? AND in_chest = 1 AND archived = 0
       ORDER BY sort_order, id`
    )
    .all(pid, world_id, prog.level);
  if (potions.length === 0) {
    return res.status(400).json({ error: "chest is empty — ask parents to add potions" });
  }

  let usedFree = false;
  if (prog.free_chests > 0) {
    db.prepare("UPDATE child_worlds SET free_chests = free_chests - 1 WHERE id = ?").run(prog.id);
    usedFree = true;
  } else {
    const price = chestPriceFor(pid, world_id, prog.level, req.session.user_id);
    if (!spendCoins(req.session.user_id, world_id, price)) {
      return res.status(400).json({ error: "not enough coins" });
    }
  }

  const drop = potions[Math.floor(Math.random() * potions.length)];
  const ld = localized(drop, langOfChild(req.session.user_id));
  const { lastInsertRowid } = db
    .prepare(
      `INSERT INTO kid_inventory (child_id, world_id, potion_template_id, name, effect)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(req.session.user_id, world_id, drop.id, ld.name, ld.effect);
  notifyParent(req.session.user_id, {
    type: "chest_opened",
    title: "Chest opened",
    body: `Chest dropped: ${ld.name} (${nickOf(req.session.user_id)})`,
    data: { nick: nickOf(req.session.user_id), drop: ld.name },
  });
  res.json({ ok: true, id: lastInsertRowid, drop: { name: ld.name, effect: ld.effect }, usedFree });
});

r.post("/:world_id/buy-module/:key", requireChild, (req, res) => {
  const { world_id, key } = req.params;
  if (!isWorld(world_id)) return res.status(400).json({ error: "unknown world" });
  const pid = parentOf(req.session.user_id);
  const mod = db
    .prepare(
      "SELECT * FROM module_templates WHERE parent_id = ? AND world_id = ? AND module_key = ?"
    )
    .get(pid, world_id, key);
  if (!mod) return res.status(404).json({ error: "module not found" });
  if (ownsModule(req.session.user_id, world_id, key)) {
    return res.status(400).json({ error: "already owned" });
  }
  if (!spendCoins(req.session.user_id, world_id, mod.price)) {
    return res.status(400).json({ error: "not enough coins" });
  }
  db.prepare(
    "INSERT INTO purchased_modules (child_id, world_id, module_key) VALUES (?, ?, ?)"
  ).run(req.session.user_id, world_id, key);
  notifyParent(req.session.user_id, {
    type: "module_bought",
    title: "Module bought",
    body: `${nickOf(req.session.user_id)}: ${mod.name}`,
    data: { nick: nickOf(req.session.user_id), name: mod.name },
  });

  // deadline shield: shift the kid's open tasks with deadlines by +1 day
  if (key === "deadline_1day") {
    db.prepare(
      `UPDATE tasks SET deadline = date(deadline, '+1 day')
       WHERE (child_id = ? OR completed_by = ?) AND deadline != ''
         AND status != 'approved' AND deleted = 0`
    ).run(req.session.user_id, req.session.user_id);
  }
  res.json({ ok: true, module_key: key });
});

r.get("/:world_id/inventory", requireChild, (req, res) => {
  const { world_id } = req.params;
  if (!isWorld(world_id)) return res.status(400).json({ error: "unknown world" });
  const items = db
    .prepare(
      "SELECT * FROM kid_inventory WHERE child_id = ? AND world_id = ? ORDER BY used, id DESC"
    )
    .all(req.session.user_id, world_id);
  res.json({ items });
});

r.post("/inventory/:id/use", requireChild, (req, res) => {
  const item = db
    .prepare("SELECT * FROM kid_inventory WHERE id = ? AND child_id = ?")
    .get(req.params.id, req.session.user_id);
  if (!item) return res.status(404).json({ error: "item not found" });
  if (item.used) return res.status(400).json({ error: "already used" });
  db.prepare("UPDATE kid_inventory SET used = 1 WHERE id = ?").run(item.id);
  notifyParent(req.session.user_id, {
    type: "potion_used",
    title: "Program started",
    body: `${nickOf(req.session.user_id)}: ${item.name}`,
    data: { nick: nickOf(req.session.user_id), name: item.name },
  });
  res.json({ ok: true });
});

export default r;
