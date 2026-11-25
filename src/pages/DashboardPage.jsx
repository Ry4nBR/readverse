import { createElement } from 'react'
import { BookOpen, CheckCircle2, LibraryBig } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePhysicalBooks } from '../hooks/usePhysicalBooks.js'
import styles from './DashboardPage.module.css'

const summary = [
  { label: 'Na biblioteca', icon: LibraryBig, key: 'all' },
  { label: 'Em leitura', icon: BookOpen, key: 'reading' },
  { label: 'Concluídos', icon: CheckCircle2, key: 'finished' },
]

export default function DashboardPage() {
  const { books, loadError } = usePhysicalBooks()
  const reading = books?.filter(({ status }) => status === 'reading')
  const counts = { all: books?.length, reading: reading?.length, finished: books?.filter(({ status }) => status === 'finished').length }
  return (
    <div className={styles.dashboard}>
      <header className={styles.intro}>
        <h1>Visão geral</h1>
        <p>Organize seus livros e acompanhe suas leituras.</p>
      </header>
      {loadError ? <p role="alert">Não foi possível carregar o resumo da estante.</p> : !books ? (
        <p role="status">Carregando resumo da estante…</p>
      ) : <>
      <dl className={styles.summary} aria-label="Resumo da biblioteca">
        {summary.map(({ label, icon, key }) => (
          <div key={label} className={styles.card}>
            <dt>{createElement(icon, { size: 18, 'aria-hidden': true })} {label}</dt>
            <dd>{counts[key]}</dd>
          </div>
        ))}
      </dl>
      <section className={styles.empty} aria-labelledby="em-leitura">
        <BookOpen size={30} aria-hidden="true" />
        <h2 id="em-leitura">Livros em leitura</h2>
        {reading.length ? <ul className={styles.readingList}>
          {reading.map((book) => <li key={book.id}><Link to={'/biblioteca/' + book.id}>{book.title}</Link></li>)}
        </ul> : <p>Nenhum livro marcado como “Lendo”.</p>}
      </section>
      </>}
    </div>
  )
}
