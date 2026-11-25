import assert from 'node:assert/strict'
import test from 'node:test'
import { annualProgress, genresOf, monthlyCompletions, readingStats } from '../src/utils/readingStats.js'

test('combina catálogos, ignora vínculo duplicado e ordena as inclusões pela data real', () => {
  const physical = { key: 'physical:1', kind: 'physical', status: 'reading', createdAt: 10 }
  const digital = { key: 'digital:1', kind: 'digital', status: 'finished', importedAt: 20 }
  const queued = { key: 'physical:2', kind: 'physical', createdAt: 5 }
  const stats = readingStats([physical, digital, physical, queued])
  assert.deepEqual(stats.counts, { physical: 2, digital: 1, finished: 1, reading: 1, toRead: 1 })
  assert.deepEqual(stats.recent.map((book) => book.key), [digital.key, physical.key, queued.key])
  assert.equal(stats.finished[0].activity.completedDate, '')
  assert.deepEqual(genresOf(stats.books), [{ key: 'unclassified', label: 'Sem gênero', value: 3 }])
})

test('a distribuição agrupa grafias equivalentes e inclui livros sem gênero', () => {
  const items = genresOf([{ genre: 'Ficção' }, { genre: ' ficcao ' }, { genre: '' }, { genre: 'História' }])
  assert.equal(items[0].label, 'Ficção')
  assert.equal(items[0].value, 2)
  assert.ok(items.some((item) => item.key === 'unclassified' && item.value === 1))
  assert.equal(items.reduce((total, item) => total + item.value, 0), 4)
})

test('a meta anual usa uma conclusão datada por registro e aceita superar a meta', () => {
  const inYear = { key: 'digital:1', kind: 'digital', status: 'finished', reading: { completedDate: '2026-12-31' } }
  const stats = readingStats([
    inYear, inYear,
    { key: 'physical:2', kind: 'physical', status: 'finished', reading: { completedDate: '2026-01-01' } },
    { key: 'physical:3', kind: 'physical', status: 'finished', reading: { completedDate: '2025-12-31' } },
    { key: 'digital:4', kind: 'digital', status: 'finished' },
    { key: 'digital:5', kind: 'digital', status: 'reading', reading: { completedDate: '2026-01-01' } },
  ])
  assert.deepEqual(annualProgress(stats.finished, 2026, 1), { completed: 2, remaining: 0, percentage: 200 })
  assert.deepEqual(annualProgress(stats.finished, 2026, 3), { completed: 2, remaining: 1, percentage: 66 })
  const sameYear = Array.from({ length: 29 }, (_, index) => ({
    key: 'physical:' + index, status: 'finished', reading: { completedDate: '2026-01-01' },
  }))
  assert.equal(annualProgress(readingStats(sameYear).finished, 2026, 100).percentage, 29)
  assert.deepEqual(monthlyCompletions(stats.finished, 2026), [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1])
})
