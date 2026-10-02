import { useEffect, useState } from "react";
import { api } from "../api.js";

export default function Shop({ world, onBack, onChanged }) {
  const [tab, setTab] = useState("programs"); // programs | modules | inventory
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

  if (!data) return <p>Завантаження крамниці…</p>;

  return (
    <div>
      <button onClick={onBack}>← Назад</button>
      <h2>Крамниця — {world.name_uk}</h2>
      <p>
        💰 {data.coins} {world.currency_uk}
        {data.free_chests > 0 && <span> • 🎁 безкоштовних скринь: {data.free_chests}</span>}
      </p>
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <div style={tabs}>
        {["programs", "modules", "inventory"].map((t) => (
          <button key={t} onClick={() => setTab(t)} style={tab === t ? tabActive : tabBtn}>
            {t === "programs" ? "Програми" : t === "modules" ? "Модулі" : `Інвентар (${items.filter((i) => !i.used).length})`}
          </button>
        ))}
      </div>

      {tab === "programs" && (
        <div>
          <div style={chestBox}>
            <h3>🎁 Містична скриня (рівень {data.level})</h3>
            <p>Одна випадкова програма рівня з колекції нижче.</p>
            <button style={btn} onClick={openChest}>
              Відкрити за {data.free_chests > 0 ? "безкоштовно 🎁" : `${data.chest_price} ${world.currency_uk}`}
            </button>
          </div>
          {data.potions.length === 0 && <p>Поки порожньо — батьки ще додають програми.</p>}
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
                Купити ({p.price})
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "modules" && (
        <div>
          <p><small>Модулі купуються один раз і дають постійний бонус.</small></p>
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
                  Купити ({m.price})
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "inventory" && (
        <div>
          {items.length === 0 && <p>Порожньо. Заглянь до скрині! 🎁</p>}
          {items.map((it) => (
            <div key={it.id} style={{ ...row, opacity: it.used ? 0.5 : 1 }}>
              <div>
                <b>{it.name}</b>
                <div><small>{it.effect}</small></div>
              </div>
              {!it.used && (
                <button onClick={() => act(() => api(`/api/shop/inventory/${it.id}/use`, { method: "POST" }))}>
                  Використати
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {drop && (
        <div style={overlay} onClick={() => setDrop(null)}>
          <div style={box} onClick={(e) => e.stopPropagation()}>
            <h3>🎉 Зі скрині випало:</h3>
            <p><b>{drop.name}</b></p>
            <p><small>{drop.effect}</small></p>
            <p><small>Додано в інвентар!</small></p>
            <button onClick={() => setDrop(null)}>Круто!</button>
          </div>
        </div>
      )}
    </div>
  );
}

const tabs = { display: "flex", gap: 8, margin: "12px 0" };
const tabBtn = { padding: "8px 12px", borderRadius: 8, border: "1px solid #ccc", background: "#fff" };
const tabActive = { ...tabBtn, background: "#eee", fontWeight: "bold", borderColor: "#333" };
const row = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "10px 0", borderBottom: "1px solid #eee" };
const btn = { padding: "12px 20px", borderRadius: 8, border: "none", background: "#333", color: "#fff", fontSize: 16 };
const chestBox = { border: "2px dashed #9c27b0", borderRadius: 12, padding: 16, marginBottom: 16, textAlign: "center" };
const overlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 10 };
const box = { background: "#fff", borderRadius: 12, padding: 20, maxWidth: 320, width: "100%", textAlign: "center" };
