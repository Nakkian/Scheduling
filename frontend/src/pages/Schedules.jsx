import { useEffect, useMemo, useState } from "react";

/* Minimal API helpers */
function apiBase(){
  const base = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/+$/,"");
  const prefix = (import.meta.env.VITE_API_PREFIX || "/api").replace(/\/+$/,"");
  return base + prefix;
}
async function getJSON(p){ const r = await fetch(apiBase()+p); if(!r.ok) throw new Error(await r.text()); return r.json(); }
async function postJSON(p,body){ const r = await fetch(apiBase()+p,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body||{})}); if(!r.ok) throw new Error(await r.text()); return r.json(); }

/* Categories */
const BELOW_CATS = [
  { label: "POA", job_code: "RD2LED" },
  { label: "Ramp Agent", job_code: "RD2AGT" },
  { label: "Bagroom", job_code: "RD2AGT" },
  { label: "Transfers", job_code: "RD2AGT" },
  { label: "Cabin", job_code: "CB2AGT" },
  { label: "Cabin Leads", job_code: "CB2LED" },
  { label: "Supervisors", job_code: "RD2SUP" },
];
const ABOVE_CATS = [
  { label: "Gate", job_code: "AWGATE" },
  { label: "Ticketing", job_code: "AWTICK" },
];

export default function Schedules(){
  const [tab, setTab] = useState("view");
  return (
    <section className="container-fullscreen section-glow">
      <div className="centered-page glass card stack">
        <div className="chip-row" role="tablist" aria-label="Schedules Tabs">
          <button className={`btn-glass btn-pill ${tab==="view"?"is-active":""}`} onClick={()=>setTab("view")}>View</button>
          <button className={`btn-glass btn-pill btn-ok ${tab==="auto"?"is-active":""}`} onClick={()=>setTab("auto")}>Auto-generate</button>
        </div>
        {tab==="view" ? <ViewTab/> : <AutoTab/>}
      </div>
    </section>
  );
}

