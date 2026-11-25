import { getDigitalBook, getDigitalFile } from './digitalBooks.js'
import { detectDigitalFormat } from './digitalFile.js'

export function canReadDigitalBook(book) {
  return book.format === 'epub'
}

export async function openReaderFile(id) {
  const book = await getDigitalBook(id)
  if (!book) throw new Error('Livro digital não encontrado.')
  if (!canReadDigitalBook(book)) throw new Error('Este formato ainda não pode ser aberto no leitor.')
  const file = await getDigitalFile(id)
  if (!file?.size) throw new Error('O arquivo original não está disponível no navegador.')
  const format = await detectDigitalFormat(file)
  if (format !== book.format) throw new Error('O formato do arquivo não corresponde ao cadastro.')
  return { book, file, format }
}
