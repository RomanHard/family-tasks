import { useLang } from "../lang.jsx";

// World backstory cartoon. Narration: EN/ES only for now (UK UI plays EN).
export default function IntroVideo({ videos, onDone }) {
  const { t, lang } = useLang();
  const src = videos?.[lang === "es" ? "es" : "en"] || videos?.en;
  if (!src) {
    onDone();
    return null;
  }
  return (
    <div style={overlay}>
      <div style={box}>
        <video
          src={src}
          controls
          autoPlay
          playsInline
          style={{ width: "100%", borderRadius: 14, maxHeight: "60vh" }}
        />
        <button onClick={onDone} style={btn}>
          {t("continue")}
        </button>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.75)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  zIndex: 20,
};
const box = { maxWidth: 560, width: "100%", textAlign: "center" };
const btn = {
  marginTop: 14,
  padding: "13px 28px",
  borderRadius: 12,
  border: "none",
  background: "#fff",
  color: "#172238",
  fontSize: 16,
  fontWeight: 700,
  boxShadow: "0 10px 24px rgba(0,0,0,.35)",
};
