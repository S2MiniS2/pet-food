"use client";
import { useEffect, useState } from "react";

export default function RecommendPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [petId, setPetId] = useState<string>("");
  const [res, setRes] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const p = await fetch("/api/profile").then((r) => r.json());
      setProfiles(p);
      setPetId(p?.[0]?.id || "");
    })();
  }, []);

  async function run() {
    const r = await fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ petId }),
    });
    const j = await r.json();
    setRes(j);
  }

  return (
    <main style={{ padding: 24, display: "grid", gap: 12, maxWidth: 720 }}>
      <h1>추천</h1>
      <select value={petId} onChange={(e) => setPetId(e.target.value)}>
        {profiles.map((p: any) => (
          <option key={p.id} value={p.id}>
            {p.name || p.id} / {p.weight_kg}kg
          </option>
        ))}
      </select>
      <button onClick={run} disabled={!petId}>
        실행
      </button>

      {/* 결과 표시 */}
      {res?.items ? (
        <ul style={{ display: "grid", gap: 8 }}>
          {res.items.map((it: any) => (
            <li
              key={it.productId}
              style={{ border: "1px solid #ddd", padding: 8 }}
            >
              <b>{it.name}</b> ({it.score}점)
              <div>권장량: {it.grams ?? "-"}g</div>
              <div>사유: {it.reasons?.join(", ") ?? "-"}</div>
              <a href={`/products/${it.productId}`}>상세보기</a>
              <a href={`/feed/new?item_id=${it.productId}&item_type=product`}>
                이걸로 기록
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <pre>{res ? JSON.stringify(res, null, 2) : "결과 대기"}</pre>
      )}
    </main>
  );
}
