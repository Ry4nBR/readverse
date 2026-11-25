import { Link, useLocation, useParams } from 'react-router-dom'
import BookCover from '../components/BookCover.jsx'
import PhysicalBookRecord from '../components/PhysicalBookRecord.jsx'
import styles from '../components/PhysicalBook.module.css'
import { readingStatuses } from '../utils/bookForm.js'

function BookDetails({ book }) {
  const { state } = useLocation()
  const rows = [
    ['Editora', book.publisher], ['Ano de publicação', book.year], ['ISBN', book.isbn],
    ['Gênero', book.genre], ['Status de leitura', readingStatuses[book.status]],
  ].filter(([, value]) => value)

  return (
    <section className={styles.page}>
      <Link to="/biblioteca">Voltar para a estante</Link>
      {state?.notice && <p role="status">{state.notice}</p>}
      <article className={styles.panel}>
        <div className={styles.detailsHeader}>
          <BookCover coverBlob={book.coverBlob} coverUrl={book.coverUrl} />
          <div>
            <h1>{book.title}</h1>
            <p>{book.author}</p>
          </div>
        </div>
        <dl className={styles.metadata}>
          {rows.map(([label, value]) => (
            <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
          ))}
        </dl>
        {book.description && <section>
          <h2>Descrição</h2>
          <p className={styles.description}>{book.description}</p>
        </section>}
        <div className={styles.actions}>
          <Link className={styles.secondary} to="editar">Editar livro</Link>
        </div>
      </article>
    </section>
  )
}

export default function PhysicalBookDetailsPage() {
  const { bookId } = useParams()
  return <PhysicalBookRecord id={bookId}>{(book) => <BookDetails book={book} />}</PhysicalBookRecord>
}
