import assert from 'node:assert/strict'
import test from 'node:test'
import { indexedDB, IDBObjectStore } from 'fake-indexeddb'
import {
  deleteDigitalBook, DuplicateDigitalBookError, getDigitalBook, getDigitalFile,
  hasDigitalFile, listDigitalBooks, saveDigitalBook, updateDigitalBook, getMobiEpub, saveMobiEpub,
} from '../src/services/digitalBooks.js'

globalThis.indexedDB = indexedDB

const document = (content, hash) => ({
  file: new globalThis.File([content], 'livro.pdf', { type: 'application/pdf' }),
  format: 'pdf', hash,
})
const metadata = { title: 'Livro de teste', author: 'Autora', genre: '', description: '', status: 'toRead', coverBlob: null }

test('um único cadastro concorrente é aceito e a edição preserva o arquivo', async () => {
  const first = document('bytes originais', 'mesmo-hash')
  const results = await Promise.allSettled([
    saveDigitalBook(first, metadata),
    saveDigitalBook({ ...first, file: new globalThis.File([first.file], 'renomeado.pdf') }, metadata),
  ])
  const success = results.filter(({ status }) => status === 'fulfilled')
  assert.equal(success.length, 1)
  assert.ok(results.find(({ status }) => status === 'rejected').reason instanceof DuplicateDigitalBookError)
  const { id, importedAt } = success[0].value
  const book = await updateDigitalBook(id, { ...metadata, title: 'Editado', importedAt: 0 })
  assert.equal(book.title, 'Editado')
  assert.equal(book.importedAt, importedAt)
  assert.equal(await (await getDigitalFile(id)).text(), 'bytes originais')
  assert.equal(await listDigitalBooks().then((books) => books.length), 1)

  await deleteDigitalBook(id)
  assert.equal(await getDigitalBook(id), undefined)
  assert.equal(await getDigitalFile(id), undefined)
  assert.equal(await hasDigitalFile(first.hash), false)
})

test('falha de cota cancela a gravação do livro e permite nova tentativa', async (context) => {
  const draft = document('dados', 'hash-cota')
  const add = IDBObjectStore.prototype.add
  const mock = context.mock.method(IDBObjectStore.prototype, 'add', function (...args) {
    if (this.name === 'files') throw new globalThis.DOMException('Cota simulada', 'QuotaExceededError')
    return add.apply(this, args)
  })

  await assert.rejects(saveDigitalBook(draft, metadata), /sem espaço/)
  assert.equal(await hasDigitalFile(draft.hash), false)
  assert.equal((await listDigitalBooks()).length, 0)
  mock.mock.restore()

  const retry = await saveDigitalBook(draft, metadata)
  assert.equal(await (await getDigitalFile(retry.id)).text(), 'dados')
  await deleteDigitalBook(retry.id)
})

test('a versão de leitura do MOBI tem armazenamento independente do original', async () => {
  const file = new globalThis.File(['bytes do MOBI'], 'livro.mobi')
  const converted = new globalThis.File(['bytes do EPUB'], 'livro.epub')
  const { id } = await saveDigitalBook({ file, hash: 'mobi-conversao', format: 'mobi' }, metadata)
  assert.equal((await saveMobiEpub(id, converted)).mobiEpub, true)
  assert.equal(await (await getDigitalFile(id)).text(), 'bytes do MOBI')
  assert.equal(await (await getMobiEpub(id)).text(), 'bytes do EPUB')
  await assert.rejects(saveMobiEpub(id, converted), /já tem/)
  await deleteDigitalBook(id)
  assert.equal(await getMobiEpub(id), undefined)
  assert.equal(await getDigitalFile(id), undefined)
})
