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
          style={{ width: "100%", borderRadius: 8, maxHeight: "60vh" }}
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
const btn = { marginTop: 12, padding: "12px 24px", borderRadius: 8, border: "none", background: "#fff", fontSize: 16 };
