const key = 'bookshelf.appearance.v1'

export const themes = { light: 'Claro', dark: 'Escuro', sepia: 'Sépia' }
export const defaultAppearance = { theme: 'light', accent: null }

export function normalizeAppearance(value) {
  return {
    theme: Object.hasOwn(themes, value?.theme) ? value.theme : defaultAppearance.theme,
    accent: typeof value?.accent === 'string' && /^#[0-9a-f]{6}$/i.test(value.accent) ? value.accent : null,
  }
}

export function loadAppearance() {
  try {
    return normalizeAppearance(JSON.parse(globalThis.localStorage.getItem(key)))
  } catch {
    return { ...defaultAppearance }
  }
}

export function saveAppearance(value) {
  const normalized = normalizeAppearance(value)
  globalThis.localStorage.setItem(key, JSON.stringify(normalized))
  return normalized
}
