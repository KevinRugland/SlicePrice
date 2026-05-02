import { useState, useMemo, useEffect } from 'react'
import { useSettings } from '../hooks/useSettings'
import {
  calcMaterialCost,
  calcElectricityCost,
  calcDepreciation,
  calcLaborCost,
  calcFailureBuffer,
  calcTotal,
  calcSuggestedPrice,
} from '../lib/calculations'
import { exportCalculationPDF, exportQuotePDF } from '../lib/pdfExport'

const fmt = (n) =>
  new Intl.NumberFormat('nb-NO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n) + ' kr'

function CostRow({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm tabular-nums text-ink">{fmt(value)}</span>
    </div>
  )
}

export default function Calculator() {
  const { settings, loading } = useSettings()

  const [productName, setProductName] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [filamentGrams, setFilamentGrams] = useState('')
  const [selectedFilamentId, setSelectedFilamentId] = useState(null)
  const [printHours, setPrintHours] = useState('')
  const [printMinutes, setPrintMinutes] = useState('')
  const [laborMinutes, setLaborMinutes] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState('')

  useEffect(() => {
    if (!loading && settings.filaments.length > 0 && selectedFilamentId === null) {
      setSelectedFilamentId(settings.filaments[0].id)
    }
  }, [loading, settings.filaments, selectedFilamentId])

  const costs = useMemo(() => {
    const filament = settings.filaments.find((f) => f.id === selectedFilamentId)
    const pricePerKg = filament?.pricePerKg ?? 0
    const totalHours =
      (parseFloat(printHours) || 0) + (parseFloat(printMinutes) || 0) / 60
    const laborMins = parseFloat(laborMinutes) || 0
    const grams = parseFloat(filamentGrams) || 0
    const qty = Math.max(1, parseInt(quantity) || 1)

    const material = calcMaterialCost(grams, pricePerKg)
    const electricity = calcElectricityCost(
      totalHours,
      settings.watts,
      settings.electricityPrice,
    )
    const depreciation = calcDepreciation(totalHours, settings.depreciationRate)
    const labor = calcLaborCost(laborMins, settings.laborRate)
    const failureBuffer = calcFailureBuffer(
      material + electricity + depreciation + labor,
      settings.defaultFailurePercent,
    )
    const subtotal = calcTotal({ material, electricity, depreciation, labor, failureBuffer })
    const suggestedPrice = calcSuggestedPrice(subtotal, settings.defaultMarginPercent)
    const marginAmount = suggestedPrice - subtotal
    const pricePerUnit = qty > 1 ? suggestedPrice / qty : null

    return {
      material,
      electricity,
      depreciation,
      labor,
      failureBuffer,
      subtotal,
      suggestedPrice,
      marginAmount,
      pricePerUnit,
      quantity: qty,
      totalHours,
    }
  }, [
    filamentGrams,
    printHours,
    printMinutes,
    laborMinutes,
    quantity,
    selectedFilamentId,
    settings,
  ])

  const handleCalcPDF = () => {
    const filament = settings.filaments.find((f) => f.id === selectedFilamentId)
    exportCalculationPDF({
      productName,
      customerName,
      filamentGrams: parseFloat(filamentGrams) || 0,
      filamentName: filament?.name ?? 'Ukjent',
      totalPrintHours: costs.totalHours,
      laborMinutes: parseFloat(laborMinutes) || 0,
      quantity: costs.quantity,
      note,
      costs,
    })
  }

  const handleQuotePDF = () => {
    exportQuotePDF({
      productName,
      customerName,
      quantity: costs.quantity,
      suggestedPrice: costs.suggestedPrice,
      pricePerUnit: costs.pricePerUnit,
      note,
      companyName: settings.printerName,
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Laster innstillinger...
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-3 bg-white rounded-card border border-slate-200 p-6 shadow-sm">
          <h1 className="text-xl font-bold text-ink mb-6">Priskalkulator</h1>

          <div className="space-y-5">
            {/* Produktnavn / Kundenavn */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Produktnavn
                </label>
                <input
                  className="input-field"
                  placeholder="f.eks. Nøkkelbrikke"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Kundenavn{' '}
                  <span className="font-normal text-slate-300">(valgfritt)</span>
                </label>
                <input
                  className="input-field"
                  placeholder="f.eks. Ola Nordmann"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
            </div>

            {/* Filament */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Filament (gram)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className="input-field"
                  placeholder="0"
                  value={filamentGrams}
                  onChange={(e) => setFilamentGrams(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Filamenttype
                </label>
                <div className="relative">
                  <select
                    className="input-field appearance-none pr-7"
                    value={selectedFilamentId ?? ''}
                    onChange={(e) =>
                      setSelectedFilamentId(parseInt(e.target.value))
                    }
                  >
                    {settings.filaments.length === 0 ? (
                      <option value="">Ingen filament lagt til</option>
                    ) : (
                      settings.filaments.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name} — {f.pricePerKg} kr/kg
                        </option>
                      ))
                    )}
                  </select>
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                    ▾
                  </span>
                </div>
              </div>
            </div>

            {/* Printtid / Arbeidstid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Printtid
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="0"
                      className="input-field pr-8"
                      placeholder="0"
                      value={printHours}
                      onChange={(e) => setPrintHours(e.target.value)}
                    />
                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                      t
                    </span>
                  </div>
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      className="input-field pr-10"
                      placeholder="0"
                      value={printMinutes}
                      onChange={(e) => setPrintMinutes(e.target.value)}
                    />
                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                      min
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Arbeidstid
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    className="input-field pr-10"
                    placeholder="0"
                    value={laborMinutes}
                    onChange={(e) => setLaborMinutes(e.target.value)}
                  />
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                    min
                  </span>
                </div>
              </div>
            </div>

            {/* Antall */}
            <div className="w-1/2 pr-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Antall
              </label>
              <input
                type="number"
                min="1"
                className="input-field"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
              />
            </div>

            {/* Notat */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Notat{' '}
                <span className="font-normal text-slate-300">(valgfritt)</span>
              </label>
              <textarea
                className="input-field resize-none"
                rows={3}
                placeholder="Tilleggsinformasjon til kunden..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          {/* PDF buttons */}
          <div className="flex gap-3 mt-6 pt-5 border-t border-slate-100">
            <button
              onClick={handleCalcPDF}
              className="flex-1 rounded-lg bg-ink text-white text-sm font-medium py-2.5 px-4 hover:bg-slate-800 active:scale-95 transition-all"
            >
              Last ned kalkulasjon (PDF)
            </button>
            <button
              onClick={handleQuotePDF}
              className="flex-1 rounded-lg border border-filament text-filament text-sm font-medium py-2.5 px-4 hover:bg-filament/5 active:scale-95 transition-all"
            >
              Last ned tilbud til kunde (PDF)
            </button>
          </div>
        </div>

        {/* Live breakdown */}
        <div className="lg:col-span-2 bg-white rounded-card border border-slate-200 p-6 shadow-sm self-start sticky top-6">
          <h2 className="text-base font-semibold text-ink mb-5">
            Kostnadsbrekkdown
          </h2>

          <div className="space-y-2.5">
            <CostRow label="Materialkostnad" value={costs.material} />
            <CostRow label="Strømkostnad" value={costs.electricity} />
            <CostRow label="Maskinslitasje" value={costs.depreciation} />
            <CostRow label="Arbeidskostnad" value={costs.labor} />
            <CostRow label="Svinnbuffer" value={costs.failureBuffer} />
          </div>

          <div className="my-4 border-t border-slate-200" />

          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-ink">Subtotal</span>
            <span className="text-sm font-semibold tabular-nums text-ink">
              {fmt(costs.subtotal)}
            </span>
          </div>

          <div className="flex justify-between items-center mb-5">
            <span className="text-sm text-slate-500">
              Fortjeneste ({settings.defaultMarginPercent}%)
            </span>
            <span className="text-sm tabular-nums text-slate-600">
              {fmt(costs.marginAmount)}
            </span>
          </div>

          {/* Suggested price */}
          <div className="rounded-xl bg-filament/10 px-4 py-3.5">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-ink">
                Foreslått pris
              </span>
              <span className="text-2xl font-bold tabular-nums text-filament">
                {fmt(costs.suggestedPrice)}
              </span>
            </div>
            {costs.quantity > 1 && costs.pricePerUnit && (
              <div className="flex justify-between items-center mt-1.5">
                <span className="text-xs text-slate-500">
                  Per stk ({costs.quantity} stk)
                </span>
                <span className="text-sm font-medium tabular-nums text-slate-600">
                  {fmt(costs.pricePerUnit)}
                </span>
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400 leading-relaxed">
              {settings.printerName} · {settings.watts} W ·{' '}
              {settings.electricityPrice} kr/kWh · {settings.depreciationRate}{' '}
              kr/t slitasje
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
