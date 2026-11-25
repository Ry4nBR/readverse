import { useLayoutEffect, useState } from 'react'
import { loadAppearance, saveAppearance } from '../services/appearance.js'
import { AppearanceContext } from './appearanceContext.js'

export default function AppearanceProvider({ children }) {
  const [preferences, setPreferences] = useState(loadAppearance)

  useLayoutEffect(() => {
    const root = document.documentElement
    root.dataset.theme = preferences.theme
    return () => { delete root.dataset.theme }
  }, [preferences.theme])

  function update(changes) {
    setPreferences(saveAppearance({ ...preferences, ...changes }))
  }

  return <AppearanceContext.Provider value={{ preferences, update }}>{children}</AppearanceContext.Provider>
}
