import { getDigitalBook, getDigitalFile, getMobiEpub, saveMobiEpub } from './digitalBooks.js'
import { detectDigitalFormat } from './digitalFile.js'

export function canReadDigitalBook(book) {
  return book.format === 'epub' || book.format === 'pdf' || (book.format === 'mobi' && book.mobiEpub === true)
}

export async function openReaderFile(id) {
  const book = await getDigitalBook(id)
  if (!book) throw new Error('Livro digital não encontrado.')
  if (!canReadDigitalBook(book)) throw new Error('Vincule uma versão EPUB convertida para abrir este MOBI.')
  const converted = book.format === 'mobi'
  const file = await (converted ? getMobiEpub(id) : getDigitalFile(id))
  if (!file?.size) throw new Error('O arquivo de leitura não está disponível no navegador.')
  const format = await detectDigitalFormat(file)
  if (format !== (converted ? 'epub' : book.format)) throw new Error('O formato do arquivo não corresponde ao cadastro.')
  return { book, file, format }
}

export async function attachMobiEpub(id, file) {
  if (await detectDigitalFormat(file) !== 'epub') throw new Error('Selecione a versão convertida no formato EPUB.')
  const { inspectEpub } = await import('./digitalFormats/epub.js')
  try {
    await inspectEpub(file)
  } catch {
    throw new Error('Não foi possível validar a estrutura do EPUB convertido.')
  }
  return saveMobiEpub(id, file)
}
