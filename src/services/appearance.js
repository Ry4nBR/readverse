const key = 'bookshelf.appearance.v1'

export const themes = { light: 'Claro', dark: 'Escuro', sepia: 'Sépia' }
export const defaultAppearance = { theme: 'light' }

export function normalizeAppearance(value) {
  return { theme: Object.hasOwn(themes, value?.theme) ? value.theme : defaultAppearance.theme }
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
