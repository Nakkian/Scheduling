import { useEffect, useMemo, useState } from "react";

/* Minimal API helpers (same pattern as other pages) */
function apiBase(){
  const base = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/+$/,"");
  const prefix = (import.meta.env.VITE_API_PREFIX || "/api").replace(/\/+$/, "");
  return base + prefix;
}
async function getJSON(p){
  const r = await fetch(apiBase() + p);
  if(!r.ok){ throw new Error(`GET ${p} → ${r.status} ${r.statusText}`); }
  return r.json();
}

const DEPTS = ["", "BELOW", "ABOVE"]; // "" = all

export default function Employees(){
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Filters
  const [dept, setDept] = useState("");
  const [job, setJob] = useState("");
  const [q, setQ] = useState("");

  async function load(){
    setErr(""); setLoading(true);
    try{
      // If your backend supports query params, pass them. If not, fetch all and filter client-side.
      const qs = new URLSearchParams({});
      // Example if your API supports it:
      if (dept) qs.set("dept", dept);
      if (job)  qs.set("job_code", job);
      if (q)    qs.set("q", q);

      const path = "/employees" + (qs.toString() ? `?${qs.toString()}` : "");
      const data = await getJSON(path);
      setEmployees(Array.isArray(data) ? data : (data.items ?? []));
    }catch(e){
      // Fallback: try fetching all if the filtered route isn’t supported
      try{
        const all = await getJSON("/employees");
        setEmployees(Array.isArray(all) ? all : (all.items ?? []));
      }catch(e2){
        setErr(String(e2));
      }
    }finally{
      setLoading(false);
    }
  }

  useEffect(()=>{ load(); /* eslint-disable-next-line */ }, []);

  const filtered = useMemo(()=>{
    let list = employees || [];
    if (dept) list = list.filter(e => (e.dept || "").toUpperCase() === dept);
    if (job)  list = list.filter(e => (e.job_code || "").toUpperCase().includes(job.toUpperCase()));
    if (q){
      const QQ = q.toLowerCase();
      list = list.filter(e =>
        String(e.employee_name || "").toLowerCase().includes(QQ) ||
        String(e.employee_id   || "").toLowerCase().includes(QQ) ||
        String(e.job_code      || "").toLowerCase().includes(QQ)
      );
    }
    return list;
  }, [employees, dept, job, q]);

  return (
    <section className="container-fullscreen">
      <div className="centered-page glass card stack">
        <h2>Employees</h2>

        {/* Filters */}
        <div className="glass card" style={{ padding: 12 }}>
          <div className="row gap" style={{ flexWrap: "wrap" }}>
            <label style={{ minWidth: 160, maxWidth: 220 }}>
              Department
              <select className="glass-select" value={dept} onChange={e=>setDept(e.target.value)}>
                {DEPTS.map(d => <option key={d} value={d}>{d || "All"}</option>)}
              </select>
            </label>

            <label style={{ minWidth: 160, maxWidth: 220 }}>
              Job Code
              <input className="glass-input" placeholder="e.g. RD2AGT"
                value={job} onChange={e=>setJob(e.target.value)} />
            </label>

            <label style={{ minWidth: 220, flex: "1 1 260px" }}>
              Search
              <input className="glass-input" placeholder="Name / ID / Job code"
                value={q} onChange={e=>setQ(e.target.value)} />
            </label>

            <button className="btn-glass btn-pill" onClick={load} disabled={loading}>
              {loading ? "Loading…" : "Reload"}
            </button>
          </div>
        </div>

        {err && <p className="error">{err}</p>}

        {/* Table → mobile cards */}
        <div className="table schedules-table" style={{ marginTop: 6 }}>
          <div className="thead">
            <div className="col-id">ID</div>
            <div className="col-name">Name</div>
            <div className="col-dept">Dept</div>
            <div className="col-cat">Job Code</div>
            <div className="col-time">Base Code</div>
            <div className="col-job">Notes</div>
          </div>

          {filtered.map(e => (
            <div className="trow" key={e.employee_id || e.id}>
              <div className="cell col-id">
                <span className="cell-label">ID</span>
                <span>{e.employee_id ?? e.id ?? "—"}</span>
              </div>
              <div className="cell col-name">
                <span className="cell-label">Name</span>
                <span>{e.employee_name ?? e.name ?? "—"}</span>
              </div>
              <div className="cell col-dept">
                <span className="cell-label">Dept</span>
                <span>{e.dept ?? "—"}</span>
              </div>
              <div className="cell col-cat">
                <span className="cell-label">Job Code</span>
                <span>{e.job_code ?? "—"}</span>
              </div>
              <div className="cell col-time">
                <span className="cell-label">Base Code</span>
                <span>{e.base_job_code ?? "—"}</span>
              </div>
              <div className="cell col-job">
                <span className="cell-label">Notes</span>
                <span>{e.note ?? "—"}</span>
              </div>
            </div>
          ))}

          {!loading && filtered.length === 0 && (
            <div className="trow">
              <div className="cell" style={{ gridColumn: "1 / -1", opacity: .7 }}>
                <span className="cell-label">Status</span>
                <span>No employees match your filters.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}