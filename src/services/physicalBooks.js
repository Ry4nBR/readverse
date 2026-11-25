import { applyReading } from '../utils/reading.js'
import { publishBookChange } from './bookChanges.js'
import { isbnKey, normalizeIsbn } from '../utils/isbn.js'

const databaseName = 'bookshelf'
const storeName = 'physicalBooks'

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = globalThis.indexedDB.open(databaseName, 1)
    request.onupgradeneeded = () => {
      const store = request.result.createObjectStore(storeName, { keyPath: 'id' })
      store.createIndex('isbnKey', 'isbnKey', { unique: true })
    }
    request.onsuccess = () => {
      const database = request.result
      database.onversionchange = () => database.close()
      resolve(database)
    }
    request.onerror = () => reject(request.error)
  })
}

async function transact(mode, operation) {
  const database = await openDatabase()
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, mode)
      let result
      let failure
      transaction.oncomplete = () => resolve(result)
      transaction.onabort = () => reject(failure ?? transaction.error)
      operation(transaction.objectStore(storeName), (value) => { result = value }, (error) => {
        failure = error
        transaction.abort()
      })
    })
  } finally {
    database.close()
  }
}

export function listPhysicalBooks() {
  return transact('readonly', (store, done) => {
    const request = store.getAll()
    request.onsuccess = () => done(request.result)
  })
}

export function getPhysicalBook(id) {
  return transact('readonly', (store, done) => {
    const request = store.get(id)
    request.onsuccess = () => done(request.result)
  })
}

export function findPhysicalBookByIsbn(isbn) {
  const key = isbnKey(isbn)
  if (!key) return Promise.resolve(undefined)
  return transact('readonly', (store, done) => {
    const request = store.index('isbnKey').get(key)
    request.onsuccess = () => done(request.result)
  })
}

export function deletePhysicalBook(id) {
  return transact('readwrite', (store) => store.delete(id)).then(publishBookChange)
}

const comparable = (text) => text.trim().normalize('NFC').toLocaleLowerCase('pt-BR').replace(/\s+/g, ' ')

export function updatePhysicalReading(id, changes) {
  return transact('readwrite', (store, done, fail) => {
    const request = store.get(id)
    request.onsuccess = () => {
      const book = request.result
      if (!book) return fail(new Error('O livro físico não está mais na biblioteca.'))
      try {
        const updated = { ...book, ...applyReading(book, changes) }
        store.put(updated)
        done(updated)
      } catch (error) {
        fail(error)
      }
    }
  }).then(publishBookChange)
}

export class DuplicateBookError extends Error {}

export function savePhysicalBook(book, id) {
  const isbn = normalizeIsbn(book.isbn)
  const key = isbnKey(isbn)
  if (isbn && !key) return Promise.reject(new Error('Informe um ISBN válido.'))

  return transact('readwrite', (store, done, fail) => {
    const request = store.getAll()
    request.onsuccess = () => {
      const books = request.result
      const previous = books.find((entry) => entry.id === id)
      if (id && !previous) return fail(new Error('Este livro já foi removido da estante.'))
      if (key && books.some((entry) => entry.id !== id && entry.isbnKey === key)) {
        return fail(new DuplicateBookError('Este ISBN já está cadastrado na estante.'))
      }
      if (books.some((entry) => entry.id !== id && (!key || !entry.isbnKey) &&
        comparable(entry.title) === comparable(book.title) &&
        comparable(entry.author) === comparable(book.author))) {
        return fail(new DuplicateBookError('Já existe um livro com o mesmo título e autor na estante.'))
      }
      let reading
      try {
        reading = applyReading(previous, { status: book.status ?? previous?.status ?? 'toRead' })
      } catch (error) {
        return fail(error)
      }
      const saved = {
        ...book, ...reading, isbn, isbnKey: key, id: id ?? crypto.randomUUID(),
        createdAt: previous?.createdAt ?? Date.now(),
      }
      store.put(saved)
      done(saved)
    }
  }).then(publishBookChange)
}
