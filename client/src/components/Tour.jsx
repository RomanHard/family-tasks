import { useEffect, useState } from "react";

// Guided tour overlay. Behavior mirrors the original:
// - fixed screen: body scroll is locked while the tour is open
// - Skip / Back / Next buttons, final step gets a "start" label
// - brief "transition" state between steps (used for auto tab-switching)
// Props: steps [{title, body}], stepOf(n,total), ariaLabel(n,total),
// skipLabel, backLabel, nextLabel, startLabel, transitionLabel,
// onStepChange(idx) (optional, e.g. auto-switch tabs), onDone().
export default function Tour({
  steps,
  stepOf,
  ariaLabel,
  skipLabel,
  backLabel,
  nextLabel,
  startLabel,
  transitionLabel,
  onStepChange,
  onDone,
}) {
  const [idx, setIdx] = useState(0);
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    if (onStepChange) onStepChange(idx);
    // run once per step change only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  const go = (n) => {
    if (n < 0 || n >= steps.length) return;
    setMoving(true);
    setTimeout(() => {
      setIdx(n);
      setMoving(false);
    }, 450);
  };

  const last = idx === steps.length - 1;
  const step = steps[idx];

  return (
    <div style={overlay} role="dialog" aria-label={ariaLabel(idx + 1, steps.length)}>
      <div style={card}>
        {moving ? (
          <p style={{ textAlign: "center", padding: "36px 8px" }}>{transitionLabel}</p>
        ) : (
          <>
            <p style={counter}>{stepOf(idx + 1, steps.length)}</p>
            <h3 style={{ margin: "0 0 8px" }}>{step.title}</h3>
            <p style={{ margin: "0 0 16px", lineHeight: 1.5 }}>{step.body}</p>
            <div style={btnRow}>
              <button onClick={onDone} style={linkBtn}>
                {skipLabel}
              </button>
              <span style={{ flex: 1 }} />
              {idx > 0 && <button onClick={() => go(idx - 1)}>{backLabel}</button>}
              {last ? (
                <button onClick={onDone} style={primaryBtn}>
                  {startLabel}
                </button>
              ) : (
                <button onClick={() => go(idx + 1)} style={primaryBtn}>
                  {nextLabel}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.55)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  zIndex: 100,
};
const card = {
  background: "#fff",
  borderRadius: 14,
  padding: 22,
  maxWidth: 400,
  width: "100%",
  boxShadow: "0 18px 44px rgba(0,0,0,.25)",
};
const counter = { margin: "0 0 6px", fontSize: 13, color: "#607089" };
const btnRow = { display: "flex", gap: 8, alignItems: "center" };
const linkBtn = { background: "none", border: "none", color: "#607089", cursor: "pointer", padding: "8px 4px" };
const primaryBtn = {
  padding: "10px 18px",
  borderRadius: 8,
  border: "none",
  background: "#2457e6",
  color: "#fff",
  fontSize: 15,
  cursor: "pointer",
};
