export const explainFlag = (f: string) => {
  const map: Record<string, string> = {
    phosphorus_high: "인(P)이 높음 → 신장 부담 가능",
    sodium_high: "나트륨이 높음 → 혈압/신장 주의",
    protein_low: "단백질 낮음 → 근육 유지 부족 가능",
    fat_high: "지방 높음 → 췌장/비만 주의",
    ca_p_ratio_low: "칼슘:인 비율 낮음",
    ca_p_ratio_high: "칼슘:인 비율 높음",
  };
  return map[f] ?? f;
};
