import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const profileId = searchParams.get("profileId");
  if (!profileId)
    return NextResponse.json({ error: "missing profileId" }, { status: 400 });

  const { data, error } = await supabase
    .from("bookmarks")
    .select("*, products(*)")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/** 북마크 생성/업서트: 평가 결과까지 저장 */
export async function POST(req: NextRequest) {
  const { profileId, productId, fit_score, flags, messages, notes, tags } =
    await req.json();
  if (!profileId || !productId)
    return NextResponse.json({ error: "missing ids" }, { status: 400 });

  const { data, error } = await supabase
    .from("bookmarks")
    .upsert(
      {
        profile_id: profileId,
        product_id: productId,
        fit_score,
        flags,
        messages,
        notes: notes ?? null,
        tags: tags ?? null,
      },
      { onConflict: "profile_id,product_id" }
    )
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/** 메모/태그만 수정 */
export async function PATCH(req: NextRequest) {
  const { profileId, productId, notes, tags } = await req.json();
  if (!profileId || !productId)
    return NextResponse.json({ error: "missing ids" }, { status: 400 });

  const { data, error } = await supabase
    .from("bookmarks")
    .update({ notes: notes ?? null, tags: tags ?? null })
    .eq("profile_id", profileId)
    .eq("product_id", productId)
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const { profileId, productId } = await req.json();
  if (!profileId || !productId)
    return NextResponse.json({ error: "missing ids" }, { status: 400 });

  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("profile_id", profileId)
    .eq("product_id", productId);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
