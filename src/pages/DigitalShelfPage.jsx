import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import BookDisplay from '../components/BookDisplay.jsx'
import DisplayModeSelect from '../components/DisplayModeSelect.jsx'
import shared from '../components/PhysicalBook.module.css'
import { useBookRevision } from '../hooks/useBookRevision.js'
import { listDigitalBooks } from '../services/digitalBooks.js'
import { readingStatuses } from '../utils/bookForm.js'
import { searchKey } from '../utils/librarySearch.js'

export default function DigitalShelfPage() {
  const revision = useBookRevision()
  const { state } = useLocation()
  const [books, setBooks] = useState(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [query, setQuery] = useState('')
  const [format, setFormat] = useState('')
  const [status, setStatus] = useState('')
  const [genre, setGenre] = useState('')

  useEffect(() => {
    let active = true
    listDigitalBooks().then((result) => {
      if (active) setBooks(result.sort((a, b) => b.importedAt - a.importedAt))
    }, (failure) => {
      if (active) setError(failure.message)
    })
    return () => { active = false }
  }, [attempt, revision])

  const genres = new Map()
  for (const book of books ?? []) {
    if (book.genre) genres.set(searchKey(book.genre), book.genre)
  }
  const term = searchKey(query)
  const visible = books?.filter((book) =>
    (searchKey(book.title).includes(term) || searchKey(book.author).includes(term)) &&
    (!format || book.format === format) && (!status || book.status === status) &&
    (!genre || searchKey(book.genre) === genre),
  )

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
        <>
          <div className={shared.panel}>
            <div className={shared.fields}>
              <DisplayModeSelect />
              <label>
                Buscar por título ou autor
                <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
              </label>
              <label>
                Filtrar por formato
                <select value={format} onChange={(event) => setFormat(event.target.value)}>
                  <option value="">Todos os formatos</option>
                  {['pdf', 'epub', 'mobi'].map((type) => <option key={type} value={type}>{type.toUpperCase()}</option>)}
                </select>
              </label>
              <label>
                Filtrar por gênero
                <select value={genre} onChange={(event) => setGenre(event.target.value)}>
                  <option value="">Todos os gêneros</option>
                  {[...genres].sort(([, a], [, b]) => a.localeCompare(b, 'pt-BR')).map(([key, label]) =>
                    <option key={key} value={key}>{label}</option>,
                  )}
                </select>
              </label>
              <label>
                Filtrar por status
                <select value={status} onChange={(event) => setStatus(event.target.value)}>
                  <option value="">Todos os status</option>
                  {Object.entries(readingStatuses).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </select>
              </label>
            </div>
          </div>
          {visible.length ? <BookDisplay books={visible.map((book) => ({
            ...book, kind: 'digital', formatLabel: book.format.toUpperCase(), href: '/biblioteca-digital/' + book.id,
          }))} /> : <p className={shared.panel} role="status">Nenhum livro corresponde à busca e aos filtros.</p>}
        </>
      )}
    </section>
  )
}
