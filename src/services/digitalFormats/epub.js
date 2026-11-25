import { BlobReader, ZipReader } from '@zip.js/zip.js'

const containerPath = 'META-INF/container.xml'
const dcNamespace = 'http://purl.org/dc/elements/1.1/'
const archiveOrigin = 'https://epub.invalid'
const xmlLimit = 2 * 1024 * 1024

function archivePath(href, base = '') {
  if (!href || /^(?:[a-z][a-z\d+.-]*:|\/|\\)/i.test(href)) return ''
  const url = new URL(href, archiveOrigin + '/' + base.split('/').map(encodeURIComponent).join('/'))
  if (url.origin !== archiveOrigin) return ''
  return decodeURIComponent(url.pathname.slice(1))
}

async function readText(entry, limit, validateOnly = false) {
  if (!entry || entry.directory || entry.encrypted || entry.uncompressedSize > limit) {
    throw new Error('Entrada EPUB inválida.')
  }
  const chunks = []
  let length = 0
  await entry.getData(new WritableStream({
    write(chunk) {
      length += chunk.byteLength
      if (length > limit) throw new Error('A entrada EPUB excede o limite de análise.')
      if (!validateOnly) chunks.push(chunk)
    },
  }), { checkSignature: true, useWebWorkers: false })
  if (validateOnly) return ''
  const buffer = await new Blob(chunks).arrayBuffer()
  const prefix = new Uint8Array(buffer, 0, Math.min(2, length))
  const encoding = prefix[0] === 0xff && prefix[1] === 0xfe ? 'utf-16le' :
    prefix[0] === 0xfe && prefix[1] === 0xff ? 'utf-16be' : 'utf-8'
  return new TextDecoder(encoding, { fatal: true }).decode(buffer)
}

function parseXml(text, root) {
  const document = new DOMParser().parseFromString(text, 'application/xml')
  if (document.documentElement.localName !== root || document.getElementsByTagName('parsererror').length) {
    throw new Error('XML do EPUB inválido.')
  }
  return document
}

function values(node, name) {
  return [...node.getElementsByTagNameNS(dcNamespace, name)].map((entry) => entry.textContent.trim()).filter(Boolean)
}

export async function inspectEpub(file) {
  const reader = new ZipReader(new BlobReader(file))
  try {
    const entries = new Map()
    for await (const entry of reader.getEntriesGenerator()) {
      if (entries.size >= 10000 || entries.has(entry.filename)) throw new Error('Diretório EPUB inválido.')
      entries.set(entry.filename, entry)
    }
    if (await readText(entries.get('mimetype'), 32) !== 'application/epub+zip') {
      throw new Error('Tipo do contêiner EPUB inválido.')
    }

    const container = parseXml(await readText(entries.get(containerPath), xmlLimit), 'container')
    const rootfile = [...container.getElementsByTagNameNS('*', 'rootfile')].find(
      (node) => node.getAttribute('media-type') === 'application/oebps-package+xml',
    )
    const packagePath = archivePath(rootfile?.getAttribute('full-path'))
    const book = parseXml(await readText(entries.get(packagePath), xmlLimit), 'package')
    const manifest = new Map([...book.getElementsByTagNameNS('*', 'item')].map(
      (item) => [item.getAttribute('id'), archivePath(item.getAttribute('href'), packagePath)],
    ))
    const spine = [...book.getElementsByTagNameNS('*', 'itemref')]
    const content = spine.map((item) => entries.get(manifest.get(item.getAttribute('idref'))))
    if (!content.length || content.some((entry) => !entry || entry.directory)) {
      throw new Error('O EPUB está sem arquivos de leitura.')
    }
    const sample = content.find((entry) => !entry.encrypted && entry.uncompressedSize <= 8 * 1024 * 1024)
    if (sample) await readText(sample, 8 * 1024 * 1024, true)

    const metadata = book.getElementsByTagNameNS('*', 'metadata')[0]
    if (!metadata) return {}
    return {
      title: values(metadata, 'title')[0],
      author: values(metadata, 'creator').join(', '),
      genre: values(metadata, 'subject')[0],
      description: values(metadata, 'description')[0],
    }
  } finally {
    await reader.close()
  }
}
