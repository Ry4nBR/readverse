import { useId, useRef, useState } from 'react'
import styles from './PhysicalBook.module.css'

export default function DeleteBookDialog({ title, description, onDelete, disabled, action = 'Excluir livro', question = 'Excluir livro?', failure = 'Não foi possível excluir o livro. Tente novamente.' }) {
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
      dialog.current?.close()
      setDeleting(false)
    } catch {
      setError(failure)
      setDeleting(false)
    }
  }

  return (
    <>
      <button type="button" className={styles.danger} disabled={disabled} onClick={() => {
        setError('')
        dialog.current.showModal()
      }}>{action}</button>
      <dialog ref={dialog} className={styles.dialog} aria-labelledby={titleId}
        onCancel={(event) => { if (deleting) event.preventDefault() }}>
        <h2 id={titleId}>{question}</h2>
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
