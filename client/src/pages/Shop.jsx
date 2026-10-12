import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useLang } from "../lang.jsx";
import { worldName, worldCurrency } from "../i18n.js";

export default function Shop({ world, onBack, onChanged, initialTab }) {
  const { t, lang } = useLang();
  const [tab, setTab] = useState(initialTab || "programs"); // programs | modules | inventory

  useEffect(() => {
    if (initialTab) setTab(initialTab);
  }, [initialTab]);
  const [data, setData] = useState(null);
  const [items, setItems] = useState([]);
  const [drop, setDrop] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    const d = await api(`/api/shop/${world.id}`);
    setData(d);
    const inv = await api(`/api/shop/${world.id}/inventory`);
    setItems(inv.items);
  };

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [world.id]);

  const act = async (fn) => {
    setError("");
    try {
      const r = await fn();
      await load();
      onChanged && onChanged();
      return r;
    } catch (e) {
      setError(e.message);
    }
  };

  const openChest = () =>
    act(() => api(`/api/shop/${world.id}/open-chest`, { method: "POST" })).then((r) => {
      if (r) setDrop(r.drop);
    });

  if (!data) return <p>{t("loadingShop")}</p>;

  const cur = worldCurrency(world.id, lang);

  return (
    <div>
      <button onClick={onBack}>← {t("back")}</button>
      <h2>{t("shop")} — {worldName(world.id, lang)}</h2>
      <p>
        💰 {data.coins} {cur}
        {data.free_chests > 0 && <span> • 🎁 {data.free_chests}</span>}
      </p>
      {error && <p style={{ color: "var(--danger)", fontWeight: 600 }}>{error}</p>}

      <div style={tabs}>
        {["programs", "modules", "inventory"].map((tb) => (
          <button key={tb} onClick={() => setTab(tb)} style={tab === tb ? tabActive : tabBtn}>
            {tb === "programs" ? t("programs") : tb === "modules" ? t("modules") : `${t("inventory")} (${items.filter((i) => !i.used).length})`}
          </button>
        ))}
      </div>

      {tab === "programs" && (
        <div>
          <div style={chestBox}>
            <h3>🎁 {t("chestTitle", { l: data.level })}</h3>
            <p>{t("chestDesc")}</p>
            <button style={btn} onClick={openChest}>
              {t("openFor")} {data.free_chests > 0 ? t("freeWord") : `${data.chest_price} ${cur}`}
            </button>
          </div>
          {data.potions.length === 0 && <p>{t("noPotionsShop")}</p>}
          {data.potions.map((p) => (
            <div key={p.id} style={row}>
              <div>
                <b>{p.name}</b>
                <div><small>{p.effect}</small></div>
              </div>
              <button
                onClick={() => act(() => api(`/api/shop/${world.id}/buy-potion/${p.id}`, { method: "POST" }))}
                disabled={data.coins < p.price}
              >
                {t("buy")} ({p.price})
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "modules" && (
        <div>
          <p><small>{t("modulesHint")}</small></p>
          {data.modules.map((m) => (
            <div key={m.module_key} style={row}>
              <div>
                <b>{m.name}</b> {m.owned && <span>✅</span>}
                <div><small>{m.bonus_text}</small></div>
              </div>
              {!m.owned && (
                <button
                  onClick={() => act(() => api(`/api/shop/${world.id}/buy-module/${m.module_key}`, { method: "POST" }))}
                  disabled={data.coins < m.price}
                >
                  {t("buy")} ({m.price})
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "inventory" && (
        <div>
          {items.length === 0 && <p>{t("invEmpty")}</p>}
          {items.map((it) => (
            <div key={it.id} style={{ ...row, opacity: it.used ? 0.5 : 1 }}>
              <div>
                <b>{it.name}</b>
                <div><small>{it.effect}</small></div>
              </div>
              {!it.used && (
                <button onClick={() => act(() => api(`/api/shop/inventory/${it.id}/use`, { method: "POST" }))}>
                  {t("use")}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {drop && (
        <div style={overlay} onClick={() => setDrop(null)}>
          <div style={box} onClick={(e) => e.stopPropagation()}>
            <h3>🎉 {t("dropTitle")}</h3>
            <p><b>{drop.name}</b></p>
            <p><small>{drop.effect}</small></p>
            <p><small>{t("addedInv")}</small></p>
            <button onClick={() => setDrop(null)} className="btn-primary">{t("cool")}</button>
          </div>
        </div>
      )}

      <hr style={{ margin: "24px 0" }} />
      <RewardAsk />
    </div>
  );
}

function RewardAsk() {
  const { t } = useLang();
  const [text, setText] = useState("");
  const [mine, setMine] = useState([]);
  const [sent, setSent] = useState(false);

  const load = async () => {
    const r = await api("/api/rewards/mine");
    setMine(r.rewards);
  };
  useEffect(() => {
    load().catch(() => {});
  }, []);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await api("/api/rewards/request", { method: "POST", body: { text: text.trim() } });
      setText("");
      setSent(true);
      setTimeout(() => setSent(false), 3000);
      load().catch(() => {});
    } catch {
      /* offline */
    }
  };

  const st = (s) => (s === "approved" ? t("rwApproved") : s === "declined" ? t("rwDeclined") : t("rwPending"));

  return (
    <section>
      <h3>🎁 {t("rewards")}</h3>
      <form onSubmit={send} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input
          placeholder={t("rewardPh")}
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ flex: 1, padding: "11px 12px", borderRadius: 12, border: "1.5px solid var(--border)", background: "var(--surface)", fontSize: 15, minWidth: 0 }}
          maxLength={300}
        />
        <button type="submit" className="btn-primary">{t("askForOne")}</button>
      </form>
      {sent && <p style={{ color: "var(--success)" }}><small>{t("rewardRequestSent")}</small></p>}
      {mine.length > 0 && (
        <ul>
          {mine.map((r) => (
            <li key={r.id}>
              {r.text} — <small>{st(r.status)}</small>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

const tabs = { display: "flex", gap: 7, margin: "14px 0", flexWrap: "wrap" };
const tabBtn = {
  padding: "9px 14px",
  borderRadius: 999,
  border: "1.5px solid var(--border)",
  background: "var(--surface)",
  fontWeight: 600,
};
const tabActive = {
  ...tabBtn,
  background: "var(--accent)",
  borderColor: "var(--accent)",
  color: "var(--on-accent)",
  fontWeight: 700,
  boxShadow: "0 6px 14px color-mix(in srgb, var(--accent) 26%, transparent)",
};
const row = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
  padding: "12px 14px",
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 14,
  marginBottom: 10,
  flexWrap: "wrap",
  boxShadow: "0 4px 14px rgba(23, 34, 56, 0.05)",
};
const btn = {
  padding: "13px 24px",
  borderRadius: 12,
  border: "none",
  background: "var(--accent-2)",
  color: "#3a2a00",
  fontSize: 16,
  fontWeight: 800,
  boxShadow: "0 8px 18px color-mix(in srgb, var(--accent-2) 38%, transparent)",
};
const chestBox = {
  border: "2px dashed var(--accent-2)",
  borderRadius: "var(--radius)",
  padding: 20,
  marginBottom: 16,
  textAlign: "center",
  background: "color-mix(in srgb, var(--accent-2) 10%, var(--surface))",
};
const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(10, 15, 30, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  zIndex: 10,
};
const box = {
  background: "var(--surface)",
  color: "var(--text)",
  border: "1px solid var(--border)",
  borderRadius: 20,
  padding: 22,
  maxWidth: 320,
  width: "100%",
  textAlign: "center",
  maxHeight: "85vh",
  overflowY: "auto",
  boxShadow: "var(--shadow)",
};
