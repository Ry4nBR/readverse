import { Link } from 'react-router-dom'
import { useAppearance } from '../contexts/appearanceContext.js'
import { readingStatuses } from '../utils/bookForm.js'
import BookCover from './BookCover.jsx'
import styles from './BookDisplay.module.css'

export default function BookDisplay({ books }) {
  const { preferences } = useAppearance()

  return <ul className={styles.books} data-display={preferences.mode}>
    {books.map((book) => (
      <li key={book.id} className={styles.item}>
        <Link to={book.href} className={styles.entry}>
          <div className={styles.cover}><BookCover coverBlob={book.coverBlob} coverUrl={book.coverUrl} /></div>
          <strong>{book.title}</strong>
        </Link>
        <span className={styles.author}>{book.author}</span>
        <span className={styles.format}>{book.formatLabel}</span>
        <span className={styles.meta}>{[book.genre, readingStatuses[book.status]].filter(Boolean).join(' · ')}</span>
      </li>
    ))}
  </ul>
}
