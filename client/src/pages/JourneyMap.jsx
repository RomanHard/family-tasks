import { useEffect, useState } from "react";
import { api } from "../api.js";

const STATUS_UA = { completed: "пройдено", current: "поточний", locked: "закрито" };

// Journey map: 10 tappable level points + the secret ??? point after level 10.
export default function JourneyMap({ world, onBack }) {
  const [data, setData] = useState(null);
  const [modal, setModal] = useState(null); // {kind:'level', point} | {kind:'secret'}

  useEffect(() => {
    api(`/api/worlds/${world.id}/journey`).then(setData).catch(() => {});
  }, [world.id]);

  if (!data) return <p>Завантаження карти…</p>;

  return (
    <div>
      <button onClick={onBack}>← Назад</button>
      <h2>Карта подорожі — {world.name_uk}</h2>
      <p>
        <small>
          Рівень {data.level} • {data.exp} EXP
          {data.maxed ? " • максимум!" : ` • ще ${data.exp_to_next} EXP до рівня ${data.level + 1}`}
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
            title={`Рівень ${p.level} — ${STATUS_UA[p.status]}`}
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

      {modal?.kind === "level" && (
        <Modal onClose={() => setModal(null)}>
          <h3>Рівень {modal.point.level}</h3>
          <p>Поріг: {modal.point.threshold} EXP</p>
          <p>Статус: {STATUS_UA[modal.point.status]}</p>
          {modal.point.bonuses.length > 0 && (
            <ul>
              {modal.point.bonuses.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          )}
        </Modal>
      )}

      {modal?.kind === "secret" && (
        <Modal onClose={() => setModal(null)}>
          <h3>???</h3>
          {data.secret.unlocked ? (
            <p>Ти дійшов до кінця карти. Що тут — поки що таємниця навіть для нас 🤫</p>
          ) : (
            <p>Щось приховане чекає тих, хто пройде всі 10 рівнів…</p>
          )}
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div style={overlay} onClick={onClose}>
      <div style={box} onClick={(e) => e.stopPropagation()}>
        {children}
        <button onClick={onClose} style={{ marginTop: 12 }}>Закрити</button>
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
