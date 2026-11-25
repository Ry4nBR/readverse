import { useNavigate } from 'react-router-dom'
import { deletePhysicalBook } from '../services/physicalBooks.js'
import DeleteBookDialog from './DeleteBookDialog.jsx'

export default function DeletePhysicalBook({ book }) {
  const navigate = useNavigate()

  async function remove() {
    await deletePhysicalBook(book.id)
    navigate('/biblioteca', { replace: true, state: { notice: 'Livro excluído.' } })
  }

  return <DeleteBookDialog title={book.title} description="será removido da sua estante." onDelete={remove} />
}
