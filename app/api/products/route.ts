// 제품 등록 / 조회 API

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const type = searchParams.get("type"); // dry|wet|treat|supplement
  const stage = searchParams.get("life_stage"); // puppy|adult|senior
  let query = supabase.from("products").select("*").neq("discontinued", true);

  if (q) query = query.ilike("name", `%${q}%`);
  if (type) query = query.eq("type", type);
  if (stage) query = query.eq("life_stage", stage);

  const { data, error } = await query.limit(50);
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { data, error } = await supabase
    .from("products")
    .insert([body])
    .select()
    .single();
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json(data);
}
