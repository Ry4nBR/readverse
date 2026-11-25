import assert from 'node:assert/strict'
import test from 'node:test'
import { inspectMobi } from '../src/services/digitalFormats/mobi.js'

function makeMobi() {
  const bytes = new Uint8Array(245)
  const view = new DataView(bytes.buffer)
  const write = (value, offset) => bytes.set(new globalThis.TextEncoder().encode(value), offset)
  write('BOOKMOBI', 60)
  view.setUint16(76, 2)
  view.setUint32(78, 96)
  view.setUint32(86, 240)
  view.setUint16(104, 1)
  write('MOBI', 112)
  view.setUint32(116, 76)
  view.setUint32(124, 65001)
  view.setUint32(180, 124)
  view.setUint32(184, 6)
  write('EXTH', 188)
  view.setUint32(192, 25)
  view.setUint32(196, 1)
  view.setUint32(200, 100)
  view.setUint32(204, 13)
  write('Autor', 208)
  write('Titulo', 220)
  return bytes
}

test('lê o título e o autor de um contêiner MOBI', () => {
  assert.deepEqual(inspectMobi(makeMobi()), { title: 'Titulo', author: 'Autor' })
})

test('rejeita tabelas truncadas e registros fora do arquivo', () => {
  const bytes = makeMobi()
  assert.throws(() => inspectMobi(bytes.subarray(0, 200)), /inválida/)
  new DataView(bytes.buffer).setUint32(86, 90)
  assert.throws(() => inspectMobi(bytes), /inválida/)
})
