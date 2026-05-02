import { useState, useEffect, useCallback } from 'react'
import { getAllSettings, setSetting } from '../lib/db'

const DEFAULTS = {
  filamentPricePerKg: 250,
  electricityKwh: 0.15,
  electricityPrice: 1.2,
  failureRate: 0.05,
  markupPercent: 20,
  currency: 'NOK',
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

  return { settings, loading, updateSetting }
}
