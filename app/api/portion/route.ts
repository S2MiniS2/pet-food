import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { MER } from "@/lib/calc";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const profileId = searchParams.get("profileId");
  const productId = searchParams.get("productId");
  const meals = Number(searchParams.get("meals") ?? 2);
  const cup_g = Number(searchParams.get("cup_g") ?? 100); // 1컵 그램(임시)

  if (!profileId || !productId)
    return NextResponse.json({ error: "missing ids" }, { status: 400 });

  const { data: pet } = await supabase
    .from("pet_profile")
    .select("*")
    .eq("id", profileId)
    .single();
  const { data: prod } = await supabase
    .from("products")
    .select("kcal_per_100g")
    .eq("id", productId)
    .single();
  if (!pet || !prod?.kcal_per_100g)
    return NextResponse.json(
      { error: "not found/invalid product" },
      { status: 404 }
    );

  const factors: any = {
    very_low: 0.8,
    low: 1.0,
    normal: 1.2,
    high: 1.4,
    athlete: 1.6,
  };
  const mer = MER(Number(pet.weight_kg), factors[pet.activity] ?? 1.2);

  // g/day = kcal/day ÷ (kcal/100g) × 100
  const g_per_day = Math.round((mer / Number(prod.kcal_per_100g)) * 100);
  const g_per_meal = Math.round(g_per_day / Math.max(1, meals));
  const cups_per_day = +(g_per_day / cup_g).toFixed(2);

  return NextResponse.json({
    mer_kcal: Math.round(mer),
    g_per_day,
    g_per_meal,
    cups_per_day,
    cup_g,
  });
}
