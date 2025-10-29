export type Parsed = {
  kcal_per_100g?: number;
  moisture_pct?: number;
  crude_protein_pct?: number;
  crude_fat_pct?: number;
  crude_fiber_pct?: number;
  ash_pct?: number;
  calcium_pct?: number;
  phosphorus_pct?: number;
  sodium_pct?: number;
  taurine_pct?: number;
};
const g = (re: RegExp, s: string) => {
  const m = s.match(re);
  return m ? Number(m[1].replace(/,/g, "")) : undefined;
};

// 한국 라벨 정규식
export function parseLabel(raw: string): Parsed {
  const s = raw.replace(/\s+/g, " ").toLowerCase();
  return {
    kcal_per_100g:
      g(/(\d+(?:\.\d+)?)\s*kcal\s*\/?\s*100g/, s) ??
      g(/100g당\s*(\d+(?:\.\d+)?)\s*kcal/, s),
    moisture_pct: g(
      /(수분|moisture)\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*%/,
      s?.replace(/수분/g, "수분:")
    )?.[1] as any,
    crude_protein_pct: g(
      /(조단백|protein)\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*%/,
      s?.replace(/조단백/g, "조단백:")
    ) as any,
    crude_fat_pct: g(
      /(조지방|fat)\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*%/,
      s?.replace(/조지방/g, "조지방:")
    ) as any,
    crude_fiber_pct: g(
      /(조섬유|fiber)\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*%/,
      s?.replace(/조섬유/g, "조섬유:")
    ) as any,
    ash_pct: g(
      /(조회분|ash)\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*%/,
      s?.replace(/조회분/g, "조회분:")
    ) as any,
    calcium_pct: g(
      /(칼슘|calcium)\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*%/,
      s?.replace(/칼슘/g, "칼슘:")
    ) as any,
    phosphorus_pct: g(
      /(인|phosphorus)\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*%/,
      s?.replace(/인/g, "인:")
    ) as any,
    sodium_pct: g(
      /(나트륨|sodium)\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*%/,
      s?.replace(/나트륨/g, "나트륨:")
    ) as any,
    taurine_pct: g(
      /(타우린|taurine)\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*%/,
      s?.replace(/타우린/g, "타우린:")
    ) as any,
  } as any;
}
