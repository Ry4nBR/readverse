import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import PhysicalBookCard from '../components/PhysicalBookCard.jsx'
import styles from '../components/PhysicalBook.module.css'
import { listPhysicalBooks } from '../services/physicalBooks.js'

export default function PhysicalShelfPage() {
  const { state } = useLocation()
  const [books, setBooks] = useState(null)
  const [loadError, setLoadError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    listPhysicalBooks().then((entries) => {
      if (active) setBooks(entries.sort((a, b) => b.createdAt - a.createdAt))
    }, () => {
      if (active) setLoadError(true)
    })
    return () => { active = false }
  }, [attempt])

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
          <div><button type="button" className={styles.secondary} onClick={() => {
            setLoadError(false)
            setAttempt((current) => current + 1)
          }}>Tentar novamente</button></div>
        </div>
      ) : !books ? <p role="status">Carregando estante…</p> : books.length === 0 ? (
        <p className={styles.panel}>Sua estante está vazia. Cadastre um livro para começar.</p>
      ) : (
        <ul className={styles.shelf}>
          {books.map((book) => <li key={book.id}><PhysicalBookCard book={book} /></li>)}
        </ul>
      )}
    </section>
  )
}
