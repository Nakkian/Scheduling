import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const API = import.meta.env.VITE_API_URL; // shown in UI

  async function pingApi() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const base = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
      const prefix = (import.meta.env.VITE_API_PREFIX ?? "/api").replace(/\/+$/, "");
      const url = `${base}${prefix}/health/ping`;
      console.log("Ping URL:", url);

      const res = await fetch(url, { method: "GET" });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${res.statusText} — ${text}`);
      }
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

      <h1>Vite + React</h1>

      <div className="card">
        <button onClick={() => setCount((c) => c + 1)}>count is {count}</button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>

      <hr style={{ margin: "24px 0", opacity: 0.3 }} />

      <div className="card">
        <h2>Frontend ↔ API test</h2>
        <p>API base: <code>{API}</code></p>
        <button onClick={pingApi} disabled={loading}>
          {loading ? "Pinging..." : "Ping /health"}
        </button>

        {result && <pre style={{ textAlign: "left" }}>{JSON.stringify(result, null, 2)}</pre>}
        {error && <p style={{ color: "crimson" }}>Error: {error}</p>}
      </div>

      <p className="read-the-docs">
        Click the logos to learn more. Then build features here.
      </p>
    </>
  );
}

export default App;