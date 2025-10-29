import { supabase } from "@/lib/db";
import { toDM, toPer1000kcal, caPRatio } from "@/lib/calc";
import Link from "next/link";

export default async function Page({ params }: { params: { id: string } }) {
  const { data: p } = await supabase
    .from("products")
    .select("*")
    .eq("id", params.id)
    .single();
  if (!p) return <main>없음</main>;
  const facts = {
    proteinDM: toDM(p.crude_protein_pct, p.moisture_pct),
    fatDM: toDM(p.crude_fat_pct, p.moisture_pct),
    pPer1000: toPer1000kcal(p.phosphorus_pct, p.kcal_per_100g),
    naPer1000: toPer1000kcal(p.sodium_pct, p.kcal_per_100g),
    ca_p_ratio: caPRatio(p.calcium_pct, p.phosphorus_pct, p.moisture_pct),
  };
  return (
    <main style={{ padding: 24 }}>
      <Link href="/recommend">← 뒤로</Link>
      <h1>
        {p.brand} {p.name}
      </h1>
      <ul>
        <li>kcal/100g: {p.kcal_per_100g ?? "-"}</li>
        <li>단백질 %DM: {facts.proteinDM?.toFixed(1) ?? "-"}</li>
        <li>지방 %DM: {facts.fatDM?.toFixed(1) ?? "-"}</li>
        <li>인 g/1000kcal: {facts.pPer1000?.toFixed(2) ?? "-"}</li>
        <li>나트륨 g/1000kcal: {facts.naPer1000?.toFixed(2) ?? "-"}</li>
        <li>Ca:P: {facts.ca_p_ratio?.toFixed(2) ?? "-"}</li>
      </ul>
      <pre style={{ whiteSpace: "pre-wrap" }}>{p.ingredients_text}</pre>
    </main>
  );
}
