import { Link } from 'react-router-dom'
import styles from './SectionPage.module.css'

export default function NotFoundPage() {
  return (
    <section className={styles.section}>
      <h1>Página não encontrada</h1>
      <Link to="/">Voltar para a visão geral</Link>
    </section>
  )
}
