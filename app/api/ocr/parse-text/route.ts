import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { parseLabel } from "@/lib/ocr";

export async function POST(req: NextRequest) {
  const {
    brand,
    name,
    type = "dry",
    life_stage = null,
    text,
    barcode = null,
  } = await req.json();
  if (!brand || !name || !text)
    return NextResponse.json(
      { error: "brand,name,text required" },
      { status: 400 }
    );

  const parsed = parseLabel(text || "");
  const { data, error } = await supabase
    .from("products")
    .insert([
      {
        type,
        brand,
        name,
        life_stage,
        barcode,
        kcal_per_100g: parsed.kcal_per_100g ?? null,
        moisture_pct: parsed.moisture_pct ?? null,
        crude_protein_pct: parsed.crude_protein_pct ?? null,
        crude_fat_pct: parsed.crude_fat_pct ?? null,
        crude_fiber_pct: parsed.crude_fiber_pct ?? null,
        ash_pct: parsed.ash_pct ?? null,
        calcium_pct: parsed.calcium_pct ?? null,
        phosphorus_pct: parsed.phosphorus_pct ?? null,
        sodium_pct: parsed.sodium_pct ?? null,
        taurine_pct: parsed.taurine_pct ?? null,
        ingredients_text: text,
      },
    ])
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, product: data, parsed });
}
