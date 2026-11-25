import { Link } from 'react-router-dom'
import { usePhysicalBook } from '../hooks/usePhysicalBook.js'
import styles from './PhysicalBook.module.css'

export default function PhysicalBookRecord({ id, children }) {
  const result = usePhysicalBook(id)

  if (result?.book) return children(result.book)

  return (
    <section className={styles.page}>
      <Link to="/biblioteca">Voltar para a estante</Link>
      {!result ? <p role="status">Carregando livro…</p> : result.error ? (
        <p role="alert" className={styles.error}>Não foi possível carregar este livro.</p>
      ) : <h1>Livro não encontrado</h1>}
    </section>
  )
}
