const databaseName = 'bookshelf-digital'
const bookStore = 'books'
const fileStore = 'files'

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
    if (error instanceof DigitalStorageError) throw error
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
export const getDigitalFile = (id) => read(fileStore, (store) => store.get(id))
export const hasDigitalFile = async (hash) => !!await read(bookStore, (store) => store.index('hash').getKey(hash))

function editableFields({ title, author, genre, description, status, coverBlob }) {
  return { title, author, genre, description, status, coverBlob }
}

export function saveDigitalBook(draft, metadata) {
  const { file, hash, format } = draft
  const book = {
    ...editableFields(metadata),
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
  })
}

export function updateDigitalBook(id, metadata) {
  return transact([bookStore], 'readwrite', (transaction, done, fail) => {
    const store = transaction.objectStore(bookStore)
    const request = store.get(id)
    request.onsuccess = () => {
      if (!request.result) return fail(new DigitalStorageError('Este livro já foi removido da estante.'))
      const book = { ...request.result, ...editableFields(metadata) }
      store.put(book)
      done(book)
    }
  })
}

export function deleteDigitalBook(id) {
  return transact([bookStore, fileStore], 'readwrite', (transaction) => {
    transaction.objectStore(bookStore).delete(id)
    transaction.objectStore(fileStore).delete(id)
  })
}
