import { isbnKey, normalizeIsbn } from '../utils/isbn.js'

const text = (value) => typeof value === 'string' ? value.trim() : ''
const names = (values) => Array.isArray(values) ? values.map(text).filter(Boolean).join(', ') : ''
const namedEntries = (values) => Array.isArray(values) ? names(values.map((entry) => entry?.name)) : ''
const year = (value) => text(value).match(/\b[12]\d{3}\b/)?.[0] ?? ''

function coverUrl(value) {
  try {
    const url = new URL(text(value))
    if (url.protocol === 'http:') url.protocol = 'https:'
    return url.protocol === 'https:' ? url.href : ''
  } catch {
    return ''
  }
}

async function requestJson(url, signal) {
  const timeout = AbortSignal.timeout(8000)
  const response = await fetch(url, { signal: signal ? AbortSignal.any([signal, timeout]) : timeout })
  if (!response.ok) throw new Error('O catálogo respondeu com HTTP ' + response.status)
  const data = await response.json()
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('O catálogo retornou uma resposta inválida.')
  }
  return data
}

async function googleBook(isbn, signal) {
  const url = new URL('https://www.googleapis.com/books/v1/volumes')
  url.searchParams.set('q', 'isbn:' + isbn)
  const key = import.meta.env?.VITE_GOOGLE_BOOKS_API_KEY?.trim()
  if (key) url.searchParams.set('key', key)
  const data = await requestJson(url, signal)
  if (!Array.isArray(data.items)) {
    if (data.totalItems === 0) return null
    throw new Error('Resposta incompleta do Google Books.')
  }
  const requested = isbnKey(isbn)
  const info = data.items.map((item) => item?.volumeInfo).find((volume) =>
    text(volume?.title) && Array.isArray(volume.industryIdentifiers) &&
    volume.industryIdentifiers.some((entry) => isbnKey(text(entry?.identifier)) === requested),
  )
  if (!info) return null
  return {
    title: text(info.title), author: names(info.authors), publisher: text(info.publisher),
    year: year(info.publishedDate), isbn, description: text(info.description),
    coverUrl: coverUrl(info.imageLinks?.thumbnail) || coverUrl(info.imageLinks?.smallThumbnail),
  }
}

async function openLibraryBook(isbn, signal) {
  const url = new URL('https://openlibrary.org/api/books')
  const bibkey = 'ISBN:' + isbn
  url.search = new URLSearchParams({ bibkeys: bibkey, jscmd: 'data', format: 'json' })
  const data = await requestJson(url, signal)
  const book = data[bibkey]
  if (!text(book?.title)) return null
  return {
    title: text(book.title), author: namedEntries(book.authors), publisher: namedEntries(book.publishers),
    year: year(book.publish_date), isbn, description: text(book.description) || text(book.description?.value),
    coverUrl: coverUrl(book.cover?.large) || coverUrl(book.cover?.medium) || coverUrl(book.cover?.small),
  }
}

export async function lookupBook(value, { signal } = {}) {
  const isbn = normalizeIsbn(value)
  if (!isbnKey(isbn)) throw new Error('Informe um ISBN-10 ou ISBN-13 válido.')

  let googleUnavailable = false
  try {
    const book = await googleBook(isbn, signal)
    if (book) return book
  } catch {
    signal?.throwIfAborted()
    googleUnavailable = true
  }

  try {
    const book = await openLibraryBook(isbn, signal)
    if (book || !googleUnavailable) return book
  } catch {
    signal?.throwIfAborted()
  }

  throw new Error('A pesquisa não pôde ser concluída. Tente novamente ou preencha os dados manualmente.')
}
