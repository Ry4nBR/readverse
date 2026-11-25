import assert from 'node:assert/strict'
import test from 'node:test'
import { indexedDB } from 'fake-indexeddb'
import { createShelf, deleteShelf, listShelves, moveShelfBook, reorderShelf, updateShelf } from '../src/services/customShelves.js'

globalThis.indexedDB = indexedDB
const data = { name: '  Fantasia ', description: ' Releituras ', color: '#a13c60' }

test('cria, edita e exclui estantes recuperáveis em novas conexões', async () => {
  const [shelf] = await createShelf(data)
  assert.equal(shelf.name, 'Fantasia')
  assert.equal(shelf.description, 'Releituras')
  assert.deepEqual(await listShelves(), [shelf])
  await assert.rejects(updateShelf(shelf.id, { ...data, color: 'blue' }), /cor válida/)
  await updateShelf(shelf.id, { ...data, name: 'Romance' })
  assert.equal((await listShelves())[0].name, 'Romance')
  await deleteShelf(shelf.id)
  assert.deepEqual(await listShelves(), [])
})

test('salva a nova ordem e mantém os limites da lista', async () => {
  const [first] = await createShelf(data)
  const [, second] = await createShelf({ ...data, name: 'Faculdade' })
  await reorderShelf(second.id, -1)
  await reorderShelf(second.id, -1)
  assert.deepEqual((await listShelves()).map(({ id }) => id), [second.id, first.id])
  await deleteShelf(first.id)
  await deleteShelf(second.id)
})

test('move o vínculo, preserva tipos distintos e impede duplicação mesmo com chamadas concorrentes', async () => {
  const [first] = await createShelf(data)
  const [, second] = await createShelf({ ...data, name: 'Faculdade' })
  await Promise.all([
    moveShelfBook('physical:1', first.id),
    moveShelfBook('digital:1', first.id),
    moveShelfBook('physical:1', first.id),
  ])
  await moveShelfBook('physical:1', second.id)
  assert.deepEqual((await listShelves()).map(({ books }) => books), [['digital:1'], ['physical:1']])
  await assert.rejects(moveShelfBook('physical:1', 'excluída'), /destino/)
  await moveShelfBook('physical:1', '')
  assert.deepEqual((await listShelves())[1].books, [])
  await deleteShelf(first.id)
  await deleteShelf(second.id)
})
