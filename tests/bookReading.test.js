import assert from 'node:assert/strict'
import test from 'node:test'
import { indexedDB } from 'fake-indexeddb'
import { savePhysicalBook, getPhysicalBook } from '../src/services/physicalBooks.js'
import { saveDigitalBook, getDigitalBook, getDigitalFile, updateDigitalBook } from '../src/services/digitalBooks.js'
import { updateBookReading } from '../src/services/bookReading.js'
import { subscribeToBookChanges } from '../src/services/bookChanges.js'

globalThis.indexedDB = indexedDB

test('grava a leitura nos dois catálogos e mantém arquivos e metadados de edição', async () => {
  let changes = 0
  const unsubscribe = subscribeToBookChanges(() => { changes++ })
  try {
    const metadata = { title: 'Título', author: 'Autoria', status: 'reading', isbn: '' }
    const physical = await savePhysicalBook(metadata)
    const file = new globalThis.File(['original'], 'teste.epub')
    const digital = await saveDigitalBook({ file, format: 'epub', hash: 'progresso' }, metadata)
    assert.equal(changes, 2)

    await updateBookReading('physical', physical.id, { progress: 42, rating: 4 })
    await updateBookReading('digital', digital.id, { progress: 100, notes: 'Concluído' })
    await updateDigitalBook(digital.id, { ...metadata, title: 'Título atualizado', status: 'finished' })

    assert.equal((await getPhysicalBook(physical.id)).reading.progress, 42)
    assert.equal((await getDigitalBook(digital.id)).reading.notes, 'Concluído')
    assert.equal((await getDigitalBook(digital.id)).status, 'finished')
    assert.equal(await (await getDigitalFile(digital.id)).text(), 'original')
    await assert.rejects(updateBookReading('digital', digital.id, { rating: 0 }), /avaliação/)
    assert.equal(changes, 5)
  } finally {
    unsubscribe()
  }
})
