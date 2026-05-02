import { useState, useRef } from 'react'
import { Trash2, Plus } from 'lucide-react'
import { useSettings } from '../hooks/useSettings'

function SectionCard({ title, children }) {
  return (
    <div className="bg-white rounded-card border border-slate-200 p-6 shadow-sm">
      <h2 className="text-base font-semibold text-ink mb-5">{title}</h2>
      {children}
    </div>
  )
}

function Field({ label, unit, children }) {
  return (
    <div className="flex items-center gap-4">
      <label className="w-52 shrink-0 text-sm text-slate-600">{label}</label>
      <div className="flex-1 flex items-center gap-2">
        {children}
        {unit && <span className="text-xs text-slate-400 whitespace-nowrap">{unit}</span>}
      </div>
    </div>
  )
}

export default function Settings() {
  const { settings, loading, updateSetting, addFilament, removeFilament } =
    useSettings()
  const [toast, setToast] = useState(false)
  const [showAddFilament, setShowAddFilament] = useState(false)
  const [newFilament, setNewFilament] = useState({
    name: '',
    color: '#F97316',
    pricePerKg: 200,
  })
  const importRef = useRef(null)

  const showSaved = () => {
    setToast(true)
    setTimeout(() => setToast(false), 2000)
  }

  const save = async (key, value) => {
    await updateSetting(key, value)
    showSaved()
  }

  const saveNum = (key, raw, min = 0, max = Infinity) => {
    const v = parseFloat(raw)
    if (!isNaN(v) && v >= min && v <= max) save(key, v)
  }

  const handleAddFilament = async () => {
    if (!newFilament.name.trim()) return
    await addFilament(newFilament)
    setNewFilament({ name: '', color: '#F97316', pricePerKg: 200 })
    setShowAddFilament(false)
    showSaved()
  }

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sliceprice-innstillinger-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        for (const [key, value] of Object.entries(data)) {
          await updateSetting(key, value)
        }
        showSaved()
        // Reload so uncontrolled inputs reflect new values
        setTimeout(() => window.location.reload(), 600)
      } catch {
        alert('Ugyldig JSON-fil')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Laster innstillinger...
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-ink text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
          Lagret
        </div>
      )}

      {/* Printerinnstillinger */}
      <SectionCard title="Printerinnstillinger">
        <div className="space-y-4">
          <Field label="Printernavn">
            <input
              className="input-field"
              defaultValue={settings.printerName}
              onBlur={(e) => save('printerName', e.target.value)}
            />
          </Field>
          <Field label="Wattforbruk" unit="W">
            <input
              type="number"
              min="0"
              step="10"
              className="input-field"
              defaultValue={settings.watts}
              onBlur={(e) => saveNum('watts', e.target.value)}
            />
          </Field>
          <Field label="Slitasjekostnad" unit="kr/t">
            <input
              type="number"
              min="0"
              step="0.5"
              className="input-field"
              defaultValue={settings.depreciationRate}
              onBlur={(e) => saveNum('depreciationRate', e.target.value)}
            />
          </Field>
        </div>
      </SectionCard>

      {/* Strøm */}
      <SectionCard title="Strøm">
        <Field label="Strømpris" unit="kr/kWh">
          <input
            type="number"
            min="0"
            step="0.01"
            className="input-field"
            defaultValue={settings.electricityPrice}
            onBlur={(e) => saveNum('electricityPrice', e.target.value)}
          />
        </Field>
      </SectionCard>

      {/* Filamentbibliotek */}
      <SectionCard title="Filamentbibliotek">
        <div className="space-y-2 mb-4">
          {settings.filaments.length === 0 ? (
            <p className="text-sm text-slate-400">Ingen filament lagt til ennå.</p>
          ) : (
            settings.filaments.map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-surface"
              >
                <div
                  className="w-5 h-5 rounded-full border border-slate-200 shrink-0"
                  style={{ backgroundColor: f.color }}
                />
                <span className="flex-1 text-sm text-ink">{f.name}</span>
                <span className="text-sm text-slate-500 tabular-nums">
                  {f.pricePerKg} kr/kg
                </span>
                <button
                  onClick={() => {
                    removeFilament(f.id)
                    showSaved()
                  }}
                  className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                  aria-label="Slett"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {showAddFilament ? (
          <div className="rounded-lg border border-precision/30 bg-precision/5 p-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs text-slate-500 mb-1">Navn</label>
                <input
                  className="input-field"
                  placeholder="f.eks. PETG - Svart"
                  value={newFilament.name}
                  onChange={(e) =>
                    setNewFilament((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Farge</label>
                <input
                  type="color"
                  className="h-9 w-full rounded-lg border border-slate-200 cursor-pointer p-0.5"
                  value={newFilament.color}
                  onChange={(e) =>
                    setNewFilament((p) => ({ ...p, color: e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">
                Pris per kg (kr)
              </label>
              <input
                type="number"
                min="0"
                step="10"
                className="input-field"
                value={newFilament.pricePerKg}
                onChange={(e) =>
                  setNewFilament((p) => ({
                    ...p,
                    pricePerKg: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleAddFilament}
                className="flex-1 rounded-lg bg-filament text-white text-sm font-medium py-2 hover:bg-filament/90 active:scale-95 transition-all"
              >
                Legg til
              </button>
              <button
                onClick={() => setShowAddFilament(false)}
                className="flex-1 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium py-2 hover:bg-slate-50 transition-colors"
              >
                Avbryt
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddFilament(true)}
            className="flex items-center gap-2 text-sm font-medium text-precision hover:text-precision/80 transition-colors"
          >
            <Plus size={15} />
            Legg til filament
          </button>
        )}
      </SectionCard>

      {/* Arbeid */}
      <SectionCard title="Arbeid">
        <Field label="Timepris" unit="kr/t">
          <input
            type="number"
            min="0"
            step="10"
            className="input-field"
            defaultValue={settings.laborRate}
            onBlur={(e) => saveNum('laborRate', e.target.value)}
          />
        </Field>
      </SectionCard>

      {/* Standardverdier */}
      <SectionCard title="Standardverdier">
        <div className="space-y-4">
          <Field label="Standard svinnprosent" unit="%">
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              className="input-field"
              defaultValue={settings.defaultFailurePercent}
              onBlur={(e) => saveNum('defaultFailurePercent', e.target.value, 0, 100)}
            />
          </Field>
          <Field label="Standard fortjenestemargin" unit="%">
            <input
              type="number"
              min="0"
              max="99"
              step="1"
              className="input-field"
              defaultValue={settings.defaultMarginPercent}
              onBlur={(e) => saveNum('defaultMarginPercent', e.target.value, 0, 99)}
            />
          </Field>
        </div>
      </SectionCard>

      {/* Sikkerhetskopiering */}
      <SectionCard title="Sikkerhetskopiering">
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex-1 rounded-lg bg-ink text-white text-sm font-medium py-2.5 hover:bg-slate-800 active:scale-95 transition-all"
          >
            Eksporter innstillinger
          </button>
          <button
            onClick={() => importRef.current?.click()}
            className="flex-1 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium py-2.5 hover:bg-slate-50 active:scale-95 transition-all"
          >
            Importer innstillinger
          </button>
          <input
            ref={importRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
        </div>
      </SectionCard>
    </div>
  )
}
