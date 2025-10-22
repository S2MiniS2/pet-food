"use client";
import { useState } from "react";
export default function Bulk() {
  const [msg, setMsg] = useState("");
  async function upload(e: any) {
    const f = e.target.files?.[0];
    if (!f) return;
    const fd = new FormData();
    fd.append("file", f);
    const r = await fetch("/api/products-bulk", { method: "POST", body: fd });
    const j = await r.json();
    setMsg(JSON.stringify(j, null, 2));
  }
  return (
    <main style={{ padding: 20 }}>
      <h1>Products Bulk Upload</h1>
      <input type="file" accept=".csv" onChange={upload} />
      <pre>{msg}</pre>
    </main>
  );
}
