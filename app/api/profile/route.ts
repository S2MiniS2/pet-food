// app/api/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import config from "@/config/dog.v1.json";
import { z } from "zod";

const ProfileSchema = z.object({
  species: z.literal("dog"),
  weightKg: z.number().positive(),
  lifeStage: z.enum(["puppy", "adult", "senior"]),
  activity: z.enum(["very_low", "low", "normal", "high", "athlete"]),
  neutered: z.boolean().optional(),
  conditions: z.array(z.string()).default([]),
});

export async function GET() {
  const { data, error } = await supabase.from("pet_profile").select("*");
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = ProfileSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const {
    species,
    weightKg,
    lifeStage,
    activity,
    conditions,
    neutered = false,
  } = parsed.data;

  if (!config.lifeStages.includes(lifeStage)) {
    return NextResponse.json({ error: "lifeStage" }, { status: 400 });
  }
  if (!(activity in (config as any).activityFactors)) {
    return NextResponse.json({ error: "activity" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("pet_profile")
    .insert({
      species,
      weight_kg: weightKg,
      life_stage: lifeStage,
      activity,
      conditions,
      neutered,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json(data);
}
