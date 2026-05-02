export function calcMaterialCost(grams, pricePerKg) {
  return (grams / 1000) * pricePerKg
}

export function calcElectricityCost(hours, watts, kwh) {
  return hours * (watts / 1000) * kwh
}

export function calcDepreciation(hours, ratePerHour) {
  return hours * ratePerHour
}

export function calcLaborCost(minutes, ratePerHour) {
  return (minutes / 60) * ratePerHour
}

export function calcFailureBuffer(subtotal, percent) {
  return subtotal * (percent / 100)
}

export function calcMargin(subtotal, percent) {
  return subtotal * (percent / 100)
}

export function calcTotal(costs) {
  return Object.values(costs).reduce((sum, v) => sum + (v || 0), 0)
}

export function calcSuggestedPrice(total, marginPercent) {
  const m = Math.min(marginPercent, 99.99)
  return total / (1 - m / 100)
}
