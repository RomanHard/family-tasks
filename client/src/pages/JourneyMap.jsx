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
  const [sending, setSending] = useState(false);

  const STATUS = { completed: t("stCompleted"), current: t("stCurrent"), locked: t("stLocked") };

  useEffect(() => {
    api(`/api/worlds/${world.id}/journey`).then(setData).catch(() => {});
  }, [world.id]);

  if (!data) return <p>{t("loadingMap")}</p>;

  const askPlus = async () => {
    setSending(true);
    try {
      await api("/api/subscription/request", { method: "POST" });
      setRequested(true);
    } catch {
      /* already requested or offline — stay quiet */
    }
    setSending(false);
  };

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
      {data.plan === "free" && (
        <p><small>Free journey complete · EXP keeps saving for Plus</small></p>
      )}

      <div style={path}>
        {data.points.map((p) => (
          <div key={p.level} style={pointCol}>
            <button
              onClick={() => (p.paywalled
                ? setModal({ kind: "paywall", level: p.level, chapter: p.chapter })
                : setModal({ kind: "level", point: p }))}
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
              {p.paywalled ? "⌁" : p.level}
            </button>
            <small style={rowLabel}>
              {p.level <= 3
                ? t("lmRowEarly", { n: p.level })
                : p.level <= 9
                  ? t("lmRowPlus")
                  : t("lmRowLegend")}
            </small>
            <span style={mapTag}>{p.paywalled ? "PLUS" : "FREE"}</span>
          </div>
        ))}
        <div style={pointCol}>
          <button
            onClick={() => setModal({ kind: "secret" })}
            style={{ ...dot, ...dotSecret }}
            title="???"
          >
            ???
          </button>
        </div>
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

      {modal?.kind === "level" && modal.point.chapter && (
        <Modal onClose={() => setModal(null)}>
          <p style={insideChrome}>{t("lmInside", { n: modal.point.level })}</p>
          <h3 style={{ marginTop: 0 }}>
            {t("lmTitle", { n: modal.point.level, title: modal.point.chapter.title })}
          </h3>
          <p>
            <span style={modal.point.status === "locked" ? pillLocked : pillUnlocked}>
              {modal.point.status === "locked"
                ? t("lmLocked", { n: modal.point.threshold })
                : t("lmUnlocked")}
            </span>
          </p>
          <p>✓ {modal.point.chapter.unlock}</p>
          <p style={{ lineHeight: 1.5 }}>{modal.point.chapter.scene}</p>
          <p>
            <b>{t("lmMissionWord")}:</b> {modal.point.chapter.mission}
          </p>
          <hr style={{ margin: "12px 0" }} />
          <p>
            <span style={pillChest}>{t("lmPill", { m: modal.point.potions.length })}</span>{" "}
            {t(`lmChestLine_${world.id}`, { m: modal.point.potions.length })}
          </p>
          <h4 style={{ marginBottom: 4 }}>{t(`lmChestName_${world.id}`)}</h4>
          <p>
            <small>{t(`lmChestHint_${world.id}`, { n: modal.point.level })}</small>
          </p>
          {modal.point.potions.length > 0 ? (
            <ul style={{ paddingLeft: 18, margin: "8px 0" }}>
              {modal.point.potions.map((b, i) => (
                <li key={i} style={{ marginBottom: 6 }}>
                  <b>{b.name}</b> — {b.effect} <small>({b.price})</small>
                </li>
              ))}
            </ul>
          ) : (
            <p><small>{t("lmEmpty")}</small></p>
          )}
        </Modal>
      )}

      {modal?.kind === "paywall" && (
        <Modal onClose={() => setModal(null)} closeLabel={t("pwKeepFree")}>
          <p style={{ marginTop: 0 }}><span style={plusTag}>FAMILY TASKS PLUS</span></p>
          <h3 style={{ marginTop: 8 }}>{t("pwStoryGoesOn")}</h3>
          <p>{t("pwBody")}</p>
          {modal.chapter && (
            <div style={pwPreview}>
              <p style={{ marginTop: 0 }}>
                <b>{t("pwChapterOf", { n: modal.level, title: modal.chapter.title })}</b>
              </p>
              <p style={{ lineHeight: 1.5 }}>{modal.chapter.scene}</p>
              <p style={{ marginBottom: 0 }}>
                <b>{t("lmMissionWord")}:</b> {modal.chapter.mission}
              </p>
            </div>
          )}
          {requested ? (
            <p><b>{t("pwSent")}</b></p>
          ) : (
            <button onClick={askPlus} style={btnPrimary} disabled={sending}>
              {sending ? t("pwSending") : t("pwAskParent")}
            </button>
          )}
        </Modal>
      )}

      {modal?.kind === "secret" && (
        <Modal onClose={() => setModal(null)} closeLabel={t("scBack")}>
          <h3 style={{ marginTop: 0 }}>{t("scTitle")}</h3>
          <p><small style={kicker}>{t("scKicker")}</small></p>
          <p>{t("scL1")}</p>
          <p>{t("scL2")}</p>
          <p>{t("scL3")}</p>
          <p><small>🔒 {t("scHidden")}</small></p>
          <p><small>{t("scLater")}</small></p>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose, closeLabel }) {
  const { t } = useLang();
  return (
    <div style={overlay} onClick={onClose}>
      <div style={box} onClick={(e) => e.stopPropagation()}>
        {children}
        <button onClick={onClose} style={{ marginTop: 12 }}>{closeLabel || t("close")}</button>
      </div>
    </div>
  );
}

const path = { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16 };
const plusTag = {
  display: "inline-block",
  fontSize: 11,
  fontWeight: "bold",
  letterSpacing: 1,
  padding: "4px 10px",
  borderRadius: 999,
  background: "#6a1b9a",
  color: "#fff",
};
const mapTag = {
  fontSize: 9,
  fontWeight: "bold",
  letterSpacing: 1,
  marginTop: 2,
  padding: "1px 7px",
  borderRadius: 999,
  border: "1px solid #cbd7e6",
  background: "#eef2f8",
  color: "#607089",
};
const pwPreview = {
  border: "1px dashed #c9a0dc",
  borderRadius: 10,
  padding: 12,
  background: "#faf5ff",
  margin: "12px 0",
};
const pointCol = { display: "flex", flexDirection: "column", alignItems: "center", width: 76 };
const rowLabel = { textAlign: "center", marginTop: 4, color: "#607089", lineHeight: 1.3 };
const insideChrome = { margin: "0 0 4px", fontSize: 13, color: "#607089" };
const kicker = { letterSpacing: 1, color: "#9c27b0", fontWeight: "bold" };
const pillUnlocked = {
  display: "inline-block", fontSize: 12, fontWeight: "bold",
  background: "#e8f5e9", color: "#2e7d32", border: "1px solid #2e7d32",
  borderRadius: 20, padding: "3px 10px",
};
const pillLocked = {
  display: "inline-block", fontSize: 12, fontWeight: "bold",
  background: "#f5f5f5", color: "#607089", border: "1px solid #ccc",
  borderRadius: 20, padding: "3px 10px",
};
const pillChest = {
  display: "inline-block", fontSize: 12, fontWeight: "bold",
  background: "#fff8e1", color: "#7a5c00", border: "1px solid #f5b82e",
  borderRadius: 20, padding: "3px 10px",
};
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
const box = { background: "#fff", borderRadius: 12, padding: 20, maxWidth: 320, width: "100%", maxHeight: "85vh", overflowY: "auto" };
const btnPrimary = { padding: "10px 18px", borderRadius: 8, border: "none", background: "#9c27b0", color: "#fff", fontSize: 15 };
