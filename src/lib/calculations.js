/**
 * Beregner total utskriftskostnad.
 *
 * @param {object} params
 * @param {number} params.filamentGrams     - Gram filament brukt
 * @param {number} params.filamentPricePerKg - Kilopris på filament (NOK)
 * @param {number} params.printHours        - Utskriftstid i timer
 * @param {number} params.electricityKwh    - Strømforbruk per time (kWh)
 * @param {number} params.electricityPrice  - Strømpris per kWh (NOK)
 * @param {number} params.failureRate       - Svinnfaktor 0–1 (f.eks. 0.05 = 5 %)
 * @param {number} params.markupPercent     - Påslag i prosent (f.eks. 20)
 * @returns {{ filamentCost, electricityCost, subtotal, withFailure, finalPrice }}
 */
export function calculatePrintCost({
  filamentGrams,
  filamentPricePerKg,
  printHours,
  electricityKwh,
  electricityPrice,
  failureRate = 0,
  markupPercent = 0,
}) {
  const filamentCost = (filamentGrams / 1000) * filamentPricePerKg
  const electricityCost = printHours * electricityKwh * electricityPrice
  const subtotal = filamentCost + electricityCost
  const withFailure = subtotal / (1 - failureRate)
  const finalPrice = withFailure * (1 + markupPercent / 100)

  return {
    filamentCost,
    electricityCost,
    subtotal,
    withFailure,
    finalPrice,
  }
}
