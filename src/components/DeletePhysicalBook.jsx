import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deletePhysicalBook } from '../services/physicalBooks.js'
import styles from './PhysicalBook.module.css'

export default function DeletePhysicalBook({ book }) {
  const dialog = useRef(null)
  const navigate = useNavigate()
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  async function remove() {
    if (deleting) return
    setDeleting(true)
    setError('')
    try {
      await deletePhysicalBook(book.id)
      navigate('/biblioteca', { replace: true, state: { notice: 'Livro excluído.' } })
    } catch {
      setError('Não foi possível excluir o livro. Tente novamente.')
      setDeleting(false)
    }
  }

  return (
    <>
      <button type="button" className={styles.danger} onClick={() => {
        setError('')
        dialog.current.showModal()
      }}>Excluir livro</button>
      <dialog ref={dialog} className={styles.dialog} aria-labelledby="delete-title"
        onCancel={(event) => { if (deleting) event.preventDefault() }}>
        <h2 id="delete-title">Excluir livro?</h2>
        <p>“{book.title}” será removido da sua estante.</p>
        {error && <p role="alert" className={styles.error}>{error}</p>}
        <div className={styles.actions}>
          <button type="button" autoFocus className={styles.secondary} disabled={deleting}
            onClick={() => dialog.current.close()}>Cancelar</button>
          <button type="button" className={styles.danger} disabled={deleting} onClick={remove}>
            {deleting ? 'Excluindo…' : 'Confirmar exclusão'}
          </button>
        </div>
      </dialog>
    </>
  )
}
