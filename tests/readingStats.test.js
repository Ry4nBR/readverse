import assert from 'node:assert/strict'
import test from 'node:test'
import { readingStats } from '../src/utils/readingStats.js'

test('combina catálogos, ignora vínculo duplicado e ordena as inclusões pela data real', () => {
  const physical = { key: 'physical:1', kind: 'physical', status: 'reading', createdAt: 10 }
  const digital = { key: 'digital:1', kind: 'digital', status: 'finished', importedAt: 20 }
  const queued = { key: 'physical:2', kind: 'physical', createdAt: 5 }
  const stats = readingStats([physical, digital, physical, queued])
  assert.deepEqual(stats.counts, { physical: 2, digital: 1, finished: 1, reading: 1, toRead: 1 })
  assert.deepEqual(stats.recent.map((book) => book.key), [digital.key, physical.key, queued.key])
  assert.equal(stats.finished[0].activity.completedDate, '')
})
