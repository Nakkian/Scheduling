import { useState } from "react";
import { API_BASE, API_PREFIX, apiUrl } from "../api";

export default function Health() {
  const [out, setOut] = useState(null);
  const [err, setErr] = useState(null);
  async function ping() {
    setErr(null); setOut(null);
    try {
      const res = await fetch(apiUrl("/health/ping"));
      if (!res.ok) throw new Error(await res.text());
      setOut(await res.json());
    } catch (e) { setErr(String(e)); }
  }
  return (
    <section className="container section-glow">
      <div className="glass card stack">
        <h2>Health</h2>
        <p className="small"><b>API:</b> {API_BASE}{API_PREFIX}</p>
        <button className="btn" onClick={ping}>Ping /health/ping</button>
        {out && <pre>{JSON.stringify(out, null, 2)}</pre>}
        {err && <p className="error">{err}</p>}
      </div>
    </section>
  );
}
