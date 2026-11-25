import shared from './PhysicalBook.module.css'
import styles from './ReadingBarChart.module.css'

export default function ReadingBarChart({ title, items, empty }) {
  const max = items.reduce((highest, { value }) => Math.max(highest, value), 0)

  return <section className={shared.panel}>
    <h2>{title}</h2>
    {max ? <ul className={styles.chart}>
      {items.map(({ key, label, value }) => (
        <li key={key} className={styles.row}>
          <span>{label}</span><strong>{value}</strong>
          <div className={styles.track} aria-hidden="true">
            <div className={styles.bar} style={{ width: value / max * 100 + '%' }} />
          </div>
        </li>
      ))}
    </ul> : <p>{empty}</p>}
  </section>
}
