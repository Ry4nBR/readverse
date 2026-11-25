import { Link } from 'react-router-dom'
import shared from '../components/PhysicalBook.module.css'
import { useReadingCatalog } from '../hooks/useReadingCatalog.js'
import { validReadingDate } from '../utils/reading.js'
import { readingStats } from '../utils/readingStats.js'
import styles from './ReadingHistoryPage.module.css'

function ReadingDate({ value }) {
  if (!validReadingDate(value)) return 'Sem data registrada'
  return <time dateTime={value}>{value.split('-').reverse().join('/')}</time>
}

export default function ReadingHistoryPage() {
  const { books, error, retry } = useReadingCatalog()
  const finished = books ? readingStats(books).finished.sort((a, b) =>
    b.activity.completedDate.localeCompare(a.activity.completedDate) || a.title.localeCompare(b.title, 'pt-BR'),
  ) : []

  return <section className={shared.page}>
    <header className={shared.pageHeader}>
      <h1>Histórico de leitura</h1>
      <Link to="/">Voltar à visão geral</Link>
    </header>
    {error ? <div className={shared.panel}>
      <p role="alert" className={shared.error}>Não foi possível carregar o histórico.</p>
      <div><button type="button" className={shared.secondary} onClick={retry}>Tentar novamente</button></div>
    </div> : !books ? <p role="status">Carregando histórico…</p> :
      finished.length ? <ul className={styles.history}>
        {finished.map(({ key, title, author, formatLabel, href, activity }) => (
          <li key={key} className={shared.panel}>
            <div><h2><Link to={href}>{title}</Link></h2><p>{author} · {formatLabel}</p></div>
            <dl className={shared.metadata}>
              <div><dt>Início</dt><dd><ReadingDate value={activity.startDate} /></dd></div>
              <div><dt>Conclusão</dt><dd><ReadingDate value={activity.completedDate} /></dd></div>
              <div><dt>Avaliação</dt><dd>{activity.rating ? activity.rating + ' de 5' : 'Sem avaliação'}</dd></div>
            </dl>
          </li>
        ))}
      </ul> : <p className={shared.panel}>Marque um livro como “Lido” para vê-lo no histórico.</p>}
  </section>
}
