import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import BookCover from '../components/BookCover.jsx'
import shared from '../components/PhysicalBook.module.css'
import styles from '../components/DigitalLibrary.module.css'
import { listDigitalBooks } from '../services/digitalBooks.js'
import { readingStatuses } from '../utils/bookForm.js'

export default function DigitalShelfPage() {
  const { state } = useLocation()
  const [books, setBooks] = useState(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    listDigitalBooks().then((result) => {
      if (active) setBooks(result.sort((a, b) => b.importedAt - a.importedAt))
    }, (failure) => {
      if (active) setError(failure.message)
    })
    return () => { active = false }
  }, [attempt])

  return (
    <section className={shared.page}>
      <header className={shared.pageHeader}>
        <div>
          <h1>Estante digital</h1>
          <p>Seus livros em PDF, EPUB e MOBI.</p>
        </div>
        <Link className={shared.primary} to="/importacao">Importar arquivos</Link>
      </header>
      {state?.notice && <p role="status">{state.notice}</p>}
      {error ? (
        <div className={shared.panel}>
          <p className={shared.error} role="alert">{error}</p>
          <div><button type="button" className={shared.secondary} onClick={() => {
            setError('')
            setAttempt((current) => current + 1)
          }}>Tentar novamente</button></div>
        </div>
      ) : !books ? <p role="status">Carregando estante digital…</p> : books.length === 0 ? (
        <p className={shared.panel}>Sua estante digital está vazia. Importe um arquivo para começar.</p>
      ) : (
        <ul className={shared.shelf}>
          {books.map((book) => (
            <li key={book.id}>
              <article className={shared.card}>
                <BookCover coverBlob={book.coverBlob} />
                <div className={shared.cardInfo}>
                  <span className={styles.format}>{book.format.toUpperCase()}</span>
                  <h2>{book.title}</h2>
                  <p>{book.author}</p>
                  <p className={shared.cardMeta}>{readingStatuses[book.status]}{book.genre && ' · ' + book.genre}</p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
