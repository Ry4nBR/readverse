import assert from 'node:assert/strict'
import test from 'node:test'
import { accessibleAccent, contrastRatio } from '../src/utils/themeColor.js'
import { normalizeAppearance } from '../src/services/appearance.js'

test('adapta qualquer destaque aos fundos claros e escuros', () => {
  for (const [theme, background] of Object.entries({ light: '#f8f5ef', dark: '#242825', sepia: '#f1e5cd' })) {
    for (const selected of ['#ffffff', '#000000', '#ff00aa', '#ffff00', '#223d62']) {
      const { accent, foreground } = accessibleAccent(selected, theme)
      assert.ok(contrastRatio(accent, background) >= 5.5)
      assert.ok(contrastRatio(accent, foreground) >= 4.5)
    }
  }
})

test('preferências antigas e inválidas recebem valores padrão', () => {
  const fallback = normalizeAppearance({ theme: 'outro', accent: 'red' })
  assert.equal(fallback.theme, 'light')
  assert.equal(fallback.accent, null)
  assert.equal(fallback.density, 'comfortable')
  assert.equal(fallback.showAuthors, true)
  assert.equal(normalizeAppearance({ showAuthors: false, density: 'compact', mode: 'grid' }).showAuthors, false)
  assert.equal(normalizeAppearance({ theme: 'dark' }).accent, null)
})
