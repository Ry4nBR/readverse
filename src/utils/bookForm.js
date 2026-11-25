import { isValidIsbn } from './isbn.js'

export const readingStatuses = {
  toRead: 'Quero ler',
  reading: 'Lendo',
  finished: 'Concluído',
}

export const emptyBook = {
  title: '', author: '', publisher: '', isbn: '', year: '', description: '',
  genre: '', status: 'toRead', coverUrl: '', coverBlob: null,
}

export function validateBookForm(book) {
  if (!book.title.trim() || !book.author.trim()) return 'Preencha o título e o autor.'
  if (book.isbn.trim() && !isValidIsbn(book.isbn)) return 'Informe um ISBN-10 ou ISBN-13 válido.'
  if (book.year.trim() && !/^[1-9]\d{3}$/.test(book.year.trim())) return 'Informe um ano com quatro dígitos.'
  return ''
}
