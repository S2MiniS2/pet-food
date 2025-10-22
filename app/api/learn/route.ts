import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { profileId } = await req.json();
  if (!profileId)
    return NextResponse.json({ error: "missing profileId" }, { status: 400 });

  // 1) 북마크 가져오기
  const { data: bms, error } = await supabase
    .from("bookmarks")
    .select("fit_score, flags, products(brand, price_krw)")
    .eq("profile_id", profileId);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // 2) 간단 집계
  let nw: Record<string, number> = {}; // nutrient_weights
  let bb: Record<string, number> = {}; // brand_bias
  let priceSum = 0,
    priceCnt = 0;

  for (const b of bms || []) {
    const s = Number(b.fit_score ?? 0);
    if (s < 60) continue; // 낮은 점수는 학습에서 제외
    // flags가 없다는 것은 기준을 잘 맞췄다는 것 → 영양소 페널티 감소 방향
    for (const f of b.flags || []) {
      const k = f.split("_")[0]; // phosphorus_high -> phosphorus
      // high가 떠도 북마킹했다면 해당 영양소를 덜 중요시하는 성향일 수 있음 → 가중치 절대값 감소
      nw[k] = (nw[k] ?? 0) + (f.endsWith("_high") ? -0.2 : -0.1);
    }
    const brand = b.products?.brand;
    if (brand) bb[brand] = (bb[brand] ?? 0) + s / 100; // 점수만큼 가점
    const price = Number(b.products?.price_krw ?? 0);
    if (price > 0) {
      priceSum += price;
      priceCnt += 1;
    }
  }

  // 가격 민감도: 평균 가격이 낮을수록 음수(저가 선호)
  const price_weight = priceCnt ? priceSum / priceCnt : 0;
  // 정규화
  for (const k in nw) nw[k] = Math.max(-2, Math.min(2, nw[k]));
  for (const k in bb) bb[k] = Math.max(-2, Math.min(2, bb[k]));
  const pw = price_weight ? -(price_weight / 100000) : 0; // 10만원당 -1 정도 스케일

  // 3) upsert
  const { error: e2 } = await supabase.from("profile_prefs").upsert({
    profile_id: profileId,
    nutrient_weights: nw,
    brand_bias: bb,
    price_weight: pw,
    updated_at: new Date().toISOString(),
  });
  if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });

  return NextResponse.json({
    ok: true,
    nutrient_weights: nw,
    brand_bias: bb,
    price_weight: pw,
  });
}
