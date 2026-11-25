import { useId, useRef, useState } from 'react'
import styles from './PhysicalBook.module.css'

export default function DeleteBookDialog({ title, description, onDelete }) {
  const dialog = useRef(null)
  const titleId = useId()
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  async function remove() {
    if (deleting) return
    setDeleting(true)
    setError('')
    try {
      await onDelete()
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
      <dialog ref={dialog} className={styles.dialog} aria-labelledby={titleId}
        onCancel={(event) => { if (deleting) event.preventDefault() }}>
        <h2 id={titleId}>Excluir livro?</h2>
        <p>“{title}” {description}</p>
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
