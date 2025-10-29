"use client";
import { useState } from "react";

export default function AdminProducts() {
  const [msg, setMsg] = useState("");
  async function onChange(e: any) {
    const f = e.target.files?.[0];
    if (!f) return;
    const fd = new FormData();
    fd.append("file", f);
    const r = await fetch("/api/products-bulk", { method: "POST", body: fd });
    setMsg(await r.text());
  }
  return (
    <main style={{ padding: 24 }}>
      <h1>CSV 업로드</h1>
      <input type="file" accept=".csv" onChange={onChange} />
      <pre>{msg}</pre>
    </main>
  );
}
