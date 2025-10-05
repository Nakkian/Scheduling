import { useEffect, useState } from "react";
import { apiFetch, API_PREFIX } from "../api";

export default function Employees() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState({ dept: "", job: "", sort: "name" });
  const [err, setErr] = useState(null);

  async function load() {
    setErr(null);
    const params = new URLSearchParams();
    if (q.dept) params.set("dept", q.dept);
    if (q.job) params.set("job_code", q.job);
    params.set("sort", q.sort);
    try {
      const res = await apiFetch(`/employees?${params.toString()}`);
      setRows(await res.json());
    } catch (e) { setErr(String(e)); }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function patchSpecificJob(id, specific_job) {
    try {
      await apiFetch(`/employees/${id}/specific-job`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specific_job: specific_job || null })
      });
      await load();
    } catch (e) { alert(e); }
  }

  return (
    <section className="container section-glow">
      <div className="glass card stack">
        <h2>Employees</h2>

        <div className="row gap">
          <select value={q.dept} onChange={e=>setQ({...q, dept: e.target.value})}>
            <option value="">All Depts</option>
            <option value="ABOVE">Above Wing</option>
            <option value="BELOW">Below Wing</option>
          </select>
          <input placeholder="Filter by job code (e.g. RD2AGT)"
                 value={q.job} onChange={e=>setQ({...q, job: e.target.value})}/>
          <select value={q.sort} onChange={e=>setQ({...q, sort: e.target.value})}>
            <option value="name">Name</option>
            <option value="job_code">Job Code</option>
            <option value="id">ID</option>
          </select>
          <button className="btn" onClick={load}>Apply</button>
          <a className="btn ghost" href={`${API_PREFIX}/employees/export.csv`} target="_blank" rel="noreferrer">Export CSV</a>
        </div>

        {err && <p className="error">{err}</p>}

        <div className="table">
          <div className="thead">
            <div>ID</div><div>Name</div><div>Dept</div><div>Job Code</div><div>Specific Job</div><div></div>
          </div>
          {rows.map(r => (
            <div className="trow" key={r.id}>
              <div>{r.id}</div>
              <div>{r.name}</div>
              <div>{r.dept || "-"}</div>
              <div>{r.job_code}</div>
              <div>
                <input
                  defaultValue={r.specific_job || ""}
                  onBlur={(e)=>patchSpecificJob(r.id, e.target.value)}
                  placeholder="Type & unfocus to save"
                />
              </div>
              <div></div>
            </div>
          ))}
        </div>

        <details>
          <summary>Import employees (CSV/XLSX)</summary>
          <ImportForm onDone={load}/>
        </details>
      </div>
    </section>
  );
}

function ImportForm({ onDone }) {
  const [file, setFile] = useState(null);
  const [headerRow, setHeaderRow] = useState("");
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault(); setMsg("");
    if (!file) return setMsg("Choose a file");
    const fd = new FormData();
    fd.append("file", file);
    const qs = new URLSearchParams();
    if (headerRow) qs.set("header_row", headerRow);
    try {
      const res = await apiFetch(`/employees/import?${qs.toString()}`, { method: "POST", body: fd });
      const data = await res.json();
      setMsg(`Imported: ${JSON.stringify(data.result)}`);
      onDone?.();
    } catch (e) { setMsg(String(e)); }
  }

  return (
    <form onSubmit={submit} className="grid-3">
      <label>File
        <input type="file" accept=".csv,.xlsx" onChange={e=>setFile(e.target.files?.[0] || null)} />
      </label>
      <label>Header row (if top rows are junk)
        <input type="number" min="1" placeholder="e.g. 10" value={headerRow} onChange={e=>setHeaderRow(e.target.value)} />
      </label>
      <div className="row gap" style={{alignSelf:"end"}}>
        <button className="btn" type="submit">Upload</button>
        {msg && <span className="small">{msg}</span>}
      </div>
    </form>
  );
}
