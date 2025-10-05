import { useState } from "react";
import { apiFetch } from "../api";

export default function Schedules() {
  const [dept, setDept] = useState("ABOVE");
  const [job, setJob] = useState("RD2AGT");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [count, setCount] = useState(3);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState(null);

  async function run() {
    setErr(null); setResult(null);
    try {
      const res = await apiFetch("/schedules/auto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots: [{ dept, job_code: job, start_time: start, end_time: end, count: Number(count) }] })
      });
      setResult(await res.json());
    } catch (e) { setErr(String(e)); }
  }

  return (
    <section className="container section-glow">
      <div className="glass card stack">
        <h2>Auto-Schedule</h2>
        <div className="grid-3">
          <label>Dept
            <select value={dept} onChange={e=>setDept(e.target.value)}>
              <option value="ABOVE">Above Wing</option>
              <option value="BELOW">Below Wing</option>
            </select>
          </label>
          <label>Job Code
            <input value={job} onChange={e=>setJob(e.target.value)} placeholder="RD2AGT" />
          </label>
          <div></div>
          <label>Start
            <input type="datetime-local" value={start} onChange={e=>setStart(e.target.value)} />
          </label>
          <label>End
            <input type="datetime-local" value={end} onChange={e=>setEnd(e.target.value)} />
          </label>
          <label>Count
            <input type="number" min="1" value={count} onChange={e=>setCount(e.target.value)} />
          </label>
        </div>
        <div className="row gap">
          <button className="btn" onClick={run}>Generate</button>
          {err && <span className="error">{err}</span>}
        </div>
        {result && (
          <div className="glass card" style={{marginTop:12}}>
            <pre style={{maxWidth:"100%", overflow:"auto", margin:0}}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </section>
  );
}
