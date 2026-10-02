import { useState } from "react";
import { api } from "../api.js";
import { useLang } from "../lang.jsx";
import { worldName, worldCurrency } from "../i18n.js";
import IntroVideo from "./IntroVideo.jsx";

// Active world dashboard: character, level/EXP, currency, navigation.
export default function WorldHome({ world, onJourney, onSwitchWorld, onShop, onChanged }) {
  const { t, lang } = useLang();
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(world.character_name);
  const [replay, setReplay] = useState(false);

  const next = world.exp_to_next;
  const pct = next === 0 ? 100 : Math.round((1 - next / (next + gainedThisLevel(world))) * 100);

  const saveName = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await api("/api/worlds/character", {
      method: "PATCH",
      body: { world_id: world.id, character_name: trimmed },
    });
    setRenaming(false);
    onChanged();
  };

  return (
    <div>
      <img src={world.art} alt={worldName(world.id, lang)} style={hero} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
        {renaming ? (
          <>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
              style={{ ...input, flex: 1 }}
            />
            <button onClick={saveName}>OK</button>
            <button onClick={() => { setRenaming(false); setName(world.character_name); }}>✕</button>
          </>
        ) : (
          <>
            <h2 style={{ margin: 0 }}>{world.character_name}</h2>
            <button onClick={() => setRenaming(true)} title={t("edit")}>✏️</button>
          </>
        )}
      </div>
      <p style={{ margin: "4px 0" }}>
        <b>{worldName(world.id, lang)}</b> • {t("level")} {world.level}
      </p>

      <div style={{ margin: "12px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <small>EXP: {world.exp}</small>
          <small>{next === 0 ? t("maxed") : t("expToNext", { n: next, l: world.level + 1 })}</small>
        </div>
        <div style={barBg}>
          <div style={{ ...barFill, width: `${pct}%` }} />
        </div>
      </div>

      <p>
        💰 {world.coins} {worldCurrency(world.id, lang)}
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button style={btn} onClick={onShop}>🛒 {t("shop")}</button>
        <button onClick={onJourney}>🗺 {t("journey")}</button>
        <button onClick={() => setReplay(true)}>🎬 {t("watchIntro")}</button>
        <button onClick={onSwitchWorld}>🔄 {t("switchWorld")}</button>
      </div>
      {replay && <IntroVideo videos={world.videos} onDone={() => setReplay(false)} />}
    </div>
  );
}

// EXP gained within the current level, for the progress bar.
function gainedThisLevel(world) {
  const thresholds = [0, 40, 100, 180, 280, 400, 550, 730, 940, 1180];
  const base = thresholds[world.level - 1] ?? 0;
  return Math.max(1, world.exp - base + world.exp_to_next);
}

const hero = { width: "100%", borderRadius: 12, maxHeight: 200, objectFit: "cover" };
const input = { padding: 8, borderRadius: 8, border: "1px solid #ccc", fontSize: 16 };
const btn = { padding: "12px 20px", borderRadius: 8, border: "none", background: "#333", color: "#fff", fontSize: 16 };
const barBg = { height: 12, borderRadius: 6, background: "#eee", overflow: "hidden", marginTop: 4 };
const barFill = { height: "100%", background: "#4caf50", borderRadius: 6 };
