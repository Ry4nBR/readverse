const databaseName = 'bookshelf-organization'
const storeName = 'organization'
const shelvesKey = 'shelves'

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = globalThis.indexedDB.open(databaseName, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(storeName)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const database = request.result
      database.onversionchange = () => database.close()
      resolve(database)
    }
  })
}

async function accessShelves(change) {
  let database
  try {
    database = await openDatabase()
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, change ? 'readwrite' : 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.get(shelvesKey)
      let result
      let failure
      transaction.oncomplete = () => resolve(result)
      transaction.onabort = () => reject(failure ?? transaction.error)
      request.onsuccess = () => {
        const shelves = request.result ?? []
        try {
          result = change ? change(shelves) : shelves
          if (change) store.put(result, shelvesKey)
        } catch (error) {
          failure = error
          transaction.abort()
        }
      }
    })
  } finally {
    database?.close()
  }
}

export class ShelfError extends Error {}
export const listShelves = () => accessShelves()

function fields({ name, description, color }) {
  const shelf = { name: name.trim(), description: description.trim(), color }
  if (!shelf.name || shelf.name.length > 80) throw new ShelfError('Informe um nome de até 80 caracteres.')
  if (shelf.description.length > 400) throw new ShelfError('Use uma descrição de até 400 caracteres.')
  if (!/^#[0-9a-f]{6}$/i.test(color)) throw new ShelfError('Escolha uma cor válida.')
  return shelf
}

export const createShelf = (data) => accessShelves((shelves) => [
  ...shelves, { ...fields(data), id: globalThis.crypto.randomUUID(), books: [] },
])

export const updateShelf = (id, data) => accessShelves((shelves) => {
  if (!shelves.some((shelf) => shelf.id === id)) throw new ShelfError('Esta estante já foi excluída.')
  return shelves.map((shelf) => shelf.id === id ? { ...shelf, ...fields(data) } : shelf)
})

export const reorderShelf = (id, direction) => accessShelves((shelves) => {
  const index = shelves.findIndex((shelf) => shelf.id === id)
  if (index < 0) throw new ShelfError('Esta estante já foi excluída.')
  if (direction !== -1 && direction !== 1) throw new ShelfError('Posição inválida.')
  const target = index + direction
  if (target < 0 || target >= shelves.length) return shelves
  const ordered = [...shelves]
  ;[ordered[index], ordered[target]] = [ordered[target], ordered[index]]
  return ordered
})

export const deleteShelf = (id) => accessShelves((shelves) => shelves.filter((shelf) => shelf.id !== id))
