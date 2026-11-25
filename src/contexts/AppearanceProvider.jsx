import { useLayoutEffect, useState } from 'react'
import { loadAppearance, saveAppearance } from '../services/appearance.js'
import { accessibleAccent } from '../utils/themeColor.js'
import { AppearanceContext } from './appearanceContext.js'

export default function AppearanceProvider({ children }) {
  const [preferences, setPreferences] = useState(loadAppearance)

  useLayoutEffect(() => {
    const root = document.documentElement
    root.dataset.theme = preferences.theme
    if (preferences.accent) {
      const { accent, foreground } = accessibleAccent(preferences.accent, preferences.theme)
      root.style.setProperty('--accent', accent)
      root.style.setProperty('--on-accent', foreground)
      root.style.setProperty('--accent-light', 'color-mix(in srgb, ' + accent + ' 12%, var(--surface))')
    }
    return () => {
      delete root.dataset.theme
      for (const property of ['--accent', '--on-accent', '--accent-light']) root.style.removeProperty(property)
    }
  }, [preferences.theme, preferences.accent])

  function update(changes) {
    setPreferences(saveAppearance({ ...preferences, ...changes }))
  }

  return <AppearanceContext.Provider value={{ preferences, update }}>{children}</AppearanceContext.Provider>
}
