import { createElement } from 'react'
import { BookOpen, CheckCircle2, LibraryBig } from 'lucide-react'
import styles from './DashboardPage.module.css'

const summary = [
  { label: 'Na biblioteca', icon: LibraryBig },
  { label: 'Em leitura', icon: BookOpen },
  { label: 'Concluídos', icon: CheckCircle2 },
]

export default function DashboardPage() {
  return (
    <div className={styles.dashboard}>
      <header className={styles.intro}>
        <h1>Visão geral</h1>
        <p>Organize seus livros e acompanhe suas leituras.</p>
      </header>
      <dl className={styles.summary} aria-label="Resumo da biblioteca">
        {summary.map(({ label, icon }) => (
          <div key={label} className={styles.card}>
            <dt>{createElement(icon, { size: 18, 'aria-hidden': true })} {label}</dt>
            <dd>0</dd>
          </div>
        ))}
      </dl>
      <section className={styles.empty} aria-labelledby="recentes">
        <BookOpen size={30} aria-hidden="true" />
        <h2 id="recentes">Leituras recentes</h2>
        <p>Suas leituras aparecerão aqui quando você começar um livro.</p>
      </section>
    </div>
  )
}
