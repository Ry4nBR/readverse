import { createElement } from 'react'
import { BookMarked, BookOpen, CheckCircle2, LibraryBig, Tablet } from 'lucide-react'
import { Link } from 'react-router-dom'
import AnnualReadingGoal from '../components/AnnualReadingGoal.jsx'
import ReadingBarChart from '../components/ReadingBarChart.jsx'
import DashboardBookList from '../components/DashboardBookList.jsx'
import shared from '../components/PhysicalBook.module.css'
import { useReadingCatalog } from '../hooks/useReadingCatalog.js'
import { monthlyCompletions, readingStats } from '../utils/readingStats.js'
import styles from './DashboardPage.module.css'

const summary = [
  { label: 'Livros físicos', icon: LibraryBig, key: 'physical' },
  { label: 'Livros digitais', icon: Tablet, key: 'digital' },
  { label: 'Livros lidos', icon: CheckCircle2, key: 'finished' },
  { label: 'Em andamento', icon: BookOpen, key: 'reading' },
  { label: 'Quero ler', icon: BookMarked, key: 'toRead' },
]

const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function DashboardStats({ books }) {
  const { counts, reading, finished, toRead, recent } = readingStats(books)
  const year = new Date().getFullYear()
  const monthly = monthlyCompletions(finished, year).map((value, index) => ({ key: index, label: months[index], value }))
  return <>
    <dl className={styles.summary} aria-label="Resumo da biblioteca">
      {summary.map(({ label, icon, key }) => (
        <div key={key} className={styles.card}>
          <dt>{createElement(icon, { size: 18, 'aria-hidden': true })} {label}</dt>
          <dd>{counts[key]}</dd>
        </div>
      ))}
    </dl>
    <AnnualReadingGoal finished={finished} year={year} />
    <div className={styles.lists}>
      <DashboardBookList title="Livros em andamento" books={reading} empty="Nenhum livro marcado como “Lendo”." showProgress />
      <DashboardBookList title="Livros que quero ler" books={toRead} empty="Nenhum livro na lista de próximas leituras." />
      <DashboardBookList title="Últimos livros adicionados" books={recent.slice(0, 6)} empty="Sua biblioteca está vazia." />
    </div>
    <ReadingBarChart title={'Livros lidos por mês · ' + year} items={monthly} empty="Nenhuma conclusão com data neste ano." />
  </>
}

export default function DashboardPage() {
  const { books, error, retry } = useReadingCatalog()
  return (
    <div className={styles.dashboard + ' ' + shared.page}>
      <header className={styles.intro}>
        <h1>Visão geral</h1>
        <p>Organize seus livros e acompanhe suas leituras.</p>
      </header>
      <nav className={styles.libraries} aria-label="Estantes">
        <Link to="/biblioteca" className={styles.library}>
          <LibraryBig size={22} aria-hidden="true" />
          Estante física
        </Link>
        <Link to="/biblioteca-digital" className={styles.library}>
          <BookOpen size={22} aria-hidden="true" />
          Estante digital
        </Link>
        <Link to="/leituras" className={styles.library}>
          <CheckCircle2 size={22} aria-hidden="true" />
          Histórico de leitura
        </Link>
      </nav>
      {error ? <section className={styles.listPanel}>
        <p role="alert">Não foi possível carregar o resumo da biblioteca.</p>
        <div><button className={shared.secondary} type="button" onClick={retry}>Tentar novamente</button></div>
      </section> : !books ? <p role="status">Carregando resumo da biblioteca…</p> : <DashboardStats books={books} />}
    </div>
  )
}
