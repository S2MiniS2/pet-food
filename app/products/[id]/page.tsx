"use client";
import { useEffect, useState } from "react";

export default function ProductDetail({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [profileId, setProfileId] = useState("");
  const [evalRes, setEvalRes] = useState<any>(null);
  const [portion, setPortion] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const p = await fetch(`/api/products/${params.id}`).then((r) => r.json());
      setProduct(p);
      const ps = await fetch("/api/profile").then((r) => r.json());
      setProfiles(ps);
      setProfileId(ps?.[0]?.id || "");
    })();
  }, [params.id]);

  async function run() {
    if (!profileId) return;
    const [eRes, pr] = await Promise.all([
      fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: params.id, profileId }),
      }).then((r) => r.json()),
      fetch(`/api/portion?profileId=${profileId}&productId=${params.id}`).then(
        (r) => r.json()
      ),
    ]);
    setEvalRes(eRes);
    setPortion(pr);
  }

  if (!product) return <main style={{ padding: 20 }}>로딩...</main>;
  return (
    <main style={{ padding: 20, display: "grid", gap: 12, maxWidth: 840 }}>
      <h1>
        {product.brand} — {product.name}
      </h1>

      <section>
        <label>프로필</label>
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
        <button onClick={run} disabled={!profileId} style={{ marginLeft: 8 }}>
          평가+급여량
        </button>
      </section>

      {evalRes && (
        <section
          style={{ border: "1px solid #333", borderRadius: 8, padding: 12 }}
        >
          <div>
            점수: <b>{evalRes.score}</b> / MER: {evalRes.mer_kcal} kcal
          </div>
          {evalRes.messages?.length ? (
            <ul style={{ color: "#e66" }}>
              {evalRes.messages.map((m: string, i: number) => (
                <li key={i}>• {m}</li>
              ))}
            </ul>
          ) : (
            <div style={{ color: "#6e6" }}>경고 없음</div>
          )}
          <pre
            style={{
              background: "#111",
              color: "#0f0",
              padding: 8,
              borderRadius: 6,
            }}
          >
            {JSON.stringify(evalRes.facts, null, 2)}
          </pre>
        </section>
      )}

      {portion && (
        <section
          style={{ border: "1px solid #333", borderRadius: 8, padding: 12 }}
        >
          <div>
            하루 급여량: <b>{portion.g_per_day} g</b> ({portion.cups_per_day} 컵
            기준 {portion.cup_g}g/컵)
          </div>
          <div>
            끼니당: <b>{portion.g_per_meal} g</b>
          </div>
        </section>
      )}
    </main>
  );
}
