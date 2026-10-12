import { useState } from "react";
import { api } from "../api.js";
import { useLang } from "../lang.jsx";
import { worldName } from "../i18n.js";
import IntroVideo from "./IntroVideo.jsx";

// First entry or world switching. On first entry the child also names their character.
export default function WorldSelect({ worlds, switchArt, onDone }) {
  const { t, lang } = useLang();
  const [picked, setPicked] = useState(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [video, setVideo] = useState(null);
  const [travelWarn, setTravelWarn] = useState(false);

  const selected = worlds.find((w) => w.id === picked);
  const isFirstEntry = selected && !selected.entered;

  const confirm = async () => {
    setError("");
    try {
      const r = await api("/api/worlds/select", {
        method: "POST",
        body: { world_id: picked, character_name: name },
      });
      // backstory cartoon plays on first entry into each world
      if (r.firstEntry) setVideo(r.world);
      else onDone({ firstEntry: false, worldId: picked });
    } catch (e) {
      setError(e.message);
    }
  };

  if (picked && selected) {
    return (
      <div style={detailCard}>
        {video && <IntroVideo videos={video.videos} onDone={() => onDone({ firstEntry: true, worldId: picked })} />}
        <img src={selected.art} alt={worldName(selected.id, lang)} style={hero} />
        <h2>{worldName(selected.id, lang)}</h2>
        {isFirstEntry ? (
          <>
            <p>{t("nameHero")}</p>
            <input
              style={input}
              placeholder={t("charNamePh")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
            />
          </>
        ) : (
          <p>
            {t("continue")}: «{selected.character_name}»? {t("level")} {selected.level}, {selected.exp} EXP.
          </p>
        )}
        {error && <p style={{ color: "var(--danger)", fontWeight: 600 }}>{error}</p>}
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button
            style={btn}
            onClick={() => (isFirstEntry ? confirm() : setTravelWarn(true))}
            disabled={isFirstEntry && !name.trim()}
          >
            {isFirstEntry ? t("startAdventure") : t("continue")}
          </button>
          <button onClick={() => setPicked(null)} style={{ padding: "12px 18px", fontSize: 16 }}>{t("back")}</button>
        </div>
        {travelWarn && (
          <div style={overlay} onClick={() => setTravelWarn(false)}>
            <div style={modalBox} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ marginTop: 0 }}>🔄 {t("travelTitle")}</h3>
              <p>{t("travelBody")}</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button onClick={() => setTravelWarn(false)}>{t("cancel")}</button>
                <button
                  style={btn}
                  onClick={() => {
                    setTravelWarn(false);
                    confirm();
                  }}
                >
                  {t("travelConfirm")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h2>{t("chooseWorld")}</h2>
      {switchArt && <img src={switchArt} alt="" style={{ ...hero, maxHeight: 160 }} />}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {worlds.map((w) => (
          <button key={w.id} onClick={() => setPicked(w.id)} style={worldCard(w.id)}>
            <img src={w.art} alt={worldName(w.id, lang)} style={thumb} />
            <div style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
              <b style={{ fontSize: 17 }}>{worldName(w.id, lang)}</b>
              <div>
                <small style={{ color: "rgba(255,255,255,0.85)" }}>
                  {w.entered
                    ? `${w.character_name} • ${t("level")} ${w.level} • ${w.exp} EXP`
                    : t("newWorld")}
                </small>
              </div>
            </div>
            <span style={{ fontSize: 22, fontWeight: 800, opacity: 0.9 }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

const hero = {
  width: "100%",
  borderRadius: 16,
  maxHeight: 230,
  objectFit: "cover",
  boxShadow: "0 10px 24px rgba(23, 34, 56, 0.18)",
};
const thumb = { width: 84, height: 84, borderRadius: 14, objectFit: "cover", flexShrink: 0 };
const detailCard = {
  maxWidth: 440,
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  boxShadow: "var(--shadow)",
  padding: 16,
};
// Canonical world-select card colors (docs/content-extract/themes-misc.md):
// deep branded cards with white text; the art thumb sits on the left.
const worldCard = (id) => ({
  display: "flex",
  gap: 14,
  alignItems: "center",
  padding: 12,
  borderRadius: 20,
  border: "1px solid transparent",
  background:
    id === "pirates"
      ? "#124c51"
      : id === "space"
        ? "linear-gradient(135deg, #142b3d, #1b536b)"
        : "#a64f61",
  color: "#fff",
  cursor: "pointer",
  textAlign: "left",
  boxShadow: "0 14px 30px rgba(20, 30, 50, 0.25)",
});
const input = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1.5px solid var(--border)",
  background: "var(--surface)",
  fontSize: 16,
  width: "100%",
  boxSizing: "border-box",
};
const btn = {
  padding: "13px 22px",
  borderRadius: 12,
  border: "none",
  background: "var(--accent)",
  color: "var(--on-accent)",
  fontSize: 16,
  fontWeight: 700,
  boxShadow: "0 8px 18px color-mix(in srgb, var(--accent) 28%, transparent)",
};
const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  zIndex: 50,
};
const modalBox = {
  background: "var(--surface)",
  color: "var(--text)",
  border: "1px solid var(--border)",
  borderRadius: 20,
  padding: 22,
  maxWidth: 360,
  width: "100%",
  maxHeight: "85vh",
  overflowY: "auto",
  boxShadow: "var(--shadow)",
};
