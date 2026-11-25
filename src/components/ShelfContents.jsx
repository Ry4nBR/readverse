import BookDisplay from './BookDisplay.jsx'

export default function ShelfContents({ shelf, catalog }) {
  const books = shelf.books.map((key) => catalog.get(key)).filter(Boolean)
  if (!books.length) return <p>Estante vazia.</p>

  return <BookDisplay books={books} />
}
