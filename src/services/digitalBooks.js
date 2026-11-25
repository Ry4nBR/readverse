import { applyReading, readingOf, ReadingError } from '../utils/reading.js'
import { readerPosition, readerProgress } from '../utils/readerPosition.js'
import { publishBookChange } from './bookChanges.js'

const databaseName = 'bookshelf-digital'
const bookStore = 'books'
const fileStore = 'files'
const mobiEpubKey = (id) => id + ':epub'

export class DigitalStorageError extends Error {}
export class DuplicateDigitalBookError extends DigitalStorageError {
  constructor() {
    super('Este arquivo já está cadastrado na estante digital.')
  }
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = globalThis.indexedDB.open(databaseName, 1)
    request.onupgradeneeded = () => {
      const database = request.result
      database.createObjectStore(bookStore, { keyPath: 'id' }).createIndex('hash', 'hash', { unique: true })
      database.createObjectStore(fileStore)
    }
    request.onsuccess = () => {
      const database = request.result
      database.onversionchange = () => database.close()
      resolve(database)
    }
    request.onerror = () => reject(request.error)
  })
}

async function transact(stores, mode, operation) {
  let database
  try {
    database = await openDatabase()
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(stores, mode)
      let result
      let failure
      transaction.oncomplete = () => resolve(result)
      transaction.onabort = () => reject(failure ?? transaction.error)
      try {
        operation(transaction, (value) => { result = value }, (error) => {
          failure = error
          transaction.abort()
        })
      } catch (error) {
        failure = error
        transaction.abort()
      }
    })
  } catch (error) {
    if (error instanceof DigitalStorageError || error instanceof ReadingError) throw error
    if (error?.name === 'ConstraintError') throw new DuplicateDigitalBookError()
    if (error?.name === 'QuotaExceededError') {
      throw new DigitalStorageError('O navegador ficou sem espaço para armazenar este livro.', { cause: error })
    }
    throw new DigitalStorageError('Não foi possível acessar o armazenamento da estante digital.', { cause: error })
  } finally {
    database?.close()
  }
}

function read(store, requestFor) {
  return transact([store], 'readonly', (transaction, done) => {
    const request = requestFor(transaction.objectStore(store))
    request.onsuccess = () => done(request.result)
  })
}

export const listDigitalBooks = () => read(bookStore, (store) => store.getAll())
export const getDigitalBook = (id) => read(bookStore, (store) => store.get(id))
export const getMobiEpub = (id) => read(fileStore, (store) => store.get(mobiEpubKey(id)))
export const getDigitalFile = (id) => read(fileStore, (store) => store.get(id))
export const hasDigitalFile = async (hash) => !!await read(bookStore, (store) => store.index('hash').getKey(hash))

function editableFields({ title, author, genre, description, status, coverBlob }) {
  return { title, author, genre, description, status, coverBlob }
}

export function saveDigitalBook(draft, metadata) {
  const { file, hash, format } = draft
  const book = {
    ...editableFields(metadata),
    ...applyReading(null, { status: metadata.status ?? 'toRead' }),
    id: globalThis.crypto.randomUUID(),
    importedAt: Date.now(),
    fileName: file.name,
    size: file.size,
    format,
    hash,
  }
  return transact([bookStore, fileStore], 'readwrite', (transaction, done) => {
    transaction.objectStore(bookStore).add(book)
    transaction.objectStore(fileStore).add(file, book.id)
    done(book)
  }).then(publishBookChange)
}

export function updateDigitalBook(id, metadata) {
  return transact([bookStore], 'readwrite', (transaction, done, fail) => {
    const store = transaction.objectStore(bookStore)
    const request = store.get(id)
    request.onsuccess = () => {
      if (!request.result) return fail(new DigitalStorageError('Este livro já foi removido da estante.'))
      const previous = request.result
      try {
        const book = { ...previous, ...editableFields(metadata), ...applyReading(previous, { status: metadata.status ?? previous.status }) }
        store.put(book)
        done(book)
      } catch (error) {
        fail(error)
      }
    }
  }).then(publishBookChange)
}

function updateReadingRecord(id, transform) {
  return transact([bookStore], 'readwrite', (transaction, done, fail) => {
    const store = transaction.objectStore(bookStore)
    const request = store.get(id)
    request.onsuccess = () => {
      const book = request.result
      if (!book) return fail(new DigitalStorageError('O livro digital não está mais na biblioteca.'))
      try {
        const updated = transform(book)
        store.put(updated)
        done(updated)
      } catch (error) {
        fail(error)
      }
    }
  }).then(publishBookChange)
}

export function updateDigitalReading(id, changes) {
  return updateReadingRecord(id, (book) => ({ ...book, ...applyReading(book, changes) }))
}

export async function saveDigitalReaderPosition(id, format, value, percentage) {
  const position = readerPosition(format, value)
  return updateReadingRecord(id, (book) => {
    const reading = readingOf(book)
    if (reading.status === 'finished') return { ...book, readerPosition: position }
    const changes = { status: 'reading', progress: readerProgress(reading.progress, percentage) }
    return { ...book, ...applyReading(book, changes), readerPosition: position }
  })
}

export function toggleEpubBookmark(id, cfi, label) {
  return updateReadingRecord(id, (book) => {
    const position = readerPosition('epub', cfi)
    const bookmarks = book.readerBookmarks ?? []
    if (bookmarks.some((entry) => entry.cfi === cfi)) {
      return { ...book, readerBookmarks: bookmarks.filter((entry) => entry.cfi !== cfi) }
    }
    if (bookmarks.length >= 100) throw new DigitalStorageError('O limite é de 100 marcadores por livro.')
    return { ...book, readerBookmarks: [{ cfi: position.cfi, label: label.slice(0, 200) }, ...bookmarks] }
  })
}

export function saveMobiEpub(id, file) {
  return transact([bookStore, fileStore], 'readwrite', (transaction, done, fail) => {
    const books = transaction.objectStore(bookStore)
    const request = books.get(id)
    request.onsuccess = () => {
      const book = request.result
      if (book?.format !== 'mobi') return fail(new DigitalStorageError('Livro MOBI não encontrado.'))
      if (book.mobiEpub) return fail(new DigitalStorageError('Este livro já tem uma versão EPUB vinculada.'))
      const updated = { ...book, mobiEpub: true }
      books.put(updated)
      transaction.objectStore(fileStore).put(file, mobiEpubKey(id))
      done(updated)
    }
  }).then(publishBookChange)
}

export function deleteDigitalBook(id) {
  return transact([bookStore, fileStore], 'readwrite', (transaction) => {
    transaction.objectStore(bookStore).delete(id)
    transaction.objectStore(fileStore).delete(id)
    transaction.objectStore(fileStore).delete(mobiEpubKey(id))
  }).then(publishBookChange)
}
