import assert from 'node:assert/strict'
import test from 'node:test'
import { indexedDB } from 'fake-indexeddb'
import { createShelf, deleteShelf, listShelves, updateShelf } from '../src/services/customShelves.js'

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
