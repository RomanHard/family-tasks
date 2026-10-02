import { db } from "./db.js";

// ---- default level-1 potions: 5 approved + 5 backups (per world) ----
// Parents can edit/reorder/delete/add via Game Setup.
const POTIONS = [
  // [name, effect, price, in_chest]
  ["Батьки 30 хвилин без телефонів", "Батьки 30 хвилин не беруть телефони до рук", 30, 1],
  ["30 хвилин невидимки", "Дитину 30 хвилин ніхто не чіпає і не дає завдань", 25, 1],
  ["Дитина обирає вечерю", "Сьогодні вечеря — на вибір дитини", 20, 1],
  ["+30 хвилин до сну", "Сьогодні можна лягти спати на 30 хвилин пізніше", 20, 1],
  ["Будиночок з ковдр", "Будуємо будиночок з ковдр (місце обирають батьки)", 35, 1],
  ["Додаткова казка", "Ще одна казка перед сном", 15, 0],
  ["Дитина обирає сніданок", "Завтра сніданок — на вибір дитини", 15, 0],
  ["Гра на вибір дитини", "30 хвилин гри з батьками — гру обирає дитина", 25, 0],
  ["Кіновечір", "Сімейний кіновечір з попкорном", 30, 0],
  ["Вихідний від завдання", "Одне завдання можна пропустити без наслідків", 40, 0],
];

const MODULES = [
  // [key, name_uk per world, bonus_text, price]
  ["coins_10", {
    pirates: "Золотий компас", space: "Сонячні панелі", dollhouse: "Скарбничка",
  }, "+10% монет за кожне завдання", 150],
  ["deadline_1day", {
    pirates: "Попутний вітер", space: "Ремонтний дрон", dollhouse: "Домовичок",
  }, "+1 день до дедлайну завдань", 120],
  ["bedtime_30", {
    pirates: "Ліхтар капітана", space: "Нічний режим", dollhouse: "Затишна лампа",
  }, "+30 хв до сну у п'ятницю та суботу", 100],
  ["exp_10", {
    pirates: "Карта скарбів", space: "Гіпердвигун", dollhouse: "Сімейний альбом",
  }, "+10% EXP за кожне завдання", 150],
  ["chest_discount_20", {
    pirates: "Торг з капітаном", space: "Знижка в доку", dollhouse: "Блошиний ринок",
  }, "−20% ціни скринь", 120],
];

const WORLDS = ["pirates", "space", "dollhouse"];

export function seedParent(parentId) {
  const has = db
    .prepare("SELECT id FROM potion_templates WHERE parent_id = ? LIMIT 1")
    .get(parentId);
  if (has) return; // already seeded

  const insPotion = db.prepare(
    `INSERT INTO potion_templates
     (parent_id, world_id, level, name, effect, price, in_chest, sort_order)
     VALUES (?, ?, 1, ?, ?, ?, ?, ?)`
  );
  for (const worldId of WORLDS) {
    POTIONS.forEach(([name, effect, price, inChest], i) => {
      insPotion.run(parentId, worldId, name, effect, price, inChest, i);
    });
  }

  const insChest = db.prepare(
    "INSERT INTO chest_prices (parent_id, world_id, level, price) VALUES (?, ?, ?, ?)"
  );
  for (const worldId of WORLDS) {
    for (let level = 1; level <= 10; level++) {
      insChest.run(parentId, worldId, level, 20 * level);
    }
  }

  const insModule = db.prepare(
    `INSERT INTO module_templates
     (parent_id, world_id, module_key, name, bonus_text, price)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  for (const worldId of WORLDS) {
    for (const [key, names, bonus, price] of MODULES) {
      insModule.run(parentId, worldId, key, names[worldId], bonus, price);
    }
  }
}
