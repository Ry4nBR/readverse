export function readerPosition(format, value) {
  if (format === 'pdf' && Number.isInteger(value) && value >= 1) return { format, page: value }
  if (format === 'epub' && typeof value === 'string' && /^epubcfi\(.+\)$/.test(value) && value.length <= 4096) {
    return { format, cfi: value }
  }
  throw new Error('Posição de leitura inválida.')
}

export function readerProgress(previous, percentage) {
  if (!Number.isFinite(percentage)) return Math.min(previous, 99)
  return Math.max(Math.min(previous, 99), Math.min(99, Math.floor(percentage)))
}
