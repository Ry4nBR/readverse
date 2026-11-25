import { Link } from 'react-router-dom'
import styles from './Reader.module.css'

export default function ReaderShell({ book, children }) {
  return <main className={styles.shell}>
    <header className={styles.header}>
      <Link to={'/biblioteca-digital/' + book.id}>Voltar ao livro</Link>
      <h1>{book.title}</h1>
    </header>
    {children}
  </main>
}
