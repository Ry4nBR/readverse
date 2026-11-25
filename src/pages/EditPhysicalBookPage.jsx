import { useNavigate, useParams } from 'react-router-dom'
import PhysicalBookForm from '../components/PhysicalBookForm.jsx'
import PhysicalBookRecord from '../components/PhysicalBookRecord.jsx'
import styles from '../components/PhysicalBook.module.css'
import { savePhysicalBook } from '../services/physicalBooks.js'

export default function EditPhysicalBookPage() {
  const { bookId } = useParams()
  const navigate = useNavigate()
  const details = '/biblioteca/' + bookId

  async function save(book) {
    await savePhysicalBook(book, bookId)
    navigate(details, { replace: true, state: { notice: 'Livro atualizado.' } })
  }

  return (
    <PhysicalBookRecord id={bookId}>{(book) => (
      <section className={styles.page}>
        <h1>Editar livro</h1>
        <PhysicalBookForm key={bookId} initialBook={book} onSave={save} cancelTo={details} />
      </section>
    )}</PhysicalBookRecord>
  )
}
