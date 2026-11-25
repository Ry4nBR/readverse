import assert from 'node:assert/strict'
import test from 'node:test'
import { indexedDB } from 'fake-indexeddb'
import { savePhysicalBook, getPhysicalBook } from '../src/services/physicalBooks.js'
import { saveDigitalBook, getDigitalBook, getDigitalFile, updateDigitalBook, saveDigitalReaderPosition } from '../src/services/digitalBooks.js'
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
    await updateDigitalBook(digital.id, { ...metadata, title: 'Título atualizado', status: undefined })

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

test('a última página atualiza a posição sem concluir e voltar não reduz progresso', async () => {
  const file = new globalThis.File(['original'], 'teste.pdf')
  const book = await saveDigitalBook({ file, format: 'pdf', hash: 'leitor' }, { title: 'PDF', author: 'Autora' })
  const last = await saveDigitalReaderPosition(book.id, 'pdf', 7, 100)
  assert.equal(last.status, 'reading')
  assert.equal(last.reading.progress, 99)
  assert.equal(last.reading.completedDate, '')
  assert.ok(last.reading.startDate)
  const earlier = await saveDigitalReaderPosition(book.id, 'pdf', 2, 1)
  assert.deepEqual(earlier.readerPosition, { format: 'pdf', page: 2 })
  assert.equal(earlier.reading.progress, 99)
  await updateBookReading('digital', book.id, { status: 'finished' })
  const completed = await saveDigitalReaderPosition(book.id, 'pdf', 1, 0)
  assert.equal(completed.status, 'finished')
  assert.equal(completed.reading.progress, 100)
  assert.ok(completed.reading.completedDate)
  await assert.rejects(saveDigitalReaderPosition(book.id, 'pdf', 0, 0), /Posição/)
})
