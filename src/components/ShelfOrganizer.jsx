import { useState } from 'react'
import shared from './PhysicalBook.module.css'

export default function ShelfOrganizer({ books, shelves, busy, onMove }) {
  const [bookKey, setBookKey] = useState('')
  const [destination, setDestination] = useState(null)
  const current = shelves.find((shelf) => shelf.books.includes(bookKey))?.id ?? ''
  const target = destination ?? current
  const validTarget = target === '' || shelves.some((shelf) => shelf.id === target)

  return (
    <form className={shared.panel} onSubmit={async (event) => {
      event.preventDefault()
      if (await onMove(bookKey, target)) setDestination(null)
    }}>
      <h2>Organizar livros</h2>
      <div className={shared.fields}>
        <label>Livro
          <select required value={bookKey} disabled={busy} onChange={(event) => {
            setBookKey(event.target.value)
            setDestination(null)
          }}>
            <option value="">Selecione um livro</option>
            {books.map((book) => <option key={book.key} value={book.key}>
              {book.title} · {book.author} ({book.formatLabel})
            </option>)}
          </select>
        </label>
        <label>Estante de destino
          <select value={validTarget ? target : current} disabled={busy || !bookKey}
            onChange={(event) => setDestination(event.target.value)}>
            <option value="">Sem estante personalizada</option>
            {shelves.map((shelf) => <option key={shelf.id} value={shelf.id}>{shelf.name}</option>)}
          </select>
        </label>
      </div>
      <div className={shared.actions}>
        <button type="submit" className={shared.primary} disabled={busy || !bookKey || !validTarget || current === target}>
          Mover livro
        </button>
      </div>
    </form>
  )
}