function ViewTab(){
  const today = new Date().toISOString().slice(0,10);
  const [date,setDate] = useState(today);
  const [dept,setDept] = useState("BELOW");
  const [items,setItems] = useState([]);
  const [summary,setSummary] = useState(null);
  const [activeCats,setActiveCats] = useState(new Set());
  const [loading,setLoading] = useState(false);
  const [err,setErr] = useState("");

  const cats = dept==="BELOW" ? BELOW_CATS : ABOVE_CATS;

  useEffect(()=>{ setActiveCats(new Set(cats.map(c=>c.label))); /* eslint-disable-next-line */ }, [dept]);

  async function load(){
    setErr(""); setLoading(true);
    try{
      const [d1,d2] = await Promise.all([
        getJSON(`/schedules/day?` + new URLSearchParams({date,dept}).toString()),
        getJSON(`/schedules/summary?` + new URLSearchParams({date}).toString()),
      ]);
      setItems(d1?.items ?? d1 ?? []);
      setSummary(d2 ?? null);
    }catch(e){ setErr(String(e)); }
    finally{ setLoading(false); }
  }
  useEffect(()=>{ load(); /* eslint-disable-next-line */}, [date,dept]);

  const filtered = useMemo(()=>{
    if(!items?.length) return [];
    return items.filter(it => activeCats.has(it.category_label));
  }, [items, activeCats]);

  function toggleCat(label){
    const next = new Set(activeCats);
    next.has(label) ? next.delete(label) : next.add(label);
    setActiveCats(next);
  }

  return (
    <div className="stack">
      {/* Filters */}
      <div className="centered-page glass card stack edge-safe" style={{padding:12}}>
        <div className="row gap" style={{flexWrap:"wrap"}}>
          <DeptTabs dept={dept} setDept={setDept}/>
          <label style={{minWidth:180, maxWidth:260, flex:"1 1 220px"}}>
            Date
            <input className="glass-input" type="date" value={date} onChange={e=>setDate(e.target.value)} />
          </label>
          <button className="btn-glass btn-pill" onClick={load} disabled={loading}>
            {loading ? "Loading…" : "Reload"}
          </button>
        </div>

        <div className="chip-row" style={{marginTop:10}}>
          {cats.map(c=>{
            const active = activeCats.has(c.label);
            return (
              <button key={c.label}
                className={`btn-glass btn-pill btn-compact ${active?"is-active":""}`}
                onClick={()=>toggleCat(c.label)} title={c.job_code}>
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {summary && <CountsBar summary={summary}/>}
      {err && <p className="error">{err}</p>}

      {/* Table → Mobile cards */}
      <div className="table schedules-table" style={{marginTop:6}}>
        <div className="thead">
          <div className="col-id">ID</div>
          <div className="col-name">Name</div>
          <div className="col-dept">Dept</div>
          <div className="col-cat">Category</div>
          <div className="col-time">Time</div>
          <div className="col-job">Job</div>
        </div>

        {filtered.map(it=>(
          <div className="trow" key={it.schedule_id ?? `${it.employee_id}-${it.start_time}`}>
            <div className="cell col-id"><span className="cell-label">ID</span><span>{it.schedule_id ?? it.employee_id ?? "—"}</span></div>
            <div className="cell col-name"><span className="cell-label">Name</span><span>{it.employee_name ?? "—"}</span></div>
            <div className="cell col-dept"><span className="cell-label">Dept</span><span>{it.dept ?? "—"}</span></div>
            <div className="cell col-cat"><span className="cell-label">Category</span><span>{it.category_label ?? "—"}</span></div>
            <div className="cell col-time"><span className="cell-label">Time</span><span>{fmt(it.start_time)}–{fmt(it.end_time)}</span></div>
            <div className="cell col-job"><span className="cell-label">Job</span><span title={it.job_code}>{it.job_code ?? "—"}</span></div>
          </div>
        ))}

        {!loading && filtered.length===0 && (
          <div className="trow">
            <div className="cell" style={{gridColumn:"1 / -1", opacity:.7}}>
              <span className="cell-label">Status</span>
              <span>No assignments for selected filters.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DeptTabs({dept,setDept}){
  return (
    <div className="chip-row" role="tablist" aria-label="Department">
      {["BELOW","ABOVE"].map(d=>(
        <button key={d}
          className={`btn-glass btn-pill ${dept===d ? "is-active":""}`}
          aria-selected={dept===d}
          onClick={()=>setDept(d)}>
          {d==="BELOW" ? "Below Wing" : "Above Wing"}
        </button>
      ))}
    </div>
  );
}

function CountsBar({summary}){
  const dmap = Object.fromEntries((summary.by_dept||[]).map(x=>[x.dept,x.count]));
  const total = (summary.by_dept||[]).reduce((a,b)=>a+b.count,0);
  return (
    <div className="glass card row gap" style={{justifyContent:"space-between", alignItems:"center", flexWrap:"wrap"}}>
      <div className="row gap">
        <span className="small">Total:</span> <b>{total}</b>
        <span className="small">Below:</span> <b>{dmap.BELOW||0}</b>
        <span className="small">Above:</span> <b>{dmap.ABOVE||0}</b>
      </div>
      <div className="chip-row">
        {(summary.by_category||[]).map(c=>(
          <span key={c.label+c.job_code} className="small" title={c.job_code}>
            {c.label}: <b>{c.count}</b>
          </span>
        ))}
      </div>
    </div>
  );
}

function AutoTab(){
  const [dept,setDept] = useState("BELOW");
  const [job,setJob] = useState("RD2AGT");
  const [start,setStart] = useState("");
  const [end,setEnd] = useState("");
  const [count,setCount] = useState(3);
  const [result,setResult] = useState(null);
  const [err,setErr] = useState("");
  const [loading,setLoading] = useState(false);

  async function run(){
    setErr(""); setResult(null); setLoading(true);
    try{
      const data = await postJSON("/schedules/auto", {
        slots:[{ dept, job_code:job, start_time:start, end_time:end, count:Number(count) }]
      });
      setResult(data);
    }catch(e){ setErr(String(e)); }
    finally{ setLoading(false); }
  }

  return (
    <div className="stack">
      <div className="glass card" style={{padding:12}}>
        <div className="row gap" style={{flexWrap:"wrap"}}>
          <label style={{minWidth:160, flex:"1 1 180px"}}>
            Dept
            <select className="glass-select" value={dept} onChange={e=>setDept(e.target.value)}>
              <option value="ABOVE">Above Wing</option>
              <option value="BELOW">Below Wing</option>
            </select>
          </label>
          <label style={{minWidth:160, flex:"1 1 200px"}}>
            Job Code
            <input className="glass-input" value={job} onChange={e=>setJob(e.target.value)} placeholder="RD2AGT"/>
          </label>
          <label style={{minWidth:160, flex:"1 1 220px"}}>
            Start
            <input className="glass-input" type="datetime-local" value={start} onChange={e=>setStart(e.target.value)} />
          </label>
          <label style={{minWidth:160, flex:"1 1 220px"}}>
            End
            <input className="glass-input" type="datetime-local" value={end} onChange={e=>setEnd(e.target.value)} />
          </label>
          <label style={{maxWidth:140}}>
            Count
            <input className="glass-input" type="number" min="1" value={count} onChange={e=>setCount(e.target.value)} />
          </label>

          <div className="row gap" style={{marginLeft:"auto"}}>
            <button className="btn-glass btn-pill" onClick={run} disabled={loading}>
              {loading ? "Generating…" : "Generate"}
            </button>
            {err && <span className="error">{err}</span>}
          </div>
        </div>
      </div>

      {result && (
        <div className="glass card" style={{marginTop:12}}>
          <pre style={{maxWidth:"100%", overflow:"auto", margin:0}}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function fmt(ts){
  if(!ts) return "—";
  const d = new Date(ts); if(Number.isNaN(d.getTime())) return String(ts);
  const hh = String(d.getHours()).padStart(2,"0");
  const mm = String(d.getMinutes()).padStart(2,"0");
  return `${hh}:${mm}`;
}
