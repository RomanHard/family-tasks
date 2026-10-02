import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useLang } from "../lang.jsx";
import { notifText } from "../i18n.js";

// In-app notifications bell with unread badge; opening the list marks all read.
export default function NotifBell() {
  const { t, lang } = useLang();
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const r = await api("/api/notifications");
    setItems(r.notifications);
    setUnread(r.unread);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      try {
        await load();
        await api("/api/notifications/read", { method: "POST" });
      } catch {
        /* offline — show what we have */
      }
      setUnread(0);
      setItems((xs) => xs.map((x) => ({ ...x, read: 1 })));
    }
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button onClick={toggle} title={t("notifs")} style={bellBtn} aria-label={t("notifs")}>
        🔔
        {unread > 0 && <span style={badge}>{unread > 99 ? "99+" : unread}</span>}
      </button>
      {open && (
        <div style={overlay} onClick={() => setOpen(false)}>
          <div style={box} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0 }}>{t("notifs")}</h3>
              <button onClick={() => setOpen(false)}>✕</button>
            </div>
            <div style={{ maxHeight: 320, overflowY: "auto", marginTop: 8 }}>
              {items.length === 0 && <p><small>{t("noNotifs")}</small></p>}
              {items.map((n) => {
                const { title, body } = notifText(lang, n);
                return (
                  <div key={n.id} style={{ ...row, opacity: n.read ? 0.7 : 1 }}>
                    <div><b>{title}</b></div>
                    <div><small>{body}</small></div>
                    <div><small style={{ color: "#888" }}>{String(n.created_at).slice(0, 16).replace("T", " ")}</small></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const bellBtn = {
  position: "relative",
  fontSize: 20,
  padding: "6px 10px",
  borderRadius: 8,
  border: "1px solid #ccc",
  background: "#fff",
  cursor: "pointer",
};
const badge = {
  position: "absolute",
  top: -6,
  right: -6,
  background: "#d32f2f",
  color: "#fff",
  borderRadius: 10,
  fontSize: 11,
  fontWeight: "bold",
  padding: "1px 6px",
  minWidth: 18,
  textAlign: "center",
};
const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  padding: 16,
  paddingTop: 64,
  zIndex: 50,
};
const box = { background: "#fff", borderRadius: 12, padding: 16, maxWidth: 380, width: "100%" };
const row = { padding: "8px 0", borderBottom: "1px solid #eee" };
