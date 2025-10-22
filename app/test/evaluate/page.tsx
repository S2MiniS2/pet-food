"use client";
import { useEffect, useState } from "react";

export default function EvaluatePage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [profileId, setProfileId] = useState<string>("");
  const [productId, setProductId] = useState<string>("");
  const [res, setRes] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const p = await fetch("/api/profile").then((r) => r.json());
      setProfiles(p);
      setProfileId(p?.[0]?.id || "");
      const q = await fetch("/api/products").then((r) => r.json());
      setProducts(q);
      setProductId(q?.[0]?.id || "");
    })();
  }, []);

  async function run() {
    setLoading(true);
    try {
      const r = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, productId }),
      });

      // 복사본으로 원문 로그
      const copy = r.clone();
      const raw = await copy.text();
      console.log("status", r.status, raw);

      // 본문은 한 번만 파싱
      let data: any = null;
      try {
        data = await r.json();
      } catch (_) {}

      if (!r.ok) {
        setRes({
          status: r.status,
          error: data?.error ?? raw ?? "server error",
        });
        return;
      }
      setRes({ status: r.status, ...data });
    } catch (e: any) {
      setRes({ status: 0, error: String(e?.message ?? e) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <body>
        <main style={{ padding: 20, display: "grid", gap: 12, maxWidth: 680 }}>
          <h1>⚖️ 제품 적합도 테스트</h1>

          <label>
            프로필
            <select
              value={profileId}
              onChange={(e) => setProfileId(e.target.value)}
            >
              {profiles.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.species} / {p.life_stage} / {p.weight_kg}kg ({p.activity})
                </option>
              ))}
            </select>
          </label>

          <label>
            제품
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              {products.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.brand} - {p.name}
                </option>
              ))}
            </select>
          </label>

          <button onClick={run} disabled={loading || !profileId || !productId}>
            {loading ? "계산 중..." : "평가 실행"}
          </button>

          <pre
            style={{
              background: "#111",
              color: "#0f0",
              padding: 12,
              borderRadius: 8,
            }}
          >
            {res && (
              <div
                style={{
                  border: "1px solid #333",
                  padding: 12,
                  borderRadius: 8,
                }}
              >
                <div>
                  점수: <b>{res.score}</b> / MER: {res.mer_kcal} kcal
                </div>
                <ul>
                  {(res.messages || res.flags || []).map(
                    (m: any, i: number) => (
                      <li key={i}>• {m}</li>
                    )
                  )}
                </ul>
                <pre>{JSON.stringify(res.facts, null, 2)}</pre>
              </div>
            )}
          </pre>
        </main>
      </body>
    </>
  );
}
