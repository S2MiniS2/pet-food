"use client";
import { useEffect, useState } from "react";
export default function Portion() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [profileId, setProfileId] = useState("");
  const [productId, setProductId] = useState("");
  const [meals, setMeals] = useState(2);
  const [cupG, setCupG] = useState(100);
  const [res, setRes] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const ps = await fetch("/api/profile").then((r) => r.json());
      setProfiles(ps);
      setProfileId(ps?.[0]?.id || "");
      const pd = await fetch("/api/products").then((r) => r.json());
      setProducts(pd);
      setProductId(pd?.[0]?.id || "");
    })();
  }, []);

  async function run() {
    const r = await fetch(
      `/api/portion?profileId=${profileId}&productId=${productId}&meals=${meals}&cup_g=${cupG}`
    );
    setRes(await r.json());
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>🍽️ 급여량 계산</h1>
      <div>
        <label>프로필</label>
        <select
          value={profileId}
          onChange={(e) => setProfileId(e.target.value)}
        >
          {profiles.map((p: any) => (
            <option key={p.id} value={p.id}>
              {p.life_stage}/{p.weight_kg}kg
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>제품</label>
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
      </div>
      <div>
        <label>하루 끼니 수</label>
        <input
          type="number"
          value={meals}
          onChange={(e) => setMeals(+e.target.value || 2)}
        />
        <label>1컵 그램</label>
        <input
          type="number"
          value={cupG}
          onChange={(e) => setCupG(+e.target.value || 100)}
        />
      </div>
      <button onClick={run}>계산</button>
      <pre>{res ? JSON.stringify(res, null, 2) : "결과 대기"}</pre>
    </main>
  );
}
