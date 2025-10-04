// src/UploadEmployees.jsx
import { useState } from "react";
import { apiUrl } from "./api";

export default function UploadEmployees() {
  const [file, setFile] = useState(null);
  const [headerRow, setHeaderRow] = useState("");
  const [skiprows, setSkiprows] = useState("");
  const [sheet, setSheet] = useState("");
  const [out, setOut] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleUpload() {
    if (!file) return;
    setLoading(true); setErr(null); setOut(null);
    try {
      const qs = new URLSearchParams();
      if (headerRow) qs.set("header_row", headerRow);
      if (skiprows)  qs.set("skiprows", skiprows);
      if (sheet)     qs.set("sheet_name", sheet);

      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch(apiUrl(`/employees/import?${qs.toString()}`), { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      setOut(await res.json());
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h3>Import Employees</h3>
      <input type="file" onChange={e=>setFile(e.target.files?.[0]||null)} />
      <div style={{display:"flex", gap:8, marginTop:8}}>
        <input placeholder="header_row (e.g. 10)" value={headerRow} onChange={e=>setHeaderRow(e.target.value)} />
        <input placeholder="skiprows (e.g. 9)" value={skiprows} onChange={e=>setSkiprows(e.target.value)} />
        <input placeholder="sheet_name (optional)" value={sheet} onChange={e=>setSheet(e.target.value)} />
      </div>
      <button onClick={handleUpload} disabled={!file || loading}>{loading?"Uploading...":"Upload"}</button>
      {out && <pre style={{textAlign:"left"}}>{JSON.stringify(out, null, 2)}</pre>}
      {err && <p style={{color:"crimson"}}>{err}</p>}
    </div>
  );
}