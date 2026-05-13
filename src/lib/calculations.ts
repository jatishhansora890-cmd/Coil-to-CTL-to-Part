
/**
 * Density of steel in g/cm^3 (Standard Industrial Value)
 */
export const STEEL_DENSITY = 7.86;

/**
 * Calculates weight of a steel rectangular prism in KG
 * Formula: (L * W * T * Density) / 1,000,000
 * @param length mm
 * @param width mm
 * @param thickness mm
 * @returns weight in KG
 */
export function calculateWeight(length: number, width: number, thickness: number): number {
  if (!length || !width || !thickness) return 0;
  return (length * width * thickness * STEEL_DENSITY) / 1000000;
}

export type ProductionBalance = {
  ctlNos: number;
  totalScrapWeight: number;
  totalCtlWeight: number;
  excessWeight: number;
  singleCtlWeight: number;
  singleScrapWeight: number;
};

/**
 * Mass Balance Formula:
 * Excess = Coil Net Weight - (Total Calculated Weight of Products + Total Calculated Weight of Scrap)
 */
export function balanceMass(
  netWeight: number,
  singleCtlWeight: number,
  singleScrapWeight: number,
  targetCount: number
): ProductionBalance {
  const ctlNos = targetCount || 0;
  const totalScrapWeight = ctlNos * singleScrapWeight;
  const totalCtlWeight = ctlNos * singleCtlWeight;
  
  // The residual weight that cannot be accounted for by the master data dimensions
  const excessWeight = netWeight - totalScrapWeight - totalCtlWeight;

  return {
    ctlNos,
    totalScrapWeight,
    totalCtlWeight,
    excessWeight,
    singleCtlWeight,
    singleScrapWeight
  };
}
