import { DuplicateDigitalBookError, hasDigitalFile } from './digitalBooks.js'
import { detectDigitalFormat, digitalFileHash } from './digitalFile.js'

const inspect = {
  pdf: async (bytes) => (await import('./digitalFormats/pdf.js')).inspectPdf(bytes),
  epub: async (_bytes, file) => (await import('./digitalFormats/epub.js')).inspectEpub(file),
  mobi: async (bytes) => (await import('./digitalFormats/mobi.js')).inspectMobi(bytes),
}

export async function prepareDigitalFile(file, { pendingHashes, onPhase } = {}) {
  const format = await detectDigitalFormat(file)
  onPhase?.('Lendo o arquivo e verificando duplicidade…')
  const bytes = new Uint8Array(await file.arrayBuffer())
  const hash = await digitalFileHash(bytes)
  if (pendingHashes?.has(hash) || await hasDigitalFile(hash)) throw new DuplicateDigitalBookError()

  onPhase?.('Verificando a estrutura e extraindo metadados…')
  try {
    const metadata = await inspect[format](bytes, file)
    return { file, hash, format, metadata }
  } catch (error) {
    throw new Error('O arquivo ' + format.toUpperCase() + ' está corrompido ou tem uma estrutura incompatível.', { cause: error })
  }
}
