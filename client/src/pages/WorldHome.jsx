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
            <button onClick={saveName} className="btn-primary btn-sm">OK</button>
            <button onClick={() => { setRenaming(false); setName(world.character_name); }} className="btn-icon">✕</button>
          </>
        ) : (
          <>
            <h2 style={{ margin: 0, fontSize: 24 }}>{world.character_name}</h2>
            <button onClick={() => setRenaming(true)} title={t("edit")} className="btn-icon">✏️</button>
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
        <button onClick={onJourney} style={navBtn}>🗺 {t("journey")}</button>
        <button onClick={() => setReplay(true)} style={navBtn}>🎬 {t("watchIntro")}</button>
        <button onClick={onTour} style={navBtn}>🧭 {t("tourReplay")}</button>
        <button onClick={onSwitchWorld} style={navBtn}>🔄 {t("switchWorld")}</button>
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

const hero = {
  width: "100%",
  borderRadius: 20,
  maxHeight: 210,
  objectFit: "cover",
  boxShadow: "var(--shadow)",
};
const input = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1.5px solid var(--border)",
  background: "var(--surface)",
  fontSize: 16,
  minWidth: 0,
};
const btn = {
  padding: "13px 22px",
  borderRadius: 12,
  border: "none",
  background: "var(--accent)",
  color: "var(--on-accent)",
  fontSize: 16,
  fontWeight: 700,
  boxShadow: "0 8px 18px color-mix(in srgb, var(--accent) 30%, transparent)",
};
const navBtn = { padding: "12px 16px", fontSize: 15 };
const barBg = {
  height: 14,
  borderRadius: 999,
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  overflow: "hidden",
  marginTop: 6,
};
const barFill = {
  height: "100%",
  background: "linear-gradient(90deg, var(--accent), var(--accent-2))",
  borderRadius: 999,
  transition: "width 0.5s ease",
};
const msBox = {
  marginTop: 18,
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: 16,
  background: "var(--surface)",
  boxShadow: "var(--shadow)",
};
const msKicker = { margin: "0 0 6px", fontSize: 12, fontWeight: "bold", color: "var(--accent)", letterSpacing: 0.8, textTransform: "uppercase" };
