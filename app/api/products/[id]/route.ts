import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", params.id)
    .single();
  if (error || !data)
    return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(data);
}
