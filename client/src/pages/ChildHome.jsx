import { useAuth } from "../auth.jsx";

export default function ChildHome() {
  const { user, logout } = useAuth();
  return (
    <main style={{ fontFamily: "system-ui", maxWidth: 560, margin: "24px auto", padding: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Привіт, {user?.nickname}! 🎮</h1>
        <button onClick={logout}>Вийти</button>
      </header>
      <p>Твої світи, завдання і крамниця з'являться тут у наступних фазах.</p>
    </main>
  );
}
