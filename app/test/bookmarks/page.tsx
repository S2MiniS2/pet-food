"use client";
import { useEffect, useState } from "react";

export default function Bookmarks() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [profileId, setProfileId] = useState("");
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const ps = await fetch("/api/profile").then((r) => r.json());
      setProfiles(ps);
      setProfileId(ps?.[0]?.id || "");
    })();
  }, []);

  async function load() {
    if (!profileId) return;
    const res = await fetch(`/api/bookmarks?profileId=${profileId}`).then((r) =>
      r.json()
    );
    setItems(res);
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>⭐ 북마크 목록</h1>
      <select value={profileId} onChange={(e) => setProfileId(e.target.value)}>
        {profiles.map((p: any) => (
          <option key={p.id} value={p.id}>
            {p.life_stage}/{p.weight_kg}kg
          </option>
        ))}
      </select>
      <button onClick={load}>불러오기</button>
      <ul style={{ marginTop: 16, display: "grid", gap: 12 }}>
        {items.map((b: any, i: number) => (
          <li
            key={i}
            style={{ border: "1px solid #333", borderRadius: 8, padding: 12 }}
          >
            <div>
              <b>
                {b.products.brand} - {b.products.name}
              </b>
            </div>
            <button
              onClick={async () => {
                await fetch("/api/bookmarks", {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ profileId, productId: b.product_id }),
                });
                load();
              }}
            >
              ❌ 삭제
            </button>
            <button
              onClick={async () => {
                await fetch("/api/learn", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ profileId }),
                });
                alert("선호 학습 완료. 추천을 다시 조회하세요.");
              }}
            >
              🤖 선호 학습
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
