import styles from './SectionPage.module.css'

export default function SectionPage({ title }) {
  return (
    <section className={styles.section}>
      <h1>{title}</h1>
      <p>Esta seção será disponibilizada em uma próxima etapa.</p>
    </section>
  )
}
