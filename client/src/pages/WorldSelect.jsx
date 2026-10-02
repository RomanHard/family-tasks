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
      <div style={{ maxWidth: 420 }}>
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
        {error && <p style={{ color: "crimson" }}>{error}</p>}
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button
            style={btn}
            onClick={() => (isFirstEntry ? confirm() : setTravelWarn(true))}
            disabled={isFirstEntry && !name.trim()}
          >
            {isFirstEntry ? t("startAdventure") : t("continue")}
          </button>
          <button onClick={() => setPicked(null)}>{t("back")}</button>
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
          <button key={w.id} onClick={() => setPicked(w.id)} style={card}>
            <img src={w.art} alt={worldName(w.id, lang)} style={thumb} />
            <div style={{ textAlign: "left" }}>
              <b>{worldName(w.id, lang)}</b>
              <div>
                <small>
                  {w.entered
                    ? `${w.character_name} • ${t("level")} ${w.level} • ${w.exp} EXP`
                    : t("newWorld")}
                </small>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

const hero = { width: "100%", borderRadius: 12, maxHeight: 220, objectFit: "cover" };
const thumb = { width: 72, height: 72, borderRadius: 8, objectFit: "cover" };
const card = {
  display: "flex",
  gap: 12,
  alignItems: "center",
  padding: 8,
  borderRadius: 12,
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
};
const input = { padding: 10, borderRadius: 8, border: "1px solid #ccc", fontSize: 16, width: "100%", boxSizing: "border-box" };
const btn = { padding: "12px 20px", borderRadius: 8, border: "none", background: "#333", color: "#fff", fontSize: 16 };
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
const modalBox = { background: "#fff", borderRadius: 12, padding: 20, maxWidth: 360, width: "100%", maxHeight: "85vh", overflowY: "auto" };
