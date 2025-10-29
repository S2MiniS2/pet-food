import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month"); // "2025-10"
  if (!month)
    return NextResponse.json({ error: "month required" }, { status: 400 });
  const start = `${month}-01`;
  const end = `${month}-31`;
  const { data, error } = await supabase
    .from("feed_log")
    .select("ts, meal, item_type, item_id, amount_g, note, bookmarked")
    .gte("ts", start)
    .lte("ts", end);
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json(data);
}
