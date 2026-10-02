import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useLang } from "../lang.jsx";
import { worldName } from "../i18n.js";

const WORLDS = ["pirates", "space", "dollhouse"];

// Parent Game Setup: potions per world/level + chest price + modules.
// Edits live in a draft until Save; leaving without Save discards everything.
export default function GameSetup() {
  const { t, lang } = useLang();
  const [world, setWorld] = useState("pirates");
  const [level, setLevel] = useState(1);
  const [tab, setTab] = useState("potions");
  const [potions, setPotions] = useState([]);
  const [archived, setArchived] = useState([]);
  const [deletedIds, setDeletedIds] = useState([]);
  const [chestPrice, setChestPrice] = useState(20);
  const [modules, setModules] = useState([]);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const load = async (w = world, lv = level) => {
    const s = await api(`/api/shop/setup?world_id=${w}&level=${lv}`);
    setPotions(s.potions);
    setArchived(s.archived || []);
    setDeletedIds([]);
    setChestPrice(s.chest_price);
    const m = await api(`/api/shop/modules?world_id=${w}`);
    setModules(m.modules);
    setDirty(false);
  };

  useEffect(() => {
    load().catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [world, level]);

  const markDirty = (fn) => {
    fn();
    setDirty(true);
    setSaved(false);
  };

  const editPotion = (id, patch) =>
    markDirty(() => setPotions((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p))));

  const addPotion = () =>
    markDirty(() =>
      setPotions((ps) => [
        ...ps,
        {
          id: `new-${Date.now()}`,
          name: "",
          effect: "",
          price: 10,
          in_chest: 1,
          sort_order: ps.length,
          _new: true,
        },
      ])
    );

  const removePotion = (id) =>
    markDirty(() => {
      setPotions((ps) => ps.filter((p) => p.id !== id));
      const p = potions.find((x) => x.id === id);
      if (p && !p._new) setDeletedIds((d) => [...d, id]);
    });

  const move = (id, dir) =>
    markDirty(() =>
      setPotions((ps) => {
        const arr = [...ps].sort((a, b) => a.sort_order - b.sort_order);
        const i = arr.findIndex((p) => p.id === id);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= arr.length) return ps;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        return arr.map((p, idx) => ({ ...p, sort_order: idx }));
      })
    );

  const save = async () => {
    setError("");
    try {
      for (const id of deletedIds) {
        await api(`/api/shop/potions/${id}`, { method: "DELETE" });
      }
      for (const p of potions) {
        if (p._new) {
          await api("/api/shop/potions", {
            method: "POST",
            body: {
              world_id: world,
              level,
              name: p.name,
              effect: p.effect,
              price: p.price,
              in_chest: p.in_chest,
            },
          });
        } else {
          await api(`/api/shop/potions/${p.id}`, {
            method: "PATCH",
            body: {
              name: p.name,
              effect: p.effect,
              price: p.price,
              in_chest: p.in_chest,
              sort_order: p.sort_order,
            },
          });
        }
      }
      await api("/api/shop/chest-price", {
        method: "PUT",
        body: { world_id: world, level, price: chestPrice },
      });
      for (const m of modules) {
        await api(`/api/shop/modules/${m.id}`, {
          method: "PATCH",
          body: { name: m.name, bonus_text: m.bonus_text, price: m.price },
        });
      }
      setDirty(false);
      setSaved(true);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const discard = () => {
    load().catch((e) => setError(e.message));
  };

  const restorePotion = async (id) => {
    setError("");
    try {
      await api(`/api/shop/potions/${id}/restore`, { method: "POST" });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const editModule = (id, patch) =>
    markDirty(() => setModules((ms) => ms.map((m) => (m.id === id ? { ...m, ...patch } : m))));

  const inChestCount = potions.filter((p) => p.in_chest).length;
  const chestEffects = potions
    .filter((p) => p.in_chest)
    .map((p) => String(p.effect || "").trim().toLowerCase())
    .filter(Boolean);
  const dupEffects = new Set(chestEffects).size !== chestEffects.length;
  const coverageOk = inChestCount >= 5 && !dupEffects;

  return (
    <section>
      <h2>{t("setupTitle")}</h2>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {saved && <p style={{ color: "green" }}>{t("savedOk")}</p>}

      <div style={tabs}>
        {WORLDS.map((w) => (
          <button key={w} onClick={() => setWorld(w)} style={world === w ? tabActive : tabBtn}>
            {worldName(w, lang)}
          </button>
        ))}
      </div>

      <div style={{ ...tabs, marginTop: 8 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lv) => (
          <button key={lv} onClick={() => setLevel(lv)} style={level === lv ? tabActive : tabBtn}>
            {lv}{" "}
            <small style={lv > 3 ? planPlus : planFree}>{lv > 3 ? "PLUS" : "FREE"}</small>
          </button>
        ))}
      </div>

      <div style={{ ...tabs, marginTop: 8 }}>
        <button onClick={() => setTab("potions")} style={tab === "potions" ? tabActive : tabBtn}>
          {t("programs")}
        </button>
        <button onClick={() => setTab("modules")} style={tab === "modules" ? tabActive : tabBtn}>
          {t("modules")}
        </button>
      </div>

      {tab === "potions" && (
        <div>
          <p style={{ color: coverageOk ? "green" : "#b45309" }}>
            <small>
              {coverageOk ? t("coverageOk", { n: inChestCount }) : t("coverageWarn", { n: inChestCount })}
            </small>
          </p>
          {dupEffects && chestEffects.length > 0 && (
            <p style={{ color: "#b45309" }}><small>{t("dupEffectWarn")}</small></p>
          )}
          <label>
            {t("chestPrice")}{" "}
            <input
              type="number"
              min="1"
              value={chestPrice}
              onChange={(e) => markDirty(() => setChestPrice(parseInt(e.target.value) || 1))}
              style={{ width: 80 }}
            />
          </label>
          {potions
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((p) => (
              <div key={p.id} style={card}>
                <input
                  placeholder={t("name")}
                  value={p.name}
                  onChange={(e) => editPotion(p.id, { name: e.target.value })}
                  style={{ ...input, flex: 2 }}
                />
                <input
                  placeholder={t("effect")}
                  value={p.effect}
                  onChange={(e) => editPotion(p.id, { effect: e.target.value })}
                  style={{ ...input, flex: 3 }}
                />
                <label>
                  <small>{t("price")}</small>
                  <input
                    type="number"
                    min="0"
                    value={p.price}
                    onChange={(e) => editPotion(p.id, { price: parseInt(e.target.value) || 0 })}
                    style={{ width: 64 }}
                  />
                </label>
                <label title={t("inChest")}>
                  <small>{t("inChest")}</small>
                  <input
                    type="checkbox"
                    checked={!!p.in_chest}
                    onChange={(e) => editPotion(p.id, { in_chest: e.target.checked ? 1 : 0 })}
                  />
                </label>
                <button onClick={() => move(p.id, -1)} title="↑">↑</button>
                <button onClick={() => move(p.id, 1)} title="↓">↓</button>
                <button onClick={() => removePotion(p.id)} title={t("delete")}>✕</button>
              </div>
            ))}
          <button onClick={addPotion} style={{ marginTop: 8 }}>+ {t("addPotion")}</button>
          {archived.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h4>🗃 {t("archivedTitle")} ({archived.length})</h4>
              {archived.map((p) => (
                <div key={p.id} style={{ ...card, opacity: 0.75 }}>
                  <div style={{ flex: 1 }}>
                    <b>{p.name}</b> <small>— {p.effect}</small>
                  </div>
                  <button onClick={() => restorePotion(p.id)}>♻ {t("restore")}</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "modules" && (
        <div>
          <p><small>{t("modulesHint2")}</small></p>
          {modules.map((m) => (
            <div key={m.id} style={card}>
              <input
                value={m.name}
                onChange={(e) => editModule(m.id, { name: e.target.value })}
                style={{ ...input, flex: 2 }}
              />
              <small style={{ flex: 3 }}>
                <small style={{ color: "#888" }}>{t("bonusText")}</small>
                <input
                  value={m.bonus_text}
                  onChange={(e) => editModule(m.id, { bonus_text: e.target.value })}
                  style={{ ...input, width: "100%", boxSizing: "border-box" }}
                />
              </small>
              <label>
                <small>{t("price")}</small>
                <input
                  type="number"
                  min="1"
                  value={m.price}
                  onChange={(e) => editModule(m.id, { price: parseInt(e.target.value) || 1 })}
                  style={{ width: 70 }}
                />
              </label>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 16, display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={save} disabled={!dirty} style={dirty ? btnPrimary : btn}>
          {t("save")}
        </button>
        <button onClick={discard} disabled={!dirty}>
          {t("discard")}
        </button>
        {dirty && <small style={{ color: "#b45309" }}>{t("unsaved")}</small>}
      </div>
    </section>
  );
}

const tabs = { display: "flex", gap: 6, flexWrap: "wrap" };
const tabBtn = { padding: "8px 12px", borderRadius: 8, border: "1px solid #ccc", background: "#fff" };
const tabActive = { ...tabBtn, background: "#eee", fontWeight: "bold", borderColor: "#333" };
const card = { display: "flex", gap: 8, alignItems: "center", padding: 8, border: "1px solid #eee", borderRadius: 8, marginBottom: 6, flexWrap: "wrap" };
const input = { padding: 8, borderRadius: 6, border: "1px solid #ccc", fontSize: 14 };
const btn = { padding: "10px 18px", borderRadius: 8, border: "1px solid #ccc", background: "#f5f5f5" };
const btnPrimary = { ...btn, background: "#333", color: "#fff", border: "none" };
const planPlus = { fontSize: 10, fontWeight: "bold", color: "#9c27b0" };
const planFree = { fontSize: 10, fontWeight: "bold", color: "#2e7d32" };
