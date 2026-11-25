import { updateDigitalReading } from './digitalBooks.js'
import { updatePhysicalReading } from './physicalBooks.js'

// A atualização parcial também permite que o leitor digital envie apenas o progresso.
export function updateBookReading(kind, id, changes) {
  if (kind === 'digital') return updateDigitalReading(id, changes)
  if (kind === 'physical') return updatePhysicalReading(id, changes)
  throw new Error('Tipo de livro inválido.')
}
