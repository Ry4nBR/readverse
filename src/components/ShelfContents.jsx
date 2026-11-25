import { Link } from 'react-router-dom'

export default function ShelfContents({ shelf, catalog }) {
  const books = shelf.books.map((key) => catalog.get(key)).filter(Boolean)
  if (!books.length) return <p>Estante vazia.</p>

  return <ul>
    {books.map((book) => <li key={book.key}>
      <Link to={book.href}>{book.title}</Link> · {book.formatLabel}
    </li>)}
  </ul>
}
