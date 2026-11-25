import BookCover from './BookCover.jsx'
import styles from './PhysicalBook.module.css'
import { readingStatuses } from '../utils/bookForm.js'

export default function PhysicalBookCard({ book }) {
  return (
    <article className={styles.card}>
      <BookCover coverBlob={book.coverBlob} coverUrl={book.coverUrl} />
      <div className={styles.cardInfo}>
        <h2>{book.title}</h2>
        <p>{book.author}</p>
        <p className={styles.cardMeta}>{book.genre || 'Sem gênero'} · {readingStatuses[book.status]}</p>
      </div>
    </article>
  )
}
