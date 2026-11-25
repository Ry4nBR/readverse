const key = 'bookshelf.reader-preferences.v1'
export const fontSizes = [14, 16, 18, 20, 22, 24, 28, 32]
export const fonts = { serif: 'Serifada', sans: 'Sem serifa' }
export const lineHeights = [1.3, 1.6, 1.9, 2.2]
export const margins = [8, 16, 24, 36, 48]

export function normalizeReaderPreferences(value) {
  return {
    size: fontSizes.includes(value?.size) ? value.size : 18,
    font: Object.hasOwn(fonts, value?.font) ? value.font : 'serif',
    lineHeight: lineHeights.includes(value?.lineHeight) ? value.lineHeight : 1.6,
    margin: margins.includes(value?.margin) ? value.margin : 16,
  }
}

export function getReaderPreferences() {
  try {
    return normalizeReaderPreferences(JSON.parse(globalThis.localStorage.getItem(key)))
  } catch {
    return normalizeReaderPreferences(null)
  }
}

export function saveReaderPreferences(preferences) {
  globalThis.localStorage.setItem(key, JSON.stringify(normalizeReaderPreferences(preferences)))
}
