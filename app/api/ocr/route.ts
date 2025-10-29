import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file") as File;
  const petId = form.get("pet_id") as string | null;
  if (!file)
    return NextResponse.json({ error: "file missing" }, { status: 400 });

  const arr = await file.arrayBuffer();
  const bytes = new Uint8Array(arr);
  const path = `${crypto.randomUUID()}-${file.name}`;

  const { data: up, error: upErr } = await supabase.storage
    .from("ocr")
    .upload(path, bytes, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
  if (upErr)
    return NextResponse.json({ error: upErr.message }, { status: 500 });

  const { data: pub } = supabase.storage.from("ocr").getPublicUrl(up.path);
  const { data, error } = await supabase
    .from("ocr_jobs")
    .insert({
      pet_id: petId,
      file_url: pub?.publicUrl,
      status: "queued",
    })
    .select()
    .single();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, job: data });
}
