import { useState, useEffect, useCallback } from 'react'
import { getAllSettings, setSetting } from '../lib/db'

const DEFAULTS = {
  printerName: 'Min printer',
  watts: 200,
  depreciationRate: 2.5,
  electricityPrice: 1.2,
  filaments: [{ id: 1, name: 'PLA - Hvit', color: '#FFFFFF', pricePerKg: 200 }],
  laborRate: 350,
  defaultFailurePercent: 5,
  defaultMarginPercent: 30,
}

export function useSettings() {
  const [settings, setSettings] = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllSettings().then((stored) => {
      setSettings({ ...DEFAULTS, ...stored })
      setLoading(false)
    })
  }, [])

  const updateSetting = useCallback(async (key, value) => {
    await setSetting(key, value)
    setSettings((prev) => ({ ...prev, [key]: value }))
  }, [])

  const addFilament = useCallback(async (filament) => {
    setSettings((prev) => {
      const newId =
        prev.filaments.length > 0
          ? Math.max(...prev.filaments.map((f) => f.id)) + 1
          : 1
      const newFilaments = [...prev.filaments, { ...filament, id: newId }]
      setSetting('filaments', newFilaments)
      return { ...prev, filaments: newFilaments }
    })
  }, [])

  const removeFilament = useCallback(async (id) => {
    setSettings((prev) => {
      const newFilaments = prev.filaments.filter((f) => f.id !== id)
      setSetting('filaments', newFilaments)
      return { ...prev, filaments: newFilaments }
    })
  }, [])

  const updateFilament = useCallback(async (id, updates) => {
    setSettings((prev) => {
      const newFilaments = prev.filaments.map((f) =>
        f.id === id ? { ...f, ...updates } : f,
      )
      setSetting('filaments', newFilaments)
      return { ...prev, filaments: newFilaments }
    })
  }, [])

  return { settings, loading, updateSetting, addFilament, removeFilament, updateFilament }
}
