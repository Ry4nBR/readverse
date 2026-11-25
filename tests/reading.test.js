import assert from 'node:assert/strict'
import test from 'node:test'
import { applyReading, readingOf } from '../src/utils/reading.js'

const today = '2026-11-25'

test('status anteriores continuam válidos sem inventar data de conclusão', () => {
  assert.equal(readingOf({ status: 'finished' }).completedDate, '')
  assert.equal(readingOf({ status: 'finished' }).progress, 100)
  assert.equal(applyReading({ status: 'finished' }, { notes: 'Legado' }, today).reading.completedDate, '')
})

test('transições mantêm status, progresso e datas consistentes', () => {
  const started = applyReading({}, { status: 'reading' }, today)
  assert.equal(started.reading.startDate, today)
  const finished = applyReading(started, { progress: 100 }, today)
  assert.equal(finished.status, 'finished')
  assert.equal(finished.reading.completedDate, today)
  const reopened = applyReading(finished, { status: 'reading' }, today)
  assert.equal(reopened.reading.progress, 0)
  assert.equal(reopened.reading.completedDate, '')
  assert.equal(applyReading(reopened, { status: 'toRead' }, today).reading.startDate, '')
})

test('um progresso isolado inicia a leitura ou conclui ao chegar a 100%', () => {
  const started = applyReading({ status: 'toRead' }, { progress: 34 }, today)
  assert.equal(started.status, 'reading')
  assert.equal(started.reading.progress, 34)
  assert.equal(started.reading.startDate, today)
  const finished = applyReading({ status: 'toRead' }, { progress: 100 }, today)
  assert.equal(finished.status, 'finished')
  assert.equal(finished.reading.completedDate, today)
})

test('rejeita cronologia inválida, datas futuras, progresso e avaliação fora dos limites', () => {
  const update = (changes) => applyReading({ status: 'finished' }, changes, today)
  assert.throws(() => update({ startDate: '2026-11-20', completedDate: '2026-11-19' }), /depois/)
  assert.throws(() => update({ completedDate: '2026-12-01' }), /futuro/)
  assert.throws(() => update({ completedDate: '2026-02-30' }), /válidas/)
  assert.throws(() => update({ rating: 6 }), /avaliação/)
  assert.throws(() => update({ progress: 101 }), /progresso/)
})
