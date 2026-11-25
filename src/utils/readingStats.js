import { readingOf, validReadingDate } from './reading.js'

export function completedInYear(finished, year) {
  return finished.filter(({ activity: { completedDate } }) =>
    validReadingDate(completedDate) && Number(completedDate.slice(0, 4)) === year,
  )
}

export function annualProgress(finished, year, goal) {
  const completed = completedInYear(finished, year).length
  return {
    completed, remaining: goal === null ? null : Math.max(0, goal - completed),
    percentage: goal === null ? null : Math.floor(completed / goal * 100),
  }
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
