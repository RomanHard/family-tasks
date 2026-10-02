import { useEffect, useState } from "react";

export default function App() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth({ ok: false }));
  }, []);

  return (
    <main style={{ fontFamily: "system-ui", padding: 24, maxWidth: 640, margin: "0 auto" }}>
      <h1>Family Tasks</h1>
      <p>Scaffold is up. Game phases land here one by one.</p>
      <p>
        API health:{" "}
        <code>{health ? JSON.stringify(health) : "…"}</code>
      </p>
    </main>
  );
}
