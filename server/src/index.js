import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getDb } from "./db.js";
import authRoutes from "./routes/auth.js";
import childrenRoutes from "./routes/children.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cookieParser());

// ---- API ----
app.get("/api/health", (_req, res) => {
  getDb(); // ensure db opens
  res.json({ ok: true, app: "family-tasks", time: new Date().toISOString() });
});
app.use("/api/auth", authRoutes);
app.use("/api/children", childrenRoutes);

// ---- static client (production) ----
const publicDir = path.join(__dirname, "..", "public");
app.use(express.static(publicDir));
app.get("*", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"), (err) => {
    if (err) res.status(404).json({ error: "not found" });
  });
});

app.listen(PORT, () => {
  console.log(`Family Tasks server on http://localhost:${PORT}`);
});
