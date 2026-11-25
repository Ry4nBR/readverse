import { useNavigate, useParams } from 'react-router-dom'
import DigitalBookForm from '../components/DigitalBookForm.jsx'
import DigitalBookRecord from '../components/DigitalBookRecord.jsx'
import shared from '../components/PhysicalBook.module.css'
import { updateDigitalBook } from '../services/digitalBooks.js'

export default function EditDigitalBookPage() {
  const { bookId } = useParams()
  const navigate = useNavigate()
  const details = '/biblioteca-digital/' + bookId

  async function save(metadata) {
    await updateDigitalBook(bookId, metadata)
    navigate(details, { replace: true, state: { notice: 'Livro digital atualizado.' } })
  }

  return (
    <DigitalBookRecord id={bookId}>{(book) => (
      <section className={shared.page}>
        <h1>Editar livro digital</h1>
        <DigitalBookForm key={bookId} initialBook={book} onSave={save} onCancel={() => navigate(details)} />
      </section>
    )}</DigitalBookRecord>
  )
}
