"use client";
import { useState } from "react";

export default function OCRAdmin() {
  const [msg, setMsg] = useState("");
  const [txt, setTxt] = useState("");
  const [meta, setMeta] = useState({
    brand: "",
    name: "",
    type: "dry",
    life_stage: "adult",
    barcode: "",
  });

  async function uploadFile(e: any) {
    const f = e.target.files?.[0];
    if (!f) return;
    const fd = new FormData();
    fd.append("file", f);
    const r = await fetch("/api/ocr", { method: "POST", body: fd });
    setMsg(await r.text());
  }
  async function parseText() {
    const r = await fetch("/api/ocr/parse-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...meta, text: txt }),
    });
    setMsg(await r.text());
  }

  return (
    <main style={{ padding: 24, display: "grid", gap: 12, maxWidth: 800 }}>
      <h1>OCR 인입</h1>

      <section style={{ border: "1px solid #ddd", padding: 12 }}>
        <h3>이미지 업로드(큐 등록)</h3>
        <input type="file" accept="image/*" onChange={uploadFile} />
        <p>→ 큐에 들어가고, 외부 OCR 붙인 뒤 파싱 예정.</p>
      </section>

      <section
        style={{
          border: "1px solid #ddd",
          padding: 12,
          display: "grid",
          gap: 8,
        }}
      >
        <h3>텍스트 파싱(즉시 제품 생성)</h3>
        <input
          placeholder="brand"
          value={meta.brand}
          onChange={(e) => setMeta({ ...meta, brand: e.target.value })}
        />
        <input
          placeholder="name"
          value={meta.name}
          onChange={(e) => setMeta({ ...meta, name: e.target.value })}
        />
        <select
          value={meta.type}
          onChange={(e) => setMeta({ ...meta, type: e.target.value })}
        >
          <option value="dry">dry</option>
          <option value="wet">wet</option>
          <option value="treat">treat</option>
          <option value="supplement">supplement</option>
        </select>
        <select
          value={meta.life_stage}
          onChange={(e) => setMeta({ ...meta, life_stage: e.target.value })}
        >
          <option value="adult">adult</option>
          <option value="puppy">puppy</option>
          <option value="senior">senior</option>
        </select>
        <input
          placeholder="barcode"
          value={meta.barcode}
          onChange={(e) => setMeta({ ...meta, barcode: e.target.value })}
        />
        <textarea
          rows={8}
          placeholder="성분표 텍스트 전체 붙여넣기"
          value={txt}
          onChange={(e) => setTxt(e.target.value)}
        />
        <button onClick={parseText}>파싱→제품 생성</button>
      </section>

      <pre>{msg}</pre>
    </main>
  );
}
