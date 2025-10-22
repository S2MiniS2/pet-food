// app/api/evaluate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import {
  MER,
  toDM,
  toPer1000kcal,
  caPRatio,
  pctToGper1000kcal,
} from "@/lib/calc";
import { FLAG_TEXT } from "@/lib/flags";

export async function POST(req: NextRequest) {
  try {
    const { productId, profileId } = await req.json();
    if (!productId || !profileId)
      return NextResponse.json({ error: "missing ids" }, { status: 400 });

    const { data: pet, error: e1 } = await supabase
      .from("pet_profile")
      .select("*")
      .eq("id", profileId)
      .single();
    if (e1 || !pet) throw new Error("pet not found");

    const { data: prod, error: e2 } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();
    if (e2 || !prod) throw new Error("product not found");

    const factors: any = {
      very_low: 0.8,
      low: 1.0,
      normal: 1.2,
      high: 1.4,
      athlete: 1.6,
    };
    const mer = MER(Number(pet.weight_kg), factors[pet.activity] ?? 1.2);

    const facts: any = {
      proteinDM: toDM(prod.crude_protein_pct, prod.moisture_pct),
      fatDM: toDM(prod.crude_fat_pct, prod.moisture_pct),
      proteinPer1000: pctToGper1000kcal(
        prod.crude_protein_pct,
        prod.kcal_per_100g
      ),
      fatPer1000: pctToGper1000kcal(prod.crude_fat_pct, prod.kcal_per_100g),
      pPer1000: toPer1000kcal(prod.phosphorus_pct, prod.kcal_per_100g),
      naPer1000: toPer1000kcal(prod.sodium_pct, prod.kcal_per_100g),
      ca_p_ratio: caPRatio(
        prod.calcium_pct,
        prod.phosphorus_pct,
        prod.moisture_pct
      ),
    };

    // targets: 공통(null) + 프로필 조건 포함
    const conds: string[] = Array.isArray(pet.conditions) ? pet.conditions : [];
    const orParts = ["condition.is.null"];
    if (conds.length)
      orParts.push(`condition.in.(${conds.map((c) => `"${c}"`).join(",")})`);

    const { data: targets, error: te } = await supabase
      .from("targets")
      .select("*")
      .eq("species", pet.species)
      .eq("life_stage", pet.life_stage)
      .or(orParts.join(","));
    if (te) throw new Error(`targets: ${te.message}`);

    const keyMap: any = {
      protein: "proteinPer1000",
      fat: "fatPer1000",
      phosphorus: "pPer1000",
      sodium: "naPer1000",
      ca_p_ratio: "ca_p_ratio",
    };

    const flags: string[] = [];
    for (const t of targets ?? []) {
      const k = keyMap[t.nutrient];
      if (!k) continue;
      const v = facts[k];
      if (v == null) continue;
      if (t.min != null && v < t.min) flags.push(`${t.nutrient}_low`);
      if (t.max != null && v > t.max) flags.push(`${t.nutrient}_high`);
    }

    // 가중 점수
    let score = 100;
    const isCKD = conds.includes("ckd");
    for (const f of flags) {
      const w = f.startsWith("phosphorus_")
        ? isCKD
          ? 25
          : 15
        : f.startsWith("sodium_")
        ? isCKD
          ? 20
          : 10
        : f.startsWith("ca_p_ratio_")
        ? 10
        : f.startsWith("fat_")
        ? 10
        : f.startsWith("protein_")
        ? 10
        : 10;
      score -= w;
    }
    if (score < 0) score = 0;

    const messages = flags.map((f) => FLAG_TEXT[f] ?? f);

    return NextResponse.json({
      mer_kcal: Math.round(mer),
      score,
      flags,
      messages,
      facts,
      product: { id: prod.id, name: prod.name },
    });
  } catch (err: any) {
    console.error("EVALUATE_ERR:", err?.message ?? err);
    return NextResponse.json(
      { error: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}
