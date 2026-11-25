import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import PhysicalBookCard from '../components/PhysicalBookCard.jsx'
import styles from '../components/PhysicalBook.module.css'
import { usePhysicalBooks } from '../hooks/usePhysicalBooks.js'
import { readingStatuses } from '../utils/bookForm.js'

function searchKey(value) {
  return value.trim().toLocaleLowerCase('pt-BR').normalize('NFD').replace(/\p{M}/gu, '')
}

export default function PhysicalShelfPage() {
  const { state } = useLocation()
  const { books, loadError, retry } = usePhysicalBooks()
  const [query, setQuery] = useState('')
  const [genre, setGenre] = useState('')
  const [status, setStatus] = useState('')

  const genres = new Map()
  for (const book of books ?? []) {
    if (book.genre) genres.set(searchKey(book.genre), book.genre)
  }
  const term = searchKey(query)
  const visible = books?.filter((book) =>
    (searchKey(book.title).includes(term) || searchKey(book.author).includes(term)) &&
    (!genre || searchKey(book.genre) === genre) && (!status || book.status === status),
  )

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <h1>Meus livros</h1>
          <p>Estante de livros físicos</p>
        </div>
        <Link className={styles.primary} to="/cadastro">Cadastrar livro</Link>
      </header>
      {state?.notice && <p role="status">{state.notice}</p>}
      {loadError ? (
        <div className={styles.panel}>
          <p role="alert" className={styles.error}>Não foi possível carregar a estante neste navegador.</p>
          <div><button type="button" className={styles.secondary} onClick={retry}>Tentar novamente</button></div>
        </div>
      ) : !books ? <p role="status">Carregando estante…</p> : books.length === 0 ? (
        <p className={styles.panel}>Sua estante está vazia. Cadastre um livro para começar.</p>
      ) : (
        <>
          <div className={styles.panel}>
            <div className={styles.fields}>
              <label>
                Buscar por título ou autor
                <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
              </label>
              <label>
                Filtrar por gênero
                <select value={genre} onChange={(event) => setGenre(event.target.value)}>
                  <option value="">Todos os gêneros</option>
                  {[...genres].sort(([, a], [, b]) => a.localeCompare(b, 'pt-BR')).map(([key, label]) =>
                    <option value={key} key={key}>{label}</option>,
                  )}
                </select>
              </label>
              <label>
                Filtrar por status
                <select value={status} onChange={(event) => setStatus(event.target.value)}>
                  <option value="">Todos os status</option>
                  {Object.entries(readingStatuses).map(([key, label]) =>
                    <option value={key} key={key}>{label}</option>,
                  )}
                </select>
              </label>
            </div>
          </div>
          {visible.length ? (
            <ul className={styles.shelf}>
              {visible.map((book) => <li key={book.id}><PhysicalBookCard book={book} /></li>)}
            </ul>
          ) : <p role="status" className={styles.panel}>Nenhum livro corresponde à busca e aos filtros.</p>}
        </>
      )}
    </section>
  )
}
