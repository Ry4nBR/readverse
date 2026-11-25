import { searchKey } from './librarySearch.js'
import { readingOf, validReadingDate } from './reading.js'

export function completedInYear(finished, year) {
  return finished.filter(({ activity: { completedDate } }) =>
    validReadingDate(completedDate) && Number(completedDate.slice(0, 4)) === year,
  )
}

export function monthlyCompletions(finished, year) {
  const months = Array(12).fill(0)
  for (const { activity } of completedInYear(finished, year)) {
    months[Number(activity.completedDate.slice(5, 7)) - 1]++
  }
  return months
}

export function annualProgress(finished, year, goal) {
  const completed = completedInYear(finished, year).length
  return {
    completed, remaining: goal === null ? null : Math.max(0, goal - completed),
    percentage: goal === null ? null : Math.floor(completed * 100 / goal),
  }
}

export function genresOf(books) {
  const genres = new Map()
  for (const book of books) {
    const label = book.genre?.trim()
    const key = label ? 'genre:' + searchKey(label) : 'unclassified'
    const entry = genres.get(key) ?? { key, label: label || 'Sem gênero', value: 0 }
    entry.value++
    genres.set(key, entry)
  }
  return [...genres.values()].sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, 'pt-BR'))
}

export function readingStats(catalog) {
  const books = [...new Map(catalog.map((book) => [book.key, book])).values()]
    .map((book) => ({ ...book, activity: readingOf(book) }))
  const byStatus = (status) => books.filter((book) => book.activity.status === status)
  const reading = byStatus('reading')
  const finished = byStatus('finished')
  const toRead = byStatus('toRead')
  const recent = [...books].sort((a, b) => (b.importedAt ?? b.createdAt ?? 0) - (a.importedAt ?? a.createdAt ?? 0))
  return {
    books, reading, finished, toRead, recent,
    counts: {
      physical: books.filter((book) => book.kind === 'physical').length,
      digital: books.filter((book) => book.kind === 'digital').length,
      reading: reading.length, finished: finished.length, toRead: toRead.length,
    },
  }
}
