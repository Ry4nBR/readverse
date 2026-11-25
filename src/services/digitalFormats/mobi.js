import { ascii } from '../digitalFile.js'

function readExth(view, bytes, offset, limit, decode) {
  if (offset + 12 > limit || ascii(bytes, offset, offset + 4) !== 'EXTH') return {}
  const end = offset + view.getUint32(offset + 4)
  const count = view.getUint32(offset + 8)
  if (end > limit || end < offset + 12 || count > (end - offset - 12) / 8) return {}
  const fields = { 100: 'author', 103: 'description', 105: 'genre', 503: 'title' }
  const result = {}
  let cursor = offset + 12
  for (let index = 0; index < count && cursor + 8 <= end; index++) {
    const field = fields[view.getUint32(cursor)]
    const length = view.getUint32(cursor + 4)
    if (length < 8 || cursor + length > end) break
    if (field) {
      const value = decode(bytes.subarray(cursor + 8, cursor + Math.min(length, 65544)))
      if (value) result[field] = field === 'author' && result[field] ? result[field] + ', ' + value : value
    }
    cursor += length
  }
  return result
}

export function inspectMobi(bytes) {
  const invalid = () => new Error('Estrutura do arquivo MOBI inválida.')
  if (bytes.length < 94 || ascii(bytes, 60, 68) !== 'BOOKMOBI') throw invalid()
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const count = view.getUint16(76)
  const tableEnd = 78 + count * 8
  if (count < 2 || tableEnd >= bytes.length) throw invalid()

  let previous = tableEnd - 1
  for (let index = 0; index < count; index++) {
    const offset = view.getUint32(78 + index * 8)
    if (offset <= previous || offset >= bytes.length) throw invalid()
    previous = offset
  }
  const first = view.getUint32(78)
  const second = view.getUint32(86)
  if (first + 24 > second || ascii(bytes, first + 16, first + 20) !== 'MOBI') throw invalid()
  const headerLength = view.getUint32(first + 20)
  const headerEnd = first + 16 + headerLength
  if (headerLength < 24 || headerEnd > second || view.getUint16(first + 8) > count - 1) throw invalid()

  const encoding = view.getUint32(first + 28) === 1252 ? 'windows-1252' : 'utf-8'
  const decoder = new TextDecoder(encoding)
  const decode = (value) => decoder.decode(value).replaceAll('\0', '').trim()
  const result = readExth(view, bytes, headerEnd, second, decode)
  if (!result.title && headerLength >= 76) {
    const titleStart = first + view.getUint32(first + 84)
    const length = view.getUint32(first + 88)
    if (titleStart >= headerEnd && titleStart + length <= second && length <= 65536) {
      result.title = decode(bytes.subarray(titleStart, titleStart + length))
    }
  }
  return result
}
