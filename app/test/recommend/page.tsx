"use client";
import { useEffect, useState } from "react";

export default function RecommendPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [profileId, setProfileId] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const ps = await fetch("/api/profile").then((r) => r.json());
      setProfiles(ps);
      setProfileId(ps?.[0]?.id || "");
    })();
  }, []);

  async function run() {
    if (!profileId) return;
    setLoading(true);
    const r = await fetch(`/api/recommend?profileId=${profileId}`);
    const j = await r.json();
    setItems(j.items || []);
    setLoading(false);
  }

  return (
    <main style={{ padding: 20, maxWidth: 820 }}>
      <h1>🏆 추천 랭킹</h1>
      <label>
        프로필
        <select
          value={profileId}
          onChange={(e) => setProfileId(e.target.value)}
        >
          {profiles.map((p: any) => (
            <option key={p.id} value={p.id}>
              {p.life_stage}/{p.weight_kg}kg ({p.activity})
            </option>
          ))}
        </select>
      </label>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <select id="typeSel" defaultValue="dry">
          <option value="dry">건식</option>
          <option value="wet">습식</option>
        </select>
        <input id="priceMax" type="number" placeholder="최대가격(원)" />
        <button
          onClick={async () => {
            const type = (
              document.getElementById("typeSel") as HTMLSelectElement
            ).value;
            const maxPrice =
              (document.getElementById("priceMax") as HTMLInputElement).value ||
              "0";
            const r = await fetch(
              `/api/recommend?profileId=${profileId}&type=${type}&maxPrice=${maxPrice}`
            );
            const j = await r.json();
            setItems(j.items || []);
          }}
        >
          필터 적용
        </button>
      </div>
      <button onClick={run} disabled={!profileId || loading}>
        {loading ? "계산 중..." : "추천 보기"}
      </button>

      <ul style={{ marginTop: 16, display: "grid", gap: 12 }}>
        {items.map((it: any, idx: number) => (
          <li
            key={idx}
            style={{ border: "1px solid #333", borderRadius: 8, padding: 12 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <b>
                {it.product.brand} - {it.product.name}
              </b>
              <span>
                점수 <b>{it.score}</b>
              </span>
            </div>
            {it.messages?.length ? (
              <ul style={{ marginTop: 4, color: "#e66" }}>
                {it.messages.map((m: string, i: number) => (
                  <li key={i}>• {m}</li>
                ))}
              </ul>
            ) : (
              <div style={{ color: "#6e6" }}>경고 없음</div>
            )}
            <a
              href={`/products/${it.product.id}`}
              style={{
                textDecoration: "underline",
                marginTop: 6,
                display: "inline-block",
              }}
            >
              상세
            </a>
            <button
              onClick={async () => {
                await fetch("/api/bookmarks", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    profileId,
                    productId: it.product.id,
                    fit_score: it.score,
                    flags: it.flags,
                    messages: it.messages,
                  }),
                });
                alert("북마크 저장됨");
              }}
            >
              ⭐ 북마크
            </button>
            <button
              onClick={async () => {
                const notes = prompt("메모 입력") || "";
                const tags =
                  prompt("태그 콤마구분 예: 저나트륨,저인")
                    ?.split(",")
                    .map((s) => s.trim())
                    .filter(Boolean) || null;
                await fetch("/api/bookmarks", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    profileId,
                    productId: it.product.id,
                    notes,
                    tags,
                  }),
                });
              }}
            >
              📝 메모/태그
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
