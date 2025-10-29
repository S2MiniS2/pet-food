"use client";
import { useEffect, useState } from "react";

export default function ProductsPage() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [stage, setStage] = useState("");
  const [items, setItems] = useState<any[]>([]);
  async function load() {
    const u = new URL("/api/products", location.origin);
    if (q) u.searchParams.set("q", q);
    if (type) u.searchParams.set("type", type);
    if (stage) u.searchParams.set("life_stage", stage);
    const r = await fetch(u.toString());
    setItems(await r.json());
  }
  useEffect(() => {
    load(); /* 최초 로드 */
  }, []);
  return (
    <main style={{ padding: 20, display: "grid", gap: 12, maxWidth: 900 }}>
      <h1>제품 검색</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 140px 140px 120px",
          gap: 8,
        }}
      >
        <input
          placeholder="제품명"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">type 전체</option>
          <option value="dry">dry</option>
          <option value="wet">wet</option>
          <option value="treat">treat</option>
          <option value="supplement">supplement</option>
        </select>
        <select value={stage} onChange={(e) => setStage(e.target.value)}>
          <option value="">stage 전체</option>
          <option value="puppy">puppy</option>
          <option value="adult">adult</option>
          <option value="senior">senior</option>
        </select>
        <button onClick={load}>검색</button>
      </div>
      <ul style={{ display: "grid", gap: 8 }}>
        {items.map((it) => (
          <li key={it.id} style={{ border: "1px solid #ddd", padding: 10 }}>
            <b>
              {it.brand} {it.name}
            </b>{" "}
            · {it.type}/{it.life_stage ?? "-"} · {it.kcal_per_100g ?? "-"}{" "}
            kcal/100g
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <a href={`/products/${it.id}`}>상세</a>
              <a href={`/feed/new?item_id=${it.id}&item_type=product`}>기록</a>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
