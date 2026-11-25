import { useEffect, useRef, useState } from 'react'
import { lookupBook } from '../services/bookLookup.js'
import { findPhysicalBookByIsbn } from '../services/physicalBooks.js'
import { isValidIsbn } from '../utils/isbn.js'
import styles from './PhysicalBook.module.css'

export default function IsbnLookup({ onResult, onLoadingChange, disabled }) {
  const [isbn, setIsbn] = useState('')
  const [feedback, setFeedback] = useState(null)
  const pending = useRef(null)

  useEffect(() => () => pending.current?.abort(), [])

  async function search() {
    if (pending.current || disabled) return
    if (!isValidIsbn(isbn)) {
      setFeedback({ error: true, text: 'Informe um ISBN-10 ou ISBN-13 válido.' })
      return
    }

    const controller = new AbortController()
    pending.current = controller
    onLoadingChange(true)
    setFeedback({ text: 'Pesquisando nos catálogos…' })
    try {
      const existing = await findPhysicalBookByIsbn(isbn)
      controller.signal.throwIfAborted()
      if (existing) {
        setFeedback({ error: true, text: 'Este ISBN já está cadastrado na estante.' })
        return
      }
      const result = await lookupBook(isbn, { signal: controller.signal })
      controller.signal.throwIfAborted()
      if (result) {
        onResult(result)
        setFeedback({ text: 'Livro encontrado. Confira os dados antes de salvar.' })
      } else {
        setFeedback({ text: 'Nenhum livro foi encontrado. Você pode preencher os dados manualmente.' })
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        setFeedback({ error: true, text: error.message.startsWith('A pesquisa') ? error.message :
          'Não foi possível verificar a estante para pesquisar o ISBN. Tente novamente.' })
      }
    } finally {
      pending.current = null
      if (!controller.signal.aborted) onLoadingChange(false)
    }
  }

  return (
    <fieldset className={styles.form} disabled={disabled}>
      <legend>Pesquisa por ISBN</legend>
      <div className={styles.fields}>
        <label>
          ISBN-10 ou ISBN-13
          <input value={isbn} autoComplete="off" onChange={(event) => {
            setIsbn(event.target.value)
            setFeedback(null)
          }} onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              void search()
            }
          }} />
        </label>
        <div className={styles.actions}>
          <button type="button" className={styles.secondary} onClick={search}>Pesquisar ISBN</button>
        </div>
      </div>
      {feedback && <p role={feedback.error ? 'alert' : 'status'} className={feedback.error ? styles.error : undefined}>
        {feedback.text}
      </p>}
    </fieldset>
  )
}
