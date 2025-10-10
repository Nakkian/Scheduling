import { useState } from "react";

function apiBase(){
  const base = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/+$/,"");
  const prefix = (import.meta.env.VITE_API_PREFIX || "/api").replace(/\/+$/,"");
  return base + prefix;
}

export default function Health(){
  const [res,setRes] = useState(null);
  const [err,setErr] = useState("");
  const [loading,setLoading] = useState(false);

  async function ping(){
    setErr(""); setRes(null); setLoading(true);
    try{
      const r = await fetch(apiBase()+"/health/ping");
      if(!r.ok) throw new Error(`HTTP ${r.status}`);
      setRes(await r.json());
    }catch(e){ setErr(String(e)); }
    finally{ setLoading(false); }
  }

  return (
    <section className="page-health">
      <div className="centered-page glass card stack" style={{maxWidth:640}}>
        <h2>Health Check</h2>
        <p className="small">Verify frontend ↔ API connectivity.</p>
        <div className="row gap">
          <button className="btn-glass btn-pill btn-ok" onClick={ping} disabled={loading}>
            {loading ? "Pinging…" : "Ping /health/ping"}
          </button>
        </div>
        {res && <pre style={{margin:0, overflow:"auto"}}>{JSON.stringify(res,null,2)}</pre>}
        {err && <p className="error">{err}</p>}
      </div>
    </section>
  );
}