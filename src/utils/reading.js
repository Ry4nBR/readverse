export const readingStatuses = { toRead: 'Quero ler', reading: 'Lendo', finished: 'Lido' }

export function localDate(date = new Date()) {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((value) => String(value).padStart(2, '0')).join('-')
}

export class ReadingError extends Error {}

export function readingOf(book) {
  const status = Object.hasOwn(readingStatuses, book?.status) ? book.status : 'toRead'
  const saved = book?.reading ?? {}
  return {
    status,
    startDate: saved.startDate ?? '',
    completedDate: status === 'finished' ? saved.completedDate ?? '' : '',
    rating: saved.rating ?? null,
    notes: saved.notes ?? '',
    progress: status === 'finished' ? 100 : status === 'toRead' ? 0 : saved.progress ?? 0,
  }
}

export function validReadingDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(value + 'T00:00:00Z')
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export function applyReading(book, changes, today = localDate()) {
  const previous = readingOf(book)
  const merged = { ...previous, ...changes }
  if (!Object.hasOwn(readingStatuses, merged.status)) throw new ReadingError('Escolha um status válido.')
  if (!Number.isInteger(merged.progress) || merged.progress < 0 || merged.progress > 100) {
    throw new ReadingError('Informe um progresso inteiro de 0 a 100%.')
  }
  if (merged.rating !== null && (!Number.isInteger(merged.rating) || merged.rating < 1 || merged.rating > 5)) {
    throw new ReadingError('Escolha uma avaliação de 1 a 5.')
  }
  if (typeof merged.notes !== 'string' || merged.notes.length > 5000) {
    throw new ReadingError('As observações podem ter até 5.000 caracteres.')
  }

  let { status, progress, startDate, completedDate } = merged
  if (status === 'reading') {
    if (previous.status === 'finished' && changes.progress === undefined) progress = 0
    if (!startDate && previous.status !== 'reading' && changes.startDate === undefined) startDate = today
    if (progress === 100) status = 'finished'
  }

  if (status === 'finished') {
    progress = 100
    if (!completedDate && previous.status !== 'finished') completedDate = today
  } else {
    completedDate = ''
    if (status === 'toRead') {
      startDate = ''
      progress = 0
    }
  }

  for (const date of [startDate, completedDate]) {
    if (date && (!validReadingDate(date) || date > today)) throw new ReadingError('Informe datas válidas que não estejam no futuro.')
  }
  if (startDate && completedDate && startDate > completedDate) {
    throw new ReadingError('A conclusão precisa ser na mesma data ou depois do início.')
  }
  return { status, reading: { startDate, completedDate, progress, rating: merged.rating, notes: merged.notes.trim() } }
}
