import { listDigitalBooks } from './digitalBooks.js'
import { listPhysicalBooks } from './physicalBooks.js'

export async function listShelfBooks() {
  const [physical, digital] = await Promise.all([listPhysicalBooks(), listDigitalBooks()])
  return [
    ...physical.map((book) => ({ ...book, key: 'physical:' + book.id, formatLabel: 'Físico', href: '/biblioteca/' + book.id })),
    ...digital.map((book) => ({ ...book, key: 'digital:' + book.id, formatLabel: book.format.toUpperCase(), href: '/biblioteca-digital/' + book.id })),
  ].sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'))
}
