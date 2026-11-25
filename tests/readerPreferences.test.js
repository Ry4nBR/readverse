import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeReaderPreferences } from '../src/services/readerPreferences.js'

test('preserva escolhas do leitor e corrige preferências antigas ou inválidas', () => {
  const choices = { theme: 'sepia', size: 28, font: 'sans', lineHeight: 1.9, margin: 24 }
  assert.deepEqual(normalizeReaderPreferences(choices), choices)
  assert.deepEqual(normalizeReaderPreferences({ size: 500, theme: 'invalid', font: 'invalid', lineHeight: 0 }), {
    theme: 'light', size: 18, font: 'serif', lineHeight: 1.6, margin: 16,
  })
})
