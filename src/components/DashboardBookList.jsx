import { Link } from 'react-router-dom'
import styles from '../pages/DashboardPage.module.css'

export default function DashboardBookList({ title, books, empty, showProgress = false }) {
  return (
    <section className={styles.listPanel}>
      <h2>{title}</h2>
      {books.length ? <ul className={styles.readingList}>
        {books.map((book) => <li key={book.key}>
          <Link to={book.href}>{book.title}</Link>
          <span>{book.formatLabel}{showProgress && ' · ' + book.activity.progress + '%'}</span>
        </li>)}
      </ul> : <p>{empty}</p>}
    </section>
  )
}
