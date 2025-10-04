// src/AutoSchedule.jsx
import { useState } from "react";
import { apiUrl } from "./api";

export default function AutoSchedule() {
  const [out, setOut] = useState(null);
  async function run() {
    const res = await fetch(apiUrl(`/schedules/auto`), {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        slots: [
          { dept:"ABOVE", job_code:"RD2AGT", start_time:"2025-10-02T06:00:00", end_time:"2025-10-02T14:00:00", count:3 },
          { dept:"BELOW", job_code:"RAMP1",  start_time:"2025-10-02T07:00:00", end_time:"2025-10-02T15:00:00", count:5 }
        ]
      })
    });
    setOut(await res.json());
  }
  return (
    <div className="card">
      <h3>Auto-Schedule</h3>
      <button onClick={run}>Generate</button>
      {out && <pre style={{textAlign:"left"}}>{JSON.stringify(out,null,2)}</pre>}
    </div>
  );
}