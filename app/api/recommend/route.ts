import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { toDM, toPer1000kcal, caPRatio, pctToGper1000kcal } from "@/lib/calc";
import { FLAG_TEXT } from "@/lib/flags";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get("profileId");
    const limit = Number(searchParams.get("limit") ?? 20);
    const type = searchParams.get("type") ?? "dry";
    const maxPrice = Number(searchParams.get("maxPrice") ?? 0);
    if (!profileId)
      return NextResponse.json({ error: "missing profileId" }, { status: 400 });

    // 1. 프로필
    const { data: pet, error: e1 } = await supabase
      .from("pet_profile")
      .select("*")
      .eq("id", profileId)
      .single();
    if (e1 || !pet)
      return NextResponse.json({ error: "profile not found" }, { status: 404 });

    // 2. targets
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
    if (te) return NextResponse.json({ error: te.message }, { status: 500 });

    // 3. 제품 후보
    let q = supabase.from("products").select("*").eq("type", type);
    if (maxPrice > 0) q = q.lte("price_krw", maxPrice);
    const { data: products, error: e2 } = await q.limit(500);
    if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });

    // 4. 평가 로직
    const keyMap: any = {
      protein: "proteinPer1000",
      fat: "fatPer1000",
      phosphorus: "pPer1000",
      sodium: "naPer1000",
      ca_p_ratio: "ca_p_ratio",
    };
    const isCKD = conds.includes("ckd");

    function scoreOne(prod: any) {
      if (!prod.kcal_per_100g || prod.moisture_pct == null)
        return { score: -1, flags: ["missing_core"], messages: [], facts: {} };

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

      const flags: string[] = [];
      for (const t of targets ?? []) {
        const k = keyMap[t.nutrient];
        if (!k) continue;
        const v = facts[k];
        if (v == null) continue;
        if (t.min != null && v < t.min) flags.push(`${t.nutrient}_low`);
        if (t.max != null && v > t.max) flags.push(`${t.nutrient}_high`);
      }

      let score = 100;
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
      return { score, flags, messages, facts };
    }

    // prefs 로드
    const { data: pref } = await supabase
      .from("profile_prefs")
      .select("*")
      .eq("profile_id", profileId)
      .single();

    function applyPrefs(baseScore: number, prod: any, facts: any) {
      if (!pref) return baseScore;
      let s = baseScore;
      const nw = pref.nutrient_weights || {};
      const bb = pref.brand_bias || {};
      if (facts?.pPer1000 != null && nw.phosphorus)
        s += -nw.phosphorus * (facts.pPer1000 - 0.6);
      if (facts?.naPer1000 != null && nw.sodium)
        s += -nw.sodium * (facts.naPer1000 - 0.8);
      if (facts?.proteinPer1000 != null && nw.protein)
        s += nw.protein * (facts.proteinPer1000 - 4.5);
      if (facts?.fatPer1000 != null && nw.fat)
        s += nw.fat * (facts.fatPer1000 - 1.3);
      if (bb[prod.brand]) s += bb[prod.brand] * 5;
      if (pref.price_weight && prod.price_krw)
        s += pref.price_weight * Number(prod.price_krw);
      return Math.max(0, Math.min(100, s));
    }

    const ranked = (products || [])
      .map((p) => {
        const r = scoreOne(p);
        const finalScore = applyPrefs(r.score, p, r.facts);
        return {
          ...r,
          score: finalScore,
          product: {
            id: p.id,
            brand: p.brand,
            name: p.name,
            type: p.type,
            price_krw: p.price_krw,
          },
        };
      })
      .filter((x) => x.score >= 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return NextResponse.json({
      profileId,
      count: ranked.length,
      items: ranked,
    });
  } catch (err: any) {
    console.error("RECOMMEND_ERR:", err?.message ?? err);
    return NextResponse.json(
      { error: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}
