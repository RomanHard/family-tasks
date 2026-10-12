import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useLang } from "../lang.jsx";
import { worldName, tplName, tplEffect, tplBonus, langKey } from "../i18n.js";

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
          name_uk: "",
          name_es: "",
          effect: "",
          effect_uk: "",
          effect_es: "",
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
              name: p.name || p.name_uk || p.name_es,
              name_uk: p.name_uk,
              name_es: p.name_es,
              effect: p.effect || p.effect_uk || p.effect_es,
              effect_uk: p.effect_uk,
              effect_es: p.effect_es,
              price: p.price,
              in_chest: p.in_chest,
            },
          });
        } else {
          await api(`/api/shop/potions/${p.id}`, {
            method: "PATCH",
            body: {
              name: p.name,
              name_uk: p.name_uk,
              name_es: p.name_es,
              effect: p.effect,
              effect_uk: p.effect_uk,
              effect_es: p.effect_es,
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
          body: { name: m.name, name_uk: m.name_uk, name_es: m.name_es, bonus_text: m.bonus_text, price: m.price },
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
  // Parents edit the name/effect in their own UI language; the other
  // translations of standard programs are preserved untouched.
  const nameKey = langKey("name", lang);
  const effectKey = langKey("effect", lang);
  const chestEffects = potions
    .filter((p) => p.in_chest)
    .map((p) => String(tplEffect(p, lang) || "").trim().toLowerCase())
    .filter(Boolean);
  const dupEffects = new Set(chestEffects).size !== chestEffects.length;
  const coverageOk = inChestCount >= 5 && !dupEffects;

  return (
    <section>
      <h2>{t("setupTitle")}</h2>
      {error && <p style={{ color: "var(--danger)", fontWeight: 600 }}>{error}</p>}
      {saved && <p style={{ color: "var(--success)", fontWeight: 600 }}>{t("savedOk")}</p>}

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
            <small style={level === lv ? planOnActive : lv > 3 ? planPlus : planFree}>{lv > 3 ? "PLUS" : "FREE"}</small>
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
          <p style={{ color: coverageOk ? "var(--success)" : "var(--warn)", fontWeight: 600 }}>
            <small>
              {coverageOk ? t("coverageOk", { n: inChestCount }) : t("coverageWarn", { n: inChestCount })}
            </small>
          </p>
          {dupEffects && chestEffects.length > 0 && (
            <p style={{ color: "var(--warn)" }}><small>{t("dupEffectWarn")}</small></p>
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
                  value={p[nameKey] ?? ""}
                  onChange={(e) => editPotion(p.id, { [nameKey]: e.target.value })}
                  style={{ ...input, flex: 2 }}
                />
                <input
                  placeholder={t("effect")}
                  value={p[effectKey] ?? ""}
                  onChange={(e) => editPotion(p.id, { [effectKey]: e.target.value })}
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
                <button onClick={() => move(p.id, -1)} title="↑" className="btn-icon">↑</button>
                <button onClick={() => move(p.id, 1)} title="↓" className="btn-icon">↓</button>
                <button onClick={() => removePotion(p.id)} title={t("delete")} className="btn-icon">✕</button>
              </div>
            ))}
          <button onClick={addPotion} style={{ marginTop: 8 }}>+ {t("addPotion")}</button>
          {archived.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h4>🗃 {t("archivedTitle")} ({archived.length})</h4>
              {archived.map((p) => (
                <div key={p.id} style={{ ...card, opacity: 0.75 }}>
                  <div style={{ flex: 1 }}>
                    <b>{tplName(p, lang)}</b> <small>— {tplEffect(p, lang)}</small>
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
                value={m[nameKey] ?? ""}
                onChange={(e) => editModule(m.id, { [nameKey]: e.target.value })}
                style={{ ...input, flex: 2 }}
              />
              <small style={{ flex: 3 }}>
                <small>{t("bonusText")}</small>
                <input
                  value={m.bonus_text}
                  onChange={(e) => editModule(m.id, { bonus_text: e.target.value })}
                  style={{ ...input, width: "100%", boxSizing: "border-box" }}
                />
                <small>{tplBonus(m, lang)}</small>
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
        {dirty && <small style={{ color: "var(--warn)", fontWeight: 700 }}>{t("unsaved")}</small>}
      </div>
    </section>
  );
}

const tabs = { display: "flex", gap: 6, flexWrap: "wrap" };
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
const card = {
  display: "flex",
  gap: 8,
  alignItems: "center",
  padding: "10px 12px",
  border: "1px solid var(--border)",
  borderRadius: 14,
  marginBottom: 8,
  flexWrap: "wrap",
  background: "var(--surface)",
  boxShadow: "0 4px 14px rgba(23, 34, 56, 0.05)",
};
const input = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1.5px solid var(--border)",
  fontSize: 14,
  background: "var(--surface)",
  color: "var(--text)",
  minWidth: 0,
};
const btn = {
  padding: "11px 18px",
  borderRadius: 12,
  border: "1.5px solid var(--border)",
  background: "var(--surface)",
  fontWeight: 600,
};
const btnPrimary = {
  ...btn,
  background: "var(--accent)",
  color: "var(--on-accent)",
  border: "1.5px solid transparent",
  fontWeight: 700,
  boxShadow: "0 8px 18px color-mix(in srgb, var(--accent) 28%, transparent)",
};
const planPlus = { fontSize: 10, fontWeight: "bold", color: "#9c27b0" };
const planFree = { fontSize: 10, fontWeight: "bold", color: "var(--success)" };
const planOnActive = { fontSize: 10, fontWeight: "bold", color: "var(--on-accent)", opacity: 0.8 };
