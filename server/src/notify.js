import { db } from "./db.js";

/**
 * In-app notification. title/body are stored in English as canonical text;
 * the client maps known `type`s to localized strings (see NOTIF i18n).
 * `data` carries template variables as JSON.
 */
export function notify(parentId, { childId = null, type, title, body, data = {} }) {
  db.prepare(
    `INSERT INTO notifications (parent_id, child_id, type, title, body, data)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(parentId, childId, type, title, body, JSON.stringify(data));
}

export function notifyParentOfChild(childId, payload) {
  const row = db.prepare("SELECT parent_id FROM children WHERE id = ?").get(childId);
  if (row) notify(row.parent_id, { childId, ...payload });
}
