import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useLang } from "../lang.jsx";
import { worldName } from "../i18n.js";

// Journey map: 10 tappable level points + the secret ??? point after level 10.
export default function JourneyMap({ world, onBack }) {
  const { t, lang } = useLang();
  const [data, setData] = useState(null);
  const [modal, setModal] = useState(null); // {kind:'level', point} | {kind:'secret'}

  const STATUS = { completed: t("stCompleted"), current: t("stCurrent"), locked: t("stLocked") };

  useEffect(() => {
    api(`/api/worlds/${world.id}/journey`).then(setData).catch(() => {});
  }, [world.id]);

  if (!data) return <p>{t("loadingMap")}</p>;

  return (
    <div>
      <button onClick={onBack}>← {t("back")}</button>
      <h2>{t("journey")} — {worldName(world.id, lang)}</h2>
      <p>
        <small>
          {t("level")} {data.level} • {data.exp} EXP
          {data.maxed ? ` • ${t("maxed")}` : ` • ${t("expToNext", { n: data.exp_to_next, l: data.level + 1 })}`}
        </small>
      </p>

      <div style={path}>
        {data.points.map((p) => (
          <button
            key={p.level}
            onClick={() => setModal({ kind: "level", point: p })}
            style={{
              ...dot,
              ...(p.status === "completed" ? dotDone : p.status === "current" ? dotCurrent : dotLocked),
            }}
            title={`${t("level")} ${p.level} — ${STATUS[p.status]}`}
          >
            {p.level}
          </button>
        ))}
        <button
          onClick={() => setModal({ kind: "secret" })}
          style={{ ...dot, ...dotSecret }}
          title="???"
        >
          ???
        </button>
      </div>

      {data.modules.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h3>{t("myModules")}</h3>
          <ul>
            {data.modules.map((m, i) => (
              <li key={i}>
                <b>{m.name}</b> — <small>{m.bonus}</small>
              </li>
            ))}
          </ul>
        </div>
      )}

      {modal?.kind === "level" && (
        <Modal onClose={() => setModal(null)}>
          <h3>{t("level")} {modal.point.level}</h3>
          <p>{t("threshold")} {modal.point.threshold} EXP</p>
          <p>{t("status")} {STATUS[modal.point.status]}</p>
          {modal.point.potions.length > 0 ? (
            <>
              <h4>{t("levelPotions")}</h4>
              <ul>
                {modal.point.potions.map((b, i) => (
                  <li key={i}>
                    <b>{b.name}</b> — {b.effect} <small>({b.price})</small>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p><small>{t("noPotions")}</small></p>
          )}
        </Modal>
      )}

      {modal?.kind === "secret" && (
        <Modal onClose={() => setModal(null)}>
          <h3>???</h3>
          <p>{data.secret.unlocked ? t("secretUnlocked") : t("secretLocked")}</p>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose }) {
  const { t } = useLang();
  return (
    <div style={overlay} onClick={onClose}>
      <div style={box} onClick={(e) => e.stopPropagation()}>
        {children}
        <button onClick={onClose} style={{ marginTop: 12 }}>{t("close")}</button>
      </div>
    </div>
  );
}

const path = { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16 };
const dot = {
  width: 52,
  height: 52,
  borderRadius: "50%",
  border: "2px solid #ccc",
  fontSize: 16,
  fontWeight: "bold",
  cursor: "pointer",
  background: "#fff",
};
const dotDone = { background: "#4caf50", borderColor: "#4caf50", color: "#fff" };
const dotCurrent = { background: "#ffeb3b", borderColor: "#f0ad4e" };
const dotLocked = { opacity: 0.45 };
const dotSecret = { borderStyle: "dashed", borderColor: "#9c27b0", color: "#9c27b0" };
const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  zIndex: 10,
};
const box = { background: "#fff", borderRadius: 12, padding: 20, maxWidth: 320, width: "100%" };
