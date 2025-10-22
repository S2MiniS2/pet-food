// app/api/products-bulk/route.ts
import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import { supabase } from "@/lib/db";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file") as File;
  if (!file)
    return NextResponse.json({ error: "file missing" }, { status: 400 });
  const csv = await file.text();
  const { data, errors } = Papa.parse(csv, {
    header: true,
    skipEmptyLines: true,
  });
  if (errors.length) return NextResponse.json({ errors }, { status: 400 });
  const rows = (data as any[]).map((r) => ({
    type: r.type,
    brand: r.brand,
    name: r.name,
    barcode: r.barcode || null,
    life_stage: r.life_stage || null,
    kcal_per_100g: +r.kcal_per_100g || null,
    moisture_pct: +r.moisture_pct || null,
    crude_protein_pct: +r.crude_protein_pct || null,
    crude_fat_pct: +r.crude_fat_pct || null,
    crude_fiber_pct: +r.crude_fiber_pct || null,
    ash_pct: +r.ash_pct || null,
    sodium_pct: +r.sodium_pct || null,
    phosphorus_pct: +r.phosphorus_pct || null,
    calcium_pct: +r.calcium_pct || null,
    taurine_pct: +r.taurine_pct || null,
    ingredients_text: r.ingredients_text || null,
    discontinued: String(r.discontinued).toLowerCase() === "true",
  }));
  const { error } = await supabase.from("products").insert(rows);
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ ok: true, count: rows.length });
}
