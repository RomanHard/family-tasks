import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import ParentTasks from "./ParentTasks.jsx";

export default function ParentHome() {
  const { user, logout } = useAuth();
  const [kids, setKids] = useState([]);
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    const { children } = await api("/api/children");
    setKids(children);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const addChild = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api("/api/children", { method: "POST", body: { nickname, password } });
      setNickname("");
      setPassword("");
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main style={{ fontFamily: "system-ui", maxWidth: 560, margin: "24px auto", padding: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Кабінет батьків</h1>
        <button onClick={logout}>Вийти</button>
      </header>
      <p>{user?.email}</p>

      <h2>Діти</h2>
      {kids.length === 0 && <p>Поки нікого. Додайте першу дитину:</p>}
      <ul>
        {kids.map((k) => (
          <li key={k.id}>{k.nickname}</li>
        ))}
      </ul>

      <h3>Додати дитину</h3>
      <form onSubmit={addChild} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          placeholder="Нікнейм"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
        />
        <input
          placeholder="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Додати</button>
      </form>
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <ParentTasks kids={kids} />
    </main>
  );
}
