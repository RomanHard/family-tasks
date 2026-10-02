import { useCallback, useEffect, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import WorldSelect from "./WorldSelect.jsx";
import WorldHome from "./WorldHome.jsx";
import JourneyMap from "./JourneyMap.jsx";
import Shop from "./Shop.jsx";
import ChildTasks from "./ChildTasks.jsx";

export default function ChildHome() {
  const { user, logout } = useAuth();
  const [worlds, setWorlds] = useState(null);
  const [view, setView] = useState("home"); // home | journey | select | shop
  const [leveledUp, setLeveledUp] = useState(null);

  const load = useCallback(async () => {
    const { worlds } = await api("/api/worlds/mine");
    setWorlds(worlds);
    const active = worlds.find((w) => w.is_active);
    if (active) {
      // celebrate level-ups that happened while the kid was away
      const key = `ft_seen_level_${active.id}`;
      const seen = parseInt(localStorage.getItem(key) || "0", 10);
      if (seen && active.level > seen) {
        setLeveledUp({ from: seen, to: active.level, worldName: active.name_uk });
      }
      localStorage.setItem(key, String(active.level));
    }
  }, []);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  if (!worlds) return <p style={{ padding: 24 }}>Завантаження…</p>;

  const active = worlds.find((w) => w.is_active);

  return (
    <main style={{ fontFamily: "system-ui", maxWidth: 560, margin: "24px auto", padding: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Привіт, {user?.nickname}! 🎮</h1>
        <button onClick={logout}>Вийти</button>
      </header>

      {leveledUp && (
        <div style={celebrate}>
          🎉 Новий рівень! {leveledUp.from} → {leveledUp.to} у світі «{leveledUp.worldName}»
          <button onClick={() => setLeveledUp(null)} style={{ marginLeft: 8 }}>OK</button>
        </div>
      )}

      {!active || view === "select" ? (
        <WorldSelect
          worlds={worlds}
          onDone={() => {
            load().then(() => setView("home"));
          }}
        />
      ) : view === "journey" ? (
        <JourneyMap world={active} onBack={() => setView("home")} />
      ) : view === "shop" ? (
        <Shop world={active} onBack={() => setView("home")} onChanged={load} />
      ) : (
        <>
          <WorldHome
            world={active}
            onJourney={() => setView("journey")}
            onSwitchWorld={() => setView("select")}
            onShop={() => setView("shop")}
            onChanged={load}
          />
          <hr style={{ margin: "24px 0" }} />
          <ChildTasks />
        </>
      )}
    </main>
  );
}

const celebrate = {
  background: "#fff8e1",
  border: "2px solid #ffc107",
  borderRadius: 12,
  padding: 12,
  marginBottom: 16,
  fontWeight: "bold",
};
