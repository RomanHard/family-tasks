import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useLang } from "../lang.jsx";
import { worldName } from "../i18n.js";
import IntroVideo from "./IntroVideo.jsx";

const EXP_THRESHOLDS = [0, 40, 100, 180, 280, 400, 550, 730, 940, 1180];

// Current story chapter mission block (canonical texts from the journey API).
function MissionBlock({ worldId }) {
  const { t } = useLang();
  const [data, setData] = useState(null);

  useEffect(() => {
    api(`/api/worlds/${worldId}/journey`).then(setData).catch(() => {});
  }, [worldId]);

  if (!data || !data.mission || !data.mission.chapter) return null;
  const { mission, arc, plan } = data;
  const ch = mission.chapter;

  if (mission.maxed) {
    return (
      <div style={msBox}>
        <p style={msKicker}>✓</p>
        <h3 style={{ margin: "0 0 6px" }}>{t("msDone10t")}</h3>
        <p style={{ margin: 0 }}>{t("msDone10b")}</p>
      </div>
    );
  }

  if (plan === "free" && mission.level >= 3) {
    return (
      <div style={msBox}>
        <h3 style={{ margin: "0 0 6px" }}>{t("msFreeT")}</h3>
        <p style={{ margin: 0 }}>{t("msFreeB")}</p>
      </div>
    );
  }

  const base = EXP_THRESHOLDS[mission.level - 1] ?? 0;
  const total = EXP_THRESHOLDS[mission.level] ?? base + 1;
  const earned = Math.max(0, data.exp - base);
  const pct = Math.min(100, Math.round((earned / Math.max(1, total - base)) * 100));

  return (
    <div style={msBox}>
      <p style={msKicker}>{t("msKicker", { n: mission.level })}</p>
      <p style={{ margin: "0 0 8px" }}>{t("msLabel", { mission: ch.mission })}</p>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <small>{t("msProgress", { earned, total: total - base })}</small>
        <small>{t("msHint", { n: mission.exp_to_next })}</small>
      </div>
      <div style={barBg}>
        <div style={{ ...barFill, width: `${pct}%` }} />
      </div>
      <p style={{ margin: "8px 0 0" }}>
        <small>🎁 {t("msReward", { drop: arc?.drop || "" })}</small>
      </p>
    </div>
  );
}

// Active world dashboard: character, level/EXP, currency, navigation.
export default function WorldHome({ world, onJourney, onSwitchWorld, onShop, onTour, onChanged }) {
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

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button style={btn} onClick={onShop}>🛒 {t("shop")}</button>
        <button onClick={onJourney}>🗺 {t("journey")}</button>
        <button onClick={() => setReplay(true)}>🎬 {t("watchIntro")}</button>
        <button onClick={onTour}>🧭 {t("tourReplay")}</button>
        <button onClick={onSwitchWorld}>🔄 {t("switchWorld")}</button>
      </div>
      <MissionBlock worldId={world.id} />
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
const msBox = {
  marginTop: 16,
  border: "1px solid #e0d6bd",
  borderRadius: 12,
  padding: 14,
  background: "#fffdf5",
};
const msKicker = { margin: "0 0 6px", fontSize: 12, fontWeight: "bold", color: "#9c27b0", letterSpacing: 0.5 };
