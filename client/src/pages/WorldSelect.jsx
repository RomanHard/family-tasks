import { useState } from "react";
import { api } from "../api.js";

// First entry or world switching. On first entry the child also names their character.
export default function WorldSelect({ worlds, switchArt, onDone }) {
  const [picked, setPicked] = useState(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const selected = worlds.find((w) => w.id === picked);
  const isFirstEntry = selected && !selected.entered;

  const confirm = async () => {
    setError("");
    try {
      await api("/api/worlds/select", {
        method: "POST",
        body: { world_id: picked, character_name: name },
      });
      onDone();
    } catch (e) {
      setError(e.message);
    }
  };

  if (picked && selected) {
    return (
      <div style={{ maxWidth: 420 }}>
        <img src={selected.art} alt={selected.name_uk} style={hero} />
        <h2>{selected.name_uk}</h2>
        {isFirstEntry ? (
          <>
            <p>Хто буде героєм цього світу? Придумай ім'я персонажа:</p>
            <input
              style={input}
              placeholder="Ім'я персонажа"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
            />
          </>
        ) : (
          <p>
            Повернутись до «{selected.character_name}»? Прогрес збережено: рівень{" "}
            {selected.level}, {selected.exp} EXP.
          </p>
        )}
        {error && <p style={{ color: "crimson" }}>{error}</p>}
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button style={btn} onClick={confirm} disabled={isFirstEntry && !name.trim()}>
            {isFirstEntry ? "Почати пригоду!" : "Продовжити"}
          </button>
          <button onClick={() => setPicked(null)}>Назад</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2>Обери світ</h2>
      {switchArt && <img src={switchArt} alt="" style={{ ...hero, maxHeight: 160 }} />}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {worlds.map((w) => (
          <button key={w.id} onClick={() => setPicked(w.id)} style={card}>
            <img src={w.art} alt={w.name_uk} style={thumb} />
            <div style={{ textAlign: "left" }}>
              <b>{w.name_uk}</b>
              <div>
                <small>
                  {w.entered
                    ? `${w.character_name} • рівень ${w.level} • ${w.coins} ${w.currency_uk}`
                    : `Новий світ • валюта: ${w.currency_uk}`}
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
