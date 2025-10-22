export const RER = (kg: number) => 70 * Math.pow(kg, 0.75);
export const MER = (kg: number, factor: number) => RER(kg) * factor;

export const pctToGper100g = (pct: number | null) =>
  pct == null ? null : (pct / 100) * 100;
export const pctToGper1000kcal = (
  pct: number | null,
  kcalPer100g: number | null
) => {
  if (pct == null || !kcalPer100g) return null;
  // % as-fed → g/100g → g/1000kcal
  return (pct / 100) * 100 * (1000 / kcalPer100g);
};

// as-fed % → DM %
export const toDM = (pctAsFed: number | null, moisturePct: number | null) => {
  if (pctAsFed == null || moisturePct == null) return null;
  const dm = 1 - moisturePct / 100;
  if (dm <= 0) return null;
  return pctAsFed / dm;
};

// g/100g → g/1000kcal
export const toPer1000kcal = (
  gPer100g: number | null,
  kcalPer100g: number | null
) => {
  if (gPer100g == null || kcalPer100g == null || kcalPer100g === 0) return null;
  return (gPer100g / 100) * (1000 / kcalPer100g) * 100; // g/1000kcal
};

// Ca:P 비율
export const caPRatio = (
  caPctAsFed: number | null,
  pPctAsFed: number | null,
  moisturePct: number | null
) => {
  const caDM = toDM(caPctAsFed, moisturePct);
  const pDM = toDM(pPctAsFed, moisturePct);
  if (!caDM || !pDM || pDM === 0) return null;
  return caDM / pDM;
};
