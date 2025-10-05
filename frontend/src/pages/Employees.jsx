// src/pages/Employees.jsx
import { useEffect, useState } from "react";
import { apiFetch } from "../api";

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

  useEffect(() => { load(); }, []);

  async function patchSpecificJob(id, specific_job) {
    try {
      await apiFetch(`/employees/${id}/specific-job`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specific_job })
      });
      await load();
    } catch (e) { alert(e); }
  }

  return (
    <section className="stack">
      <h2>Employees</h2>
      <div className="row gap">
        <select value={q.dept} onChange={e=>setQ({...q, dept: e.target.value})}>
          <option value="">All Depts</option>
          <option value="ABOVE">Above Wing</option>
          <option value="BELOW">Below Wing</option>
        </select>
        <input placeholder="Filter by job code (e.g. RD2AGT)" value={q.job} onChange={e=>setQ({...q, job: e.target.value})}/>
        <select value={q.sort} onChange={e=>setQ({...q, sort: e.target.value})}>
          <option value="name">Name</option>
          <option value="job_code">Job Code</option>
          <option value="id">ID</option>
        </select>
        <button className="btn" onClick={load}>Apply</button>
        <a className="btn secondary" href="/api/employees/export.csv" target="_blank" rel="noreferrer">Export CSV</a>
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
            <div><input defaultValue={r.specific_job || ""} onBlur={(e)=>patchSpecificJob(r.id, e.target.value || null)} /></div>
            <div></div>
          </div>
        ))}
      </div>

      <details>
        <summary>Import employees (CSV/XLSX)</summary>
        <ImportForm />
      </details>
    </section>
  );
}

function ImportForm() {
  const [file, setFile] = useState(null);
  const [headerRow, setHeaderRow] = useState("");
  const [msg, setMsg] = useState("");
  async function submit(e) {
    e.preventDefault(); setMsg("");
    const fd = new FormData();
    if (!file) return setMsg("Choose a file");
    fd.append("file", file);
    const qs = new URLSearchParams();
    if (headerRow) qs.set("header_row", headerRow);
    try {
      const res = await apiFetch(`/employees/import?${qs.toString()}`, { method: "POST", body: fd });
      const data = await res.json();
      setMsg(`Imported: ${JSON.stringify(data.result)}`);
    } catch (e) { setMsg(String(e)); }
  }
  return (
    <form onSubmit={submit} className="stack">
      <input type="file" accept=".csv,.xlsx" onChange={e=>setFile(e.target.files?.[0] || null)} />
      <input type="number" min="1" placeholder="Header row (if your file has junk top rows)" value={headerRow} onChange={e=>setHeaderRow(e.target.value)} />
      <button className="btn" type="submit">Upload</button>
      {msg && <p>{msg}</p>}
    </form>
  );
}
