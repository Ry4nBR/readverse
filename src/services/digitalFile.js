export const maxDigitalFileSize = 100 * 1024 * 1024
export const digitalFileAccept = '.pdf,.epub,.mobi'
const allowedTypes = {
  pdf: ['application/pdf'],
  epub: ['application/epub+zip', 'application/zip', 'application/x-zip-compressed'],
  mobi: ['application/x-mobipocket-ebook', 'application/vnd.amazon.ebook', 'application/x-mobi'],
}

export function ascii(bytes, start = 0, end = bytes.length) {
  return String.fromCharCode(...bytes.subarray(start, end))
}

export async function detectDigitalFormat(file) {
  const format = file.name.toLowerCase().split('.').at(-1)
  if (!file.name.includes('.') || !Object.hasOwn(allowedTypes, format)) {
    throw new Error('Selecione um arquivo PDF, EPUB ou MOBI.')
  }
  if (!file.size || file.size > maxDigitalFileSize) {
    throw new Error('O arquivo precisa ter conteúdo e ocupar até 100 MB.')
  }
  if (file.type && file.type !== 'application/octet-stream' && !allowedTypes[format].includes(file.type)) {
    throw new Error('O tipo informado pelo arquivo não corresponde à extensão.')
  }

  const header = new Uint8Array(await file.slice(0, 1024).arrayBuffer())
  let valid = false
  if (format === 'pdf') {
    const tail = new Uint8Array(await file.slice(-4096).arrayBuffer())
    valid = /%PDF-\d\.\d/.test(ascii(header)) && /%%EOF[\s\0]*$/.test(ascii(tail))
  }
  if (format === 'epub') valid = ascii(header, 0, 4) === 'PK\x03\x04'
  if (format === 'mobi') valid = ascii(header, 60, 68) === 'BOOKMOBI'

  if (!valid) throw new Error('O conteúdo não corresponde a um arquivo ' + format.toUpperCase() + ' válido.')
  return format
}

export async function digitalFileHash(bytes) {
  const hash = await globalThis.crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(hash), (value) => value.toString(16).padStart(2, '0')).join('')
}
