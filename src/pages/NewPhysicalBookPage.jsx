import { useNavigate } from 'react-router-dom'
import PhysicalBookForm from '../components/PhysicalBookForm.jsx'
import styles from '../components/PhysicalBook.module.css'
import { savePhysicalBook } from '../services/physicalBooks.js'

export default function NewPhysicalBookPage() {
  const navigate = useNavigate()
  async function save(book) {
    await savePhysicalBook(book)
    navigate('/biblioteca', { state: { notice: 'Livro cadastrado.' } })
  }

  return (
    <section className={styles.page}>
      <h1>Cadastrar livro</h1>
      <PhysicalBookForm allowLookup onSave={save} />
    </section>
  )
}
