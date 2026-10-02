import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useLang } from "../lang.jsx";
import { worldName } from "../i18n.js";

// Journey map: 10 tappable level points + the secret ??? point after level 10.
// On the free plan, points 4+ are locked behind the Family Tasks Plus paywall.
export default function JourneyMap({ world, onBack }) {
  const { t, lang } = useLang();
  const [data, setData] = useState(null);
  const [modal, setModal] = useState(null); // {kind:'level', point} | {kind:'secret'} | {kind:'paywall'}
  const [requested, setRequested] = useState(false);

  const STATUS = { completed: t("stCompleted"), current: t("stCurrent"), locked: t("stLocked") };

  useEffect(() => {
    api(`/api/worlds/${world.id}/journey`).then(setData).catch(() => {});
  }, [world.id]);

  if (!data) return <p>{t("loadingMap")}</p>;

  const askPlus = async () => {
    try {
      await api("/api/subscription/request", { method: "POST" });
      setRequested(true);
    } catch {
      /* already requested or offline — stay quiet */
    }
  };

  const planTag = (lv) => (
    <span style={lv > 3 ? tagPlus : tagFree}>{lv > 3 ? "PLUS" : "FREE"}</span>
  );

  return (
    <div>
      <button onClick={onBack}>← {t("back")}</button>
      <h2>{t("journey")} — {worldName(world.id, lang)}</h2>
      <p>
        <small>
          {t("level")} {data.visible_level} • {data.exp} EXP
          {data.maxed ? ` • ${t("maxed")}` : ` • ${t("expToNext", { n: data.exp_to_next, l: data.level + 1 })}`}
        </small>
      </p>

      <div style={path}>
        {data.points.map((p) => (
          <button
            key={p.level}
            onClick={() => (p.paywalled ? setModal({ kind: "paywall" }) : setModal({ kind: "level", point: p }))}
            style={{
              ...dot,
              ...(p.paywalled
                ? dotPaywalled
                : p.status === "completed"
                  ? dotDone
                  : p.status === "current"
                    ? dotCurrent
                    : dotLocked),
            }}
            title={`${t("level")} ${p.level} — ${p.paywalled ? "PLUS" : STATUS[p.status]}`}
          >
            {p.paywalled ? "🔒" : p.level}
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
          <h3>{t("level")} {modal.point.level} {planTag(modal.point.level)}</h3>
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

      {modal?.kind === "paywall" && (
        <Modal onClose={() => setModal(null)}>
          <h3>{t("plusLockedTitle")}</h3>
          <p>{t("plusLockedBody")}</p>
          {requested ? (
            <p><b>{t("plusRequestSent")}</b></p>
          ) : (
            <button onClick={askPlus} style={btnPrimary}>{t("askParents")}</button>
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
const dotPaywalled = { borderStyle: "dashed", borderColor: "#9c27b0", color: "#9c27b0", opacity: 0.8 };
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
const tagPlus = {
  display: "inline-block",
  fontSize: 11,
  fontWeight: "bold",
  background: "#9c27b0",
  color: "#fff",
  borderRadius: 4,
  padding: "2px 6px",
  marginLeft: 8,
  verticalAlign: "middle",
};
const tagFree = {
  display: "inline-block",
  fontSize: 11,
  fontWeight: "bold",
  background: "#e8f5e9",
  color: "#2e7d32",
  border: "1px solid #2e7d32",
  borderRadius: 4,
  padding: "2px 6px",
  marginLeft: 8,
  verticalAlign: "middle",
};
const btnPrimary = { padding: "10px 18px", borderRadius: 8, border: "none", background: "#9c27b0", color: "#fff", fontSize: 15 };
