import { useCallback, useEffect, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import { useLang } from "../lang.jsx";
import { worldName } from "../i18n.js";
import WorldSelect from "./WorldSelect.jsx";
import WorldHome from "./WorldHome.jsx";
import JourneyMap from "./JourneyMap.jsx";
import Shop from "./Shop.jsx";
import ChildTasks from "./ChildTasks.jsx";
import NotifBell from "../components/NotifBell.jsx";
import Tour from "../components/Tour.jsx";

// Kid tour: which view each of the 8 steps auto-switches to.
const KID_STEP_VIEWS = [
  { view: "home" }, // 1 character
  { view: "home" }, // 2 current mission
  { view: "shop", tab: "inventory" }, // 3 inventory
  { view: "home" }, // 4 tasks
  { view: "home" }, // 5 journey (world home)
  { view: "journey" }, // 6 ten chapters
  { view: "shop", tab: "programs" }, // 7 shop
  { view: "home" }, // 8 history
];

const tourDoneKey = (worldId) => `ft_tour_done_${worldId}`;

export default function ChildHome() {
  const { user, logout } = useAuth();
  const { t, lang } = useLang();
  const [worlds, setWorlds] = useState(null);
  const [view, setView] = useState("home"); // home | journey | select | shop
  const [shopTab, setShopTab] = useState("programs");
  const [leveledUp, setLeveledUp] = useState(null);
  const [tour, setTour] = useState(false);

  const load = useCallback(async () => {
    const { worlds } = await api("/api/worlds/mine");
    setWorlds(worlds);
    const active = worlds.find((w) => w.is_active);
    if (active) {
      // celebrate level-ups that happened while the kid was away
      const key = `ft_seen_level_${active.id}`;
      const seen = parseInt(localStorage.getItem(key) || "0", 10);
      if (seen && active.level > seen) {
        setLeveledUp({ from: seen, to: active.level, worldId: active.id });
      }
      localStorage.setItem(key, String(active.level));
    }
  }, []);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  if (!worlds) return <p style={{ padding: 24 }}>{t("loading")}</p>;

  const active = worlds.find((w) => w.is_active);

  const kidSteps = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({
    title: t(`kidTour${n}t`),
    body: t(`kidTour${n}b`),
  }));

  const goTourStep = (idx) => {
    const target = KID_STEP_VIEWS[idx];
    if (!target) return;
    setView(target.view);
    if (target.tab) setShopTab(target.tab);
  };

  const startKidTour = () => {
    goTourStep(0);
    setTour(true);
  };

  const finishKidTour = () => {
    if (active) {
      try {
        localStorage.setItem(tourDoneKey(active.id), "1");
      } catch {
        /* private mode */
      }
    }
    setTour(false);
  };

  // First entry into a world: the intro video plays, then the kid tour
  // auto-launches (once per world; completion is persisted).
  const handleWorldDone = (info) => {
    load().then(() => {
      setView("home");
      if (info?.firstEntry && info?.worldId) {
        let done = false;
        try {
          done = !!localStorage.getItem(tourDoneKey(info.worldId));
        } catch {
          /* private mode */
        }
        if (!done) startKidTour();
      }
    });
  };

  return (
    <main style={{ fontFamily: "system-ui", maxWidth: 560, margin: "24px auto", padding: 16 }}>
      {tour && (
        <Tour
          steps={kidSteps}
          stepOf={(n) => t("tourStepOf", { n })}
          ariaLabel={(n) => t("tourAriaKid", { n })}
          skipLabel={t("tourSkip")}
          backLabel={t("tourBack")}
          nextLabel={t("tourNext")}
          startLabel={t("tourStartKid")}
          transitionLabel={t("tourTransition")}
          onStepChange={goTourStep}
          onDone={finishKidTour}
        />
      )}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>{t("hello")} {user?.nickname}! 🎮</h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <NotifBell />
          <button onClick={logout}>{t("logout")}</button>
        </div>
      </header>

      {leveledUp && (
        <div style={celebrate}>
          {t("levelUp", { f: leveledUp.from, t: leveledUp.to, w: worldName(leveledUp.worldId, lang) })}
          <button onClick={() => setLeveledUp(null)} style={{ marginLeft: 8 }}>OK</button>
        </div>
      )}

      {!active || view === "select" ? (
        <WorldSelect worlds={worlds} onDone={handleWorldDone} />
      ) : view === "journey" ? (
        <JourneyMap world={active} onBack={() => setView("home")} />
      ) : view === "shop" ? (
        <Shop world={active} initialTab={shopTab} onBack={() => setView("home")} onChanged={load} />
      ) : (
        <>
          <WorldHome
            world={active}
            onJourney={() => setView("journey")}
            onSwitchWorld={() => setView("select")}
            onShop={() => { setShopTab("programs"); setView("shop"); }}
            onTour={startKidTour}
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
